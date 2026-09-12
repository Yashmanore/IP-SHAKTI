import os
import sys
import uuid
import json
import psycopg2
from psycopg2.extras import execute_values
from fastembed import TextEmbedding

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==============================================================================
# IP-SHAKTI Structured JSON Knowledge Ingestion Engine
# Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
# Destination: Neon PostgreSQL + pgvector (Table: legal_document_embeddings)
# ==============================================================================

NEON_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_4rwHVRYI6bnj@ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
)
JSON_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "raw", "json")
TABLE_NAME = "legal_document_embeddings"
EMBEDDING_DIM = 384

def format_tkdl_record(item):
    refs = [ref['treatise'] + ' (' + ref['section'] + ')' for ref in item['classical_references']]
    treatises_str = ', '.join(refs)
    text = (
        f"[TKDL Knowledge Base | Plant: {item['sanskrit_name']} | IPC Subclass: {item['tkrc_ipc_code']}]\n"
        f"Botanical Binomial: {item['botanical_name']} (Family: {item['family']}).\n"
        f"Common Names: {', '.join(item['common_names'])}.\n"
        f"Classical Treatises: {treatises_str}.\n"
        f"Traditional Indications: {', '.join(item['traditional_indications'])}.\n"
        f"Classical Formulations: {', '.join(item['classical_formulations'])}.\n"
        f"Section 3(p) Prior Art Warning: {item['section_3p_prior_art_trigger']}\n"
        f"Patentable Window: {item['patentable_innovation_window']}"
    )
    meta = {
        "jurisdiction": "INDIA",
        "category": "TKDL",
        "doc_title": "Traditional Knowledge Resource Classification (TKRC)",
        "source_file": "data/raw/json/tkdl_tkrc_taxonomy.json",
        "record_id": item["id"],
        "plant_name": item["sanskrit_name"],
        "botanical_name": item["botanical_name"],
        "ipc_code": item["tkrc_ipc_code"]
    }
    return text, meta

def format_trademark_record(item):
    text = (
        f"[Trade Marks Registry Nice Classification | Class {item['class_number']} ({item['ayush_applicability']})]\n"
        f"Heading: {item['class_heading']}\n"
        f"Covered AYUSH Goods: {'; '.join(item['covered_goods'])}\n"
        f"Filing Rules & Common Pitfalls: {' '.join(item['trademark_rules_and_pitfalls'])}"
    )
    meta = {
        "jurisdiction": "INDIA",
        "category": "TRADEMARK",
        "doc_title": "Nice Classification Guide for AYUSH Goods",
        "source_file": "data/raw/json/trademark_nice_classification.json",
        "class_number": item["class_number"],
        "ayush_applicability": item["ayush_applicability"]
    }
    return text, meta

def format_gi_record(item):
    text = (
        f"[GI Registry India | Geographical Indication: {item['gi_name']} (GI Application No: {item['gi_app_number']})]\n"
        f"State/Region of Origin: {item['state_origin']}.\n"
        f"Botanical Identity: {item['botanical_identity']}.\n"
        f"Ayurvedic Significance: {item['ayurvedic_significance']}\n"
        f"Statutory Protection Rules: {item['protection_rules']}"
    )
    meta = {
        "jurisdiction": "INDIA",
        "category": "GI",
        "doc_title": "Registered Indian Ayurvedic & Herbal Geographical Indications",
        "source_file": "data/raw/json/registered_ayurvedic_gis.json",
        "gi_app_number": item["gi_app_number"],
        "gi_name": item["gi_name"],
        "state_origin": item["state_origin"]
    }
    return text, meta

def format_sugam_record(item):
    text = (
        f"[Regulatory Checklist | Category: {item['category']} | Form: {item['form_name']}]\n"
        f"Licensing Portal: {item['portal']}.\n"
        f"Statutory Reference: {item['statutory_reference']}.\n"
        f"Scope: {item['description']}\n"
        f"Mandatory Dossier Checklist: {'; '.join(item['mandatory_dossier_requirements'])}\n"
        f"Statutory Fee: {item['fee_structure_inr']}. Average Timeline: {item['average_timeline_days']}."
    )
    meta = {
        "jurisdiction": "INDIA",
        "category": "REGULATORY_CHECKLIST",
        "doc_title": "SUGAM CDSCO & AYUSH Regulatory Dossier Checklist",
        "source_file": "data/raw/json/sugam_cdsco_regulatory_checklist.json",
        "form_name": item["form_name"],
        "category_key": item["category"]
    }
    return text, meta

def format_clinical_record(item):
    trials_text = []
    for tr in item.get('published_clinical_trials', []):
        pmid = tr.get('pmid', '')
        ctri = tr.get('ctriId', tr.get('ctri_id', ''))
        title = tr.get('title', '')
        journal = tr.get('journal', '')
        year = tr.get('year', '')
        sample = tr.get('sampleSize', tr.get('sample_size', ''))
        outcomes = tr.get('primaryOutcomes', tr.get('primary_outcomes', ''))
        rule158 = tr.get('rule158bApplicability', tr.get('rule_158b_applicability', ''))
        synergy = tr.get('patentSection3eSynergism', tr.get('patent_section_3e_synergism', ''))
        trials_text.append(
            f"• Clinical RCT (PMID: {pmid}, CTRI: {ctri}): {title} ({journal}, {year}, n={sample} subjects). "
            f"Outcomes: {outcomes}. Rule 158-B: {rule158}. Synergism: {synergy}"
        )

    tox = item.get('toxicology_profile', {})
    text = (
        f"[AYUSH Pharmacopoeia & Clinical Evidence | Botanical: {item.get('sanskrit_name', '')} ({item.get('botanical_name', '')})]\n"
        f"Family: {item.get('family', '')}. Part Used: {item.get('part_used', '')}.\n"
        f"API Monograph: {item.get('api_monograph_ref', '')}.\n"
        f"Active Chemical Markers: {item.get('active_chemical_markers', '')}.\n"
        f"Classical Therapeutic Uses: {', '.join(item.get('therapeutic_uses', []))}.\n"
        f"Toxicology Profile (OECD 423): LD50 {tox.get('ld50_value', '')}, NOAEL: {tox.get('noael', '')}. Heavy Metals: {tox.get('heavy_metal_compliance', '')}. Safety Assessment: {tox.get('safety_assessment', '')}.\n"
        f"Published Clinical Studies:\n" + "\n".join(trials_text)
    )
    meta = {
        "jurisdiction": "INDIA",
        "category": "CLINICAL_EVIDENCE",
        "doc_title": f"API Monograph & Clinical Evidence: {item.get('sanskrit_name', '')} ({item.get('botanical_name', '')})",
        "source_file": "data/raw/json/ayush_clinical_evidence_dataset.json",
        "plant_name": item.get("sanskrit_name", ""),
        "botanical_name": item.get("botanical_name", ""),
        "api_monograph": item.get("api_monograph_ref", ""),
        "pmids": [tr.get("pmid", "") for tr in item.get("published_clinical_trials", []) if tr.get("pmid")]
    }
    return text, meta

def main():
    print("=" * 70)
    print(" IP-SHAKTI: Structured JSON Knowledge Datasets Ingestion into Neon")
    print("=" * 70)

    # 1. Connect to Neon
    print("Connecting to Neon DB...")
    conn = psycopg2.connect(NEON_DB_URL)

    # 2. Initialize FastEmbed ONNX Model (384-dim)
    print(f"Loading ONNX embedding model: sentence-transformers/all-MiniLM-L6-v2 (dim={EMBEDDING_DIM})...")
    embedder = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    items_to_ingest = []

    # Dataset 1: TKDL
    tkdl_path = os.path.join(JSON_DATA_DIR, "tkdl_tkrc_taxonomy.json")
    if os.path.exists(tkdl_path):
        with open(tkdl_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                t, m = format_tkdl_record(item)
                items_to_ingest.append((t, m))
        print(f"Loaded {len(data)} TKDL taxonomy plant records.")

    # Dataset 2: Trade Marks Nice Classification
    tm_path = os.path.join(JSON_DATA_DIR, "trademark_nice_classification.json")
    if os.path.exists(tm_path):
        with open(tm_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                t, m = format_trademark_record(item)
                items_to_ingest.append((t, m))
        print(f"Loaded {len(data)} Trade Mark Nice class records.")

    # Dataset 3: Registered GIs
    gi_path = os.path.join(JSON_DATA_DIR, "registered_ayurvedic_gis.json")
    if os.path.exists(gi_path):
        with open(gi_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                t, m = format_gi_record(item)
                items_to_ingest.append((t, m))
        print(f"Loaded {len(data)} Registered GI records.")

    # Dataset 4: SUGAM Regulatory Checklists
    sugam_path = os.path.join(JSON_DATA_DIR, "sugam_cdsco_regulatory_checklist.json")
    if os.path.exists(sugam_path):
        with open(sugam_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                t, m = format_sugam_record(item)
                items_to_ingest.append((t, m))
        print(f"Loaded {len(data)} SUGAM regulatory checklist records.")

    # Dataset 5: AYUSH Clinical Evidence & Pharmacopoeia Monographs (142 Plants)
    clinical_path = os.path.join(JSON_DATA_DIR, "ayush_clinical_evidence_dataset.json")
    if os.path.exists(clinical_path):
        with open(clinical_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            records_list = data.get("records", [])
            for item in records_list:
                t, m = format_clinical_record(item)
                items_to_ingest.append((t, m))
        print(f"Loaded {len(records_list)} AYUSH Clinical Evidence & API Monograph records.")

    print(f"\nTotal structured records to embed and insert: {len(items_to_ingest)}")

    # Embed passages
    texts = [t for t, _ in items_to_ingest]
    print("Generating 384-dim dense vector embeddings...")
    embeddings = list(embedder.embed(texts))

    records = []
    for (t, m), emb in zip(items_to_ingest, embeddings):
        records.append((
            str(uuid.uuid4()),
            emb.tolist(),
            t,
            json.dumps(m)
        ))

    # Cleanly remove any previous test JSON records so there are no duplicates
    with conn.cursor() as cur:
        cur.execute(f"""
            DELETE FROM {TABLE_NAME} 
            WHERE metadata->>'category' IN ('TKDL', 'TRADEMARK', 'GI', 'REGULATORY_CHECKLIST', 'CLINICAL_EVIDENCE');
        """)
        conn.commit()

    # Insert into Neon
    print(f"Inserting {len(records)} comprehensive records into Neon '{TABLE_NAME}' table...")
    with conn.cursor() as cur:
        execute_values(
            cur,
            f"""
            INSERT INTO {TABLE_NAME} (embedding_id, embedding, text, metadata)
            VALUES %s
            """,
            records,
            template="(%s, %s::vector, %s, %s::jsonb)"
        )
    conn.commit()
    conn.close()

    print("=" * 70)
    print(f"[SUCCESS] Ingested {len(records)} structured knowledge records into Neon pgvector!")
    print("=" * 70)

if __name__ == "__main__":
    main()
