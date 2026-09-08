import os
import sys
import re
import uuid
import json
import psycopg2
from psycopg2.extras import execute_values
from pypdf import PdfReader
from fastembed import TextEmbedding

# Force UTF-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==============================================================================
# IP-SHAKTI Hierarchical Legal Ingestion Engine
# Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions)
# Destination: Neon PostgreSQL + pgvector (Table: legal_document_embeddings)
# ==============================================================================

NEON_DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_4rwHVRYI6bnj@ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
)
RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "raw")
TABLE_NAME = "legal_document_embeddings"
EMBEDDING_DIM = 384
CHUNK_SIZE_CHARS = 1200
CHUNK_OVERLAP_CHARS = 200

# Regex patterns for hierarchical legal structures
SECTION_REGEX = re.compile(r'\b(Section\s+\d+[A-Za-z]*|Rule\s+\d+[A-Za-z]*|Article\s+\d+[A-Za-z]*|Form\s+[I|V|X]+|\bCHAPTER\s+[I|V|X\d]+|\bPART\s+[I|V|X\d]+)', re.IGNORECASE)

def get_document_metadata(file_path):
    rel_path = os.path.relpath(file_path, RAW_DATA_DIR).replace("\\", "/")
    parts = rel_path.split("/")
    
    jurisdiction = "INDIA" if "national" in parts else "INTERNATIONAL"
    category = "GENERAL"
    if "statutes" in parts:
        category = "STATUTE"
    elif "rules" in parts:
        category = "RULES"
    elif "forms" in parts:
        category = "FORMS"
    elif "treaties" in parts:
        category = "TREATY"
    elif "regulations" in parts:
        category = "REGULATION"

    filename = os.path.splitext(os.path.basename(file_path))[0]
    # Clean display title
    doc_title = filename.replace("_", " ").title()
    if "Gratk" in doc_title:
        doc_title = "WIPO GRATK Treaty 2024 (Genetic Resources & Traditional Knowledge)"
    elif "Trips" in doc_title:
        doc_title = "WTO TRIPS Agreement"
    elif "Nagoya" in doc_title:
        doc_title = "Nagoya Protocol on Access and Benefit Sharing"
    elif "Cbd" in doc_title:
        doc_title = "Convention on Biological Diversity (CBD)"

    return {
        "jurisdiction": jurisdiction,
        "category": category,
        "doc_title": doc_title,
        "file_path": f"data/raw/{rel_path}"
    }

def chunk_text_hierarchically(pages, meta):
    chunks = []
    current_section = "Preamble / General Provisions"
    full_corpus = []

    for page_num, text in enumerate(pages, start=1):
        lines = text.split("\n")
        page_buffer = []
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            sec_match = SECTION_REGEX.search(line_str)
            if sec_match:
                current_section = sec_match.group(0).title()
            page_buffer.append((line_str, current_section, page_num))
        full_corpus.extend(page_buffer)

    if not full_corpus:
        return chunks

    # Build overlapping chunks with hierarchy header
    i = 0
    total_lines = len(full_corpus)
    chunk_index = 0

    while i < total_lines:
        chunk_lines = []
        char_count = 0
        start_sec = full_corpus[i][1]
        start_page = full_corpus[i][2]

        j = i
        while j < total_lines and char_count < CHUNK_SIZE_CHARS:
            line_text, sec, pnum = full_corpus[j]
            chunk_lines.append(line_text)
            char_count += len(line_text) + 1
            j += 1

        body_text = " ".join(chunk_lines)
        # Prepend contextual hierarchy breadcrumb for high-precision semantic retrieval
        contextual_text = (
            f"[{meta['doc_title']} | Jurisdiction: {meta['jurisdiction']} | "
            f"Category: {meta['category']} | Ref: {start_sec} (Page {start_page})]\n"
            f"{body_text}"
        )

        chunks.append({
            "text": contextual_text,
            "metadata": {
                "jurisdiction": meta["jurisdiction"],
                "category": meta["category"],
                "doc_title": meta["doc_title"],
                "file_path": meta["file_path"],
                "section_ref": start_sec,
                "page_number": start_page,
                "chunk_index": chunk_index
            }
        })
        chunk_index += 1

        # Advance with overlap
        overlap_chars = 0
        back_steps = 0
        while j > i and overlap_chars < CHUNK_OVERLAP_CHARS:
            j -= 1
            overlap_chars += len(full_corpus[j][0]) + 1
            back_steps += 1
        
        i = max(i + 1, j)

    return chunks

def init_neon_database(conn):
    with conn.cursor() as cur:
        print("[1/4] Ensuring 'vector' extension is enabled in Neon...")
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        print(f"[2/4] Initializing table '{TABLE_NAME}'...")
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
                embedding_id UUID PRIMARY KEY,
                embedding vector({EMBEDDING_DIM}),
                text TEXT NOT NULL,
                metadata JSONB NOT NULL
            );
        """)
        conn.commit()

def main():
    print("=" * 70)
    print(" IP-SHAKTI: Legal & Regulatory Corpus Ingestion into Neon pgvector")
    print("=" * 70)

    # 1. Connect to Neon
    print(f"Connecting to Neon DB...")
    conn = psycopg2.connect(NEON_DB_URL)
    init_neon_database(conn)

    # 2. Initialize FastEmbed ONNX Model (384-dim)
    print(f"[3/4] Loading ONNX embedding model: sentence-transformers/all-MiniLM-L6-v2 (dim={EMBEDDING_DIM})...")
    embedder = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # 3. Discover all 27 PDF files
    all_pdfs = []
    for root, _, files in os.walk(RAW_DATA_DIR):
        for f in files:
            if f.lower().endswith(".pdf"):
                all_pdfs.append(os.path.join(root, f))

    all_pdfs.sort()
    print(f"Found {len(all_pdfs)} authoritative legal PDFs in data/raw/\n")

    total_chunks_ingested = 0

    # 4. Process each PDF
    for idx, pdf_path in enumerate(all_pdfs, start=1):
        meta = get_document_metadata(pdf_path)
        print(f"[{idx}/{len(all_pdfs)}] Processing: {meta['doc_title']} ({meta['jurisdiction']} / {meta['category']})")

        try:
            reader = PdfReader(pdf_path)
            pages = []
            for p in reader.pages:
                t = p.extract_text()
                if t:
                    pages.append(t)
            
            if not pages:
                print(f"   [WARN] No extractable text in {os.path.basename(pdf_path)}")
                continue

            doc_chunks = chunk_text_hierarchically(pages, meta)
            if not doc_chunks:
                continue

            print(f"   -> Generated {len(doc_chunks)} hierarchical chunks. Generating embeddings...")

            # Extract texts to embed
            texts = [c["text"] for c in doc_chunks]
            embeddings = list(embedder.embed(texts))

            # Prepare records for insertion
            records = []
            for c, emb in zip(doc_chunks, embeddings):
                records.append((
                    str(uuid.uuid4()),
                    emb.tolist(),
                    c["text"],
                    json.dumps(c["metadata"])
                ))

            # Batch insert into Neon
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
            total_chunks_ingested += len(records)
            print(f"   [OK] Saved {len(records)} vectors to Neon. (Total so far: {total_chunks_ingested})")

        except Exception as e:
            print(f"   [ERROR] Failed processing {pdf_path}: {e}")

    # 5. Create HNSW Cosine Index for ultra-fast vector retrieval
    print(f"\n[4/4] Building HNSW Vector Index on '{TABLE_NAME}' for sub-20ms cosine search...")
    with conn.cursor() as cur:
        cur.execute(f"""
            CREATE INDEX IF NOT EXISTS {TABLE_NAME}_hnsw_idx 
            ON {TABLE_NAME} USING hnsw (embedding vector_cosine_ops);
        """)
        cur.execute(f"""
            CREATE INDEX IF NOT EXISTS {TABLE_NAME}_meta_jurisdiction_idx 
            ON {TABLE_NAME} ((metadata->>'jurisdiction'));
        """)
    conn.commit()
    conn.close()

    print("=" * 70)
    print(f"[SUCCESS] INGESTION COMPLETE! Total {total_chunks_ingested} chunks embedded & indexed in Neon.")
    print("=" * 70)

if __name__ == "__main__":
    main()
