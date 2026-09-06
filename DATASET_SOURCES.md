# IP-SHAKTI Sahayak — Authoritative Corpus & Dataset Catalog
> Comprehensive technical inventory of all National (India) and International legal, regulatory, scientific, and prior-art data sources, exact file formats, public API endpoints, registries, and ingestion specifications for 99%+ citation accuracy.

---

## 1. National Regime (India 🇮🇳)

### 1.1 Statutory Laws & Rules (India Code & Official Gazettes)

| Statute / Document | Native Format on Source Portal | Direct Download / Endpoint Type | Ingestion Format for RAG | Key Provisions Relevant to Ayurveda IPR |
| :--- | :--- | :--- | :--- | :--- |
| **The Patents Act, 1970**<br>`Act No. 39 of 1970`<br>`ID: a49ad42b-f2dc-4ee2-9884-11ef0839798d` | **Structured HTML (Web page)** + **Official Gazette PDF** | • Web view: `https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d`<br>• Direct searchable text `.pdf` | Convert PDF/HTML to **Clean Markdown / JSON** by Section (`Section 3(p)`, etc.) | **Section 3(p)**: Excludes traditional knowledge or aggregation of known properties.<br>**Section 3(e)**: Mere admixture non-patentable.<br>**Section 10(4)(d)(ii)**: Mandatory disclosure of source & geographical origin.<br>**Section 25**: Opposition on grounds of TK anticipation. |
| **The Patents (Amendment) Rules, 2024**<br>`GSR 190(E)` | **Bilingual Gazette PDF (Scanned / Digital Text PDF)** | • Published via `https://egazette.gov.in`<br>• Direct PDF on `https://ipindia.gov.in/rules-patents.htm` | Run OCR / PyMuPDF on English section → convert to **Structured JSON/Markdown** | Streamlined statements of working (Form 27), updated examination timelines, concession fees for educational/startups. |
| **The Biological Diversity Act, 2002** (as amended 2023)<br>`ID: 000de0a3-39ce-4e18-85f0-0c51b4bdab5d` | **Structured HTML** + **Official Gazette PDF** | • India Code: `https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d`<br>• Official searchable PDF | Hierarchical Markdown (`Chapter -> Section -> Subsection`) | **Section 6**: Prior approval of National Biodiversity Authority (NBA) required before applying for IPR based on Indian biological resources/TK.<br>**Section 3 & 4**: Access approvals for non-Indian entities.<br>**Section 7**: Prior intimation to State Biodiversity Boards (SBB). |
| **Biological Diversity Rules, 2024 & Amendment Rules 2025** | **Digital Text PDF** | Hosted directly on `https://www.nbaindia.nic.in/acts-and-rules/rules` as direct `.pdf` files | Chunked JSON with statutory Form definitions (Form I to IV) | Procedures for Access and Benefit Sharing (ABS), statutory forms, exemptions for registered AYUSH practitioners and codified traditional knowledge. |
| **The Drugs and Cosmetics Act, 1940 & Rules 1945**<br>`ID: 8725a8a7-45a4-42e3-9046-e2a6383cd049` | **Structured HTML** + **Official PDF (500+ pages)** | • India Code: `https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049`<br>• CDSCO statutory repository | Extract Chapter IVA and Rule 158-B → **JSON with Section & Rule metadata** | **Chapter IVA**: Provisions relating to Ayurvedic, Siddha, and Unani drugs (Sections 33A - 33N).<br>**Section 3(a)**: Definitions of ASU drugs.<br>**First Schedule**: Statutory list of 54+ authoritative texts for classical formulations.<br>**Rule 158-B**: Licensing requirements for patent/proprietary ASU medicines. |
| **Drugs & Magic Remedies Act, 1954**<br>`Act No. 21 of 1954` | **Structured HTML** + **PDF** | India Code portal (`indiacode.gov.in`) | Parsed Markdown of Schedule (list of 54 prohibited diseases) | Prohibits false/misleading advertisements regarding 54 specified diseases/conditions for Ayurvedic drugs. |
| **FSSAI Ayurveda Aahar Regulations, 2022** | **Gazette Notification PDF** | `fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Ayurveda_Aahar_09_05_2022.pdf` | Table extraction (Schedule A & B) → **Structured JSON / Tabular Markdown** | Formulations for food supplements/nutrition based on classical Ayurvedic texts; distinct logo and labeling regulations. |
| **Geographical Indications Act, 1999**<br>`Act No. 48 of 1999` | **Structured HTML** + **PDF** | India Code & IP India portal | Text Markdown | Protection of origin-based Ayurvedic products (e.g., Navara rice, Pokkali rice, Malabar pepper, Nilambur teak). |
| **The Trade Marks Act, 1999**<br>`ID: 62219d21-0553-405b-9ccb-a11b4d9c41c2` | **Structured HTML** + **PDF** | India Code portal | Parsed Markdown | Protection of brand names, logos, Class 5 (pharmaceuticals & herbal formulations), Class 3 (cosmetics), Class 30/31 (herbal teas/food). |
| **Protection of Plant Varieties & Farmers' Rights Act, 2001**<br>`Act No. 53 of 2001` | **Digital Text PDF** | `plantauthority.gov.in` statutory repository | Markdown | Protection of novel, extant, and farmers' medicinal plant varieties. |

---

### 1.2 Prior Art & Traditional Knowledge Databases

| Repository / Corpus | Native Format on Source Portal | Delivery / Endpoint Mechanism | Ingestion Format for RAG | Scope & Content |
| :--- | :--- | :--- | :--- | :--- |
| **Traditional Knowledge Digital Library (TKDL)** | **Encrypted XML & Proprietary Relational DB** (Patented under TKRC classification) | **Restricted Web Portal** (`https://www.tkdl.res.in`). Access granted to Patent Offices via Institutional Agreements. Public can view summary records and published prior-art citations. | **Curated JSON Index**: Extracted TKRC classification codes, formulation titles, medicinal plants & Sanskrit names. | **454,000+** formulations/practices (Ayurveda, Unani, Siddha, Sowa Rigpa, Yoga). Classified under Traditional Knowledge Resource Classification (TKRC) mapped to IPC `A61K 36/00`. |
| **First Schedule 54+ Authoritative Classical Books** | **Printed Sanskrit/Hindi/English Books** (Digitized in **PDFs** / National Library Archives) | Hosted as public domain digitized PDFs on AYUSH / DSpace / Internet Archive / Digital Library of India (`archive.org`). | **OCR Text Extracted to Markdown / JSON**: (Book Title, Chapter, Shloka/Formulation Name, Classical Indication). | **54+ Authoritative Classical Books** including: Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Sharangadhara Samhita, Bhavaprakasha, Bhaishajya Ratnavali, Sahasrayogam, Rasa Tarangini, Ayurvedic Pharmacopoeia of India (API), Ayurvedic Formulary of India (AFI). |
| **Ayurvedic Pharmacopoeia of India (API) & Formulary (AFI)** | **Standardized Multi-volume Digital PDFs** | Official PDFs hosted on PCIM&H portal (`https://pcimh.gov.in`). Volumes I to IX for plant drugs, Part II for formulations. | **Tabular JSON**: Plant botanical name, Sanskrit synonym, active markers, formulation composition, dosage. | Official monographs: Part I (single drugs - plants), Part II (compound formulations), physical-chemical standards, TLC/HPTLC profiles. |
| **Ayush Research Portal** | **Dynamic Web Application (JSON via internal REST APIs)** | Web interface (`https://ayushportal.nic.in`) fetching clinical trial results and monographs via XHR/JSON. | **Scraped / Harvested JSON** (Title, Herb, Disease indication, Clinical trial summary). | Evidence-based clinical trials, pharmacological research, and experimental validation of Ayurvedic formulations. |

---

### 1.3 Registries & Search Endpoints (India)

| System / Registry | Native Format | Endpoint / Protocol Type | How RAG Uses It | Query Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **InPASS (Indian Patent Advanced Search)** | **HTML Web Form with Session State & Captcha** | `https://ipindiaservices.gov.in/publicsearch` (POST requests with form payloads). *No public REST API without authentication.* | **Reference Link Generator**: RAG generates pre-configured search queries / deep links and references historical cited patents. | Search by Patent Application No., Title, Abstract, IPC Class (`A61K36`, `A61K35`, `A61P`), Applicant, Section 3(p) references. |
| **Trade Marks Registry Public Search** | **ASP.NET Web Form (Dynamic HTML Tables)** | `https://ipindiaservices.gov.in/tmrpublicsearch` | Query guide + Class 5 / Class 3 classification tables stored as **JSON**. | Search wordmark, phonetics, Vienna code, Class 5 (herbal medicine) and Class 3 (herbal cosmetics). |
| **GI Registry Public Search** | **HTML Table / Static PDF Registrations** | `https://ipindiaservices.gov.in/GIRPublic/` | **Static JSON Dataset** of all 450+ registered Indian GIs (especially agricultural & herbal). | Registered GI applications, geographical specifications, authorised users list. |
| **NBA ABS e-Filing Portal** | **Web Application (HTML Forms + PDF attachments)** | `https://www.nbaindia.nic.in` | **Rule-Based Workflow JSON**: The 4 statutory forms (Form I, II, III, IV) converted to interactive JSON schemas. | **Form I** (Bio-survey/commercial), **Form II** (Transfer of research results), **Form III** (Prior approval for IPR application), **Form IV** (Third party transfer). |
| **SUGAM Portal (CDSCO)** | **Online Portal (PDF Circulars & Checklist Tables)** | `https://cdscoonline.gov.in` | **Checklist JSON**: Requirements for phytopharmaceuticals & ASU new drug licenses. | Phytopharmaceutical drug approvals, New Drugs and Clinical Trials applications under NDCT Rules 2019. |

---

## 2. International Regime (Global 🌍)

### 2.1 Multilateral Treaties & Conventions

| Treaty / Agreement | Native Format on Source | Direct Endpoint / URL Type | Ingestion Format for RAG | Crucial Articles & Direct Impact on Ayurveda |
| :--- | :--- | :--- | :--- | :--- |
| **WIPO GRATK Treaty, 2024** | **Clean Digital Text PDF** and **Web HTML** | `https://www.wipo.int/edocs/mdocs/tk/en/gratk_dc/gratk_dc_7.pdf` | **Structured Markdown**: Article-by-article breakdown (e.g., Article 3 Mandatory Disclosure). | *WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge* (adopted May 24, 2024). **Mandatory disclosure** in patent applications if invention is based on genetic resources or associated TK. |
| **WTO TRIPS Agreement** | **Semantic Web HTML** and **Official WTO PDF** | `https://www.wto.org/english/docs_e/legal_e/27-trips_01_e.htm` | **JSON / Markdown**: Split into Article 27, Article 29, Doha Declaration. | **Article 27.1**: Patentable subject matter.<br>**Article 27.2**: Exclusions for ordre public and human health.<br>**Article 27.3(b)**: Exclusions of plants and animals; protection of plant varieties via sui generis system.<br>**Doha Declaration**: Public health flexibilities. |
| **Convention on Biological Diversity (CBD, 1992)** | **Semantic HTML** + **UN Treaty PDF** | `https://www.cbd.int/convention/text/` | **Markdown by Article**: (Article 8(j), Article 15). | **Article 8(j)**: Respect, preserve and maintain knowledge, innovations and practices of indigenous and local communities.<br>**Article 15**: Sovereign rights over natural resources and Access on mutually agreed terms (MAT) + Prior Informed Consent (PIC). |
| **Nagoya Protocol on ABS (2010)** | **Official Treaty PDF** | `https://www.cbd.int/abs/doc/protocol/nagoya-protocol-en.pdf` | Structured Markdown with compliance rules. | Operational framework for fair and equitable benefit sharing. Access and Benefit Sharing Clearing-House (ABSCH) tracking international certificates of compliance (IRCC). |
| **Patent Cooperation Treaty (PCT)** | **Digital Text PDF & WIPO Web Pages** | `https://www.wipo.int/pct/en/texts/` | Markdown of PCT Rules and Minimum Documentation list. | International patent filing system. PCT Minimum Documentation includes TKDL and traditional medicine journals as non-patent prior art. |
| **Budapest Treaty** | **Digital PDF & HTML** | `https://www.wipo.int/treaties/en/registration/budapest/` | Markdown guidelines for biological/microorganism deposit requirements. | International recognition of deposit of microorganisms (relevant for fermented Ayurvedic preparations: Asava, Arishta, probiotic strains). |
| **Madrid System & Hague System** | **Web Guides & Nice / Locarno Classification APIs** | `https://www.wipo.int/madrid/en/` | Nice Classification Class 5 & 3 JSON rules. | International trademark and industrial design registrations. |

---

### 2.2 Key Export Market Regulatory Regimes

| Regulatory Authority & Framework | Native Format | Direct Endpoint / Source | Ingestion Format for RAG | Requirements for Ayurvedic Products |
| :--- | :--- | :--- | :--- | :--- |
| **US FDA – DSHEA (1994) & 21 CFR Part 111** | **eCFR (Electronic Code of Federal Regulations) XML & JSON API** | Direct REST API via `https://www.ecfr.gov/api/versioner/v1/structure/2024-01-01/title-21.json` | **Structured JSON**: Sections on dietary supplement claims, warnings, and CGMP. | Ayurveda products mostly sold as **Dietary Supplements** (Structure/Function claims only, no disease cure claims; CGMP 21 CFR Part 111). If sold as prescription **Botanical Drugs**, requires full IND/NDA clinical trials. |
| **US FDA – Botanical Drug Guidance (2016)** | **Formal Guidance PDF** | FDA Guidance repository (`https://www.fda.gov/media/93113/download`) | **Markdown Doc**: Clinical trial phases for herbal extracts. | Full IND/NDA clinical trial pathway for complex botanical mixtures without single active chemical entities. |
| **EU EMA – Directive 2004/24/EC (THMPD)** | **EUR-Lex XML, HTML & PDF** | Direct XML/HTML via EUR-Lex: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004L0024` | **Parsed Markdown**: 30-year / 15-year rule criteria and Community Herbal Monographs. | Requires proof of **30 years traditional use** (including at least 15 years within the EU) for simplified registration. Otherwise evaluated under full medicinal product rules or as food supplements. |
| **UK MHRA – Traditional Herbal Registration (THR)** | **Gov.uk Structured HTML & Guidance PDFs** | `https://www.gov.uk/guidance/apply-for-a-traditional-herbal-registration-thr` | Markdown checklist for UK herbal market entry. | Quality standards, safety monitoring, traditional use documentation. |
| **WHO Guidelines on Traditional Medicine** | **WHO IRIS Repository (Searchable PDFs)** | WHO Institutional Repository for Information Sharing (`https://iris.who.int`) | Extracted safety and quality criteria monographs. | Global benchmarking, quality assurance, safety monographs for medicinal plants. |

---

### 2.3 International Patent & Search Databases

| Database | Native Format | Endpoint & API Capabilities | How RAG Uses It | Relevant Classification / Search Keys |
| :--- | :--- | :--- | :--- | :--- |
| **WIPO PATENTSCOPE** | **High-Performance Web Search / REST API / XML Bulk Data** | • Web UI: `https://patentscope.wipo.int/search/en/search.jsf`<br>• **WIPO Public API**: REST endpoints for subscribing offices | Pre-configured search URLs & prior-art queries for IPC class `A61K 36/00`. | 129.4M+ patent documents. IPC classes: `A61K 36/00` (Medicinal plants), `A61K 35/00`, `A61P` (Therapeutics). |
| **USPTO Patent Public Search** | **JSON via internal API & Cloud Object Store (PDF/TIFF images)** | `https://ppubs.uspto.gov/` | Prior art search guide & Section 101 subject-matter guidance. | US patent grants and applications. Checks 35 U.S.C. 101 (patent eligibility) and 102/103 (prior art). |
| **Espacenet (EPO)** | **Open Patent Services (OPS) REST API & XML/JSON** | `https://ops.epo.org/3.2/rest-services/` (Free developer REST API available with key) | Search by CPC `A61K36/00` via REST API. | 140M+ patent documents, CPC classification `A61K 36/00`. |
| **ABS Clearing-House (ABSCH)** | **Public REST API & JSON** | **Direct API**: `https://api.cbd.int/api/v2013/documents/` (Returns JSON for IRCCs and National Reports) | **Direct REST Integration**: Fetches real-time ABS requirements and country profiles in JSON. | Internationally Recognized Certificates of Compliance (IRCC), national ABS focal points and laws. |

---

## 3. End-to-End Ingestion Pipeline Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RAW DATA SOURCES                                      │
│                                                                                         │
│  • India Code / Official Gazettes  ──► Structured HTML & Digital Text PDF               │
│  • Pharmacopoeias & Treaties       ──► Searchable Digital PDF (PCIM&H, WIPO, WTO, CBD)  │
│  • Classical Texts (Schedule 1)    ──► Scanned / OCR Digitized Sanskrit/Hindi PDFs      │
│  • US eCFR / EUR-Lex / ABSCH       ──► Direct REST API / JSON / XML Feeds               │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  INGESTION ENGINE                                       │
│                                                                                         │
│  1. Specialized Extractors:                                                             │
│     - PyMuPDF / pdfplumber for digital legal PDFs                                       │
│     - Beautiful Soup / Trafilatura for India Code HTML                                  │
│     - HTTP Client for REST APIs (ABSCH, eCFR)                                           │
│  2. Hierarchical Chunking:                                                              │
│     - Chunks split strictly by: Statute -> Chapter -> Section -> Subsection            │
│     - Treaties split by: Article -> Paragraph                                           │
│  3. Metadata Enrichment:                                                                │
│     - Injects authoritative jurisdiction (INDIA vs INTERNATIONAL)                       │
│     - Cites exact act, section, rule number, and source URL                             │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            VECTOR STORE & HYBRID RETRIEVAL                              │
│                                                                                         │
│  • Dense Vector Embeddings: Pinecone / pgvector (Semantic queries)                      │
│  • Sparse Keyword Search: PostgreSQL BM25 Full-Text Search (Exact legal sections)       │
│  • Cross-Encoder Reranker: Filters top 5 authoritative source chunks                    │
│  • Citation Grounding: Zero hallucination, strict prompt enforcement                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Standardized Chunk Metadata Schema (JSON)

Every ingested chunk in the RAG knowledge base adheres to this metadata contract:

```json
{
  "chunk_id": "IN_PAT_SEC3P_001",
  "jurisdiction": "INDIA",
  "regime": "NATIONAL",
  "authority_type": "STATUTE",
  "governing_body": "Indian Patent Office / DPIIT",
  "document_title": "The Patents Act, 1970",
  "document_id": "a49ad42b-f2dc-4ee2-9884-11ef0839798d",
  "citation": {
    "act": "The Patents Act, 1970",
    "section": "Section 3(p)",
    "subsection": null,
    "clause": null,
    "year": 1970,
    "last_amendment_year": 2024,
    "official_url": "https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d"
  },
  "ipc_cpc_class": ["A61K36/00"],
  "product_category_applicable": [
    "CLASSICAL_AYURVEDIC_MEDICINE",
    "PROPRIETARY_MEDICINE",
    "NEW_DRUG"
  ],
  "content": "What are not inventions: an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components...",
  "checksum": "sha256_hash_value"
}
```

---

## 5. Verification & Corpus Quality Check
- **Zero Hallucination Guardrail**: Strict retrieval constraint preventing the LLM from generating an answer without an exact statutory or treaty citation.
- **Safe Abstention**: If the retrieval confidence score is below 0.75, the system responds with a safe-abstention message directing the user to the National Biodiversity Authority, the Patent Office InPASS portal, or an accredited IP facilitator.
