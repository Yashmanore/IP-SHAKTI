# IP-SHAKTI Sahayak — Technical Architecture Specification (SPEC)

**Document Version**: 2.1  
**Target Platform**: Spring Boot 3.3.4 (Java 21 LTS) | PostgreSQL 16 (`pgvector`) | Google Gemini Flash  
**Compliance**: DPDP Act 2023 | Patents Act 1970 | Drugs & Cosmetics Rules 1945 Rule 158-B  

---

## 1. System Architecture Overview

```
                         ┌─────────────────────────────┐
                         │   INNOVATOR / PRACTITIONER  │
                         │   React Web UI / Mobile     │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  Spring Boot Gateway / API  │
                         │  (CORS, Security, OpenAPI)  │
                         └──────────────┬──────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Document Ingestion  │     │ Conversational Chat  │     │ Rule 158-B Statutory │
│  & Multimodal LLM    │     │ Orchestrator Service │     │  Classifier Engine   │
│  (PDFBox, POI, TXT)  │     │ (Multi-turn Chips)   │     │ (Deterministic Tree) │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │ DPDP Act 2023 Sanitization  │
                         │ (Aadhaar, PAN, Phone Mask)  │
                         └──────────────┬──────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ PostgreSQL Session   │     │ Hybrid Legal RAG     │     │ Sovereign Audit Log  │
│ Isolated Memory      │     │ Engine (pgvector +   │     │ Service (PostgreSQL  │
│ (chat_messages DB)   │     │ BM25 GIN Full-Text)  │     │ audit_logs DB)       │
└──────────────────────┘     └──────────┬───────────┘     └──────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ Google Gemini Flash LLM     │
                         │ Generative Legal Synthesis  │
                         │ (Executive Brief & Claims)  │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ Safe Abstention Gatekeeper  │
                         │ (Magic Remedies & Thresh.)  │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ FINAL 5-PILLAR ADVISORY     │
                         │ REPORT WITH LEGAL CITATIONS │
                         └─────────────────────────────┘
```

---

## 2. Database DDL Specifications (PostgreSQL 16 + `pgvector`)

### 2.1 Statutory Knowledge Corpus (`statutory_chunks`)
Stores 1,514 pre-indexed legal sections across Indian and international intellectual property and regulatory regimes.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS statutory_chunks (
    id SERIAL PRIMARY KEY,
    document_title VARCHAR(255) NOT NULL,
    act_or_treaty VARCHAR(255) NOT NULL,
    section_reference VARCHAR(100) NOT NULL,
    statutory_hierarchy VARCHAR(100),
    jurisdiction VARCHAR(50) NOT NULL,         -- 'INDIA' or 'INTERNATIONAL'
    category VARCHAR(100) NOT NULL,            -- 'PATENT', 'BIODIVERSITY', 'REGULATORY', 'TKDL'
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,            -- text-embedding-004
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vector Cosine Distance Index (HNSW for high-concurrency sub-millisecond retrieval)
CREATE INDEX IF NOT EXISTS idx_statutory_chunks_embedding 
ON statutory_chunks USING hnsw (embedding vector_cosine_ops);

-- Full-Text GIN Index for Sparse Keyword Matching
ALTER TABLE statutory_chunks ADD COLUMN IF NOT EXISTS tsv_content tsvector;

UPDATE statutory_chunks 
SET tsv_content = to_tsvector('english', coalesce(act_or_treaty, '') || ' ' || coalesce(section_reference, '') || ' ' || content);

CREATE INDEX IF NOT EXISTS idx_statutory_chunks_tsv 
ON statutory_chunks USING gin (tsv_content);
```

### 2.2 Session-Isolated Chat Memory (`chat_messages`)
Maintains conversational continuity across multi-turn clarifying dialogues without cross-session pollution.

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(20) NOT NULL,               -- 'USER' or 'BOT'
    content TEXT NOT NULL,
    product_name VARCHAR(255),
    jurisdiction VARCHAR(50) DEFAULT 'INDIA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
ON chat_messages (session_id, created_at ASC);
```

### 2.3 Sovereign DPDP Audit Trail (`audit_logs`)
Records every legal inquiry with redacted personal identifiers, confidence scoring, and statutory citations.

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    original_length INT NOT NULL,
    sanitized_prompt TEXT NOT NULL,
    detected_pii_types VARCHAR(255),          -- e.g. 'AADHAAR,PAN,PHONE'
    overall_confidence_score DOUBLE PRECISION NOT NULL,
    confidence_level VARCHAR(20) NOT NULL,    -- 'HIGH', 'MEDIUM', 'LOW'
    safe_abstention_triggered BOOLEAN DEFAULT FALSE,
    abstention_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_session 
ON audit_logs (session_id);
```

---

## 3. Hybrid RAG Algorithm: Reciprocal Rank Fusion (RRF)

To eliminate vector retrieval blind spots (e.g. failing to match specific statutory rule numbers like "Rule 158-B(1)(A)"), the system executes **Reciprocal Rank Fusion (RRF)**:

$$\text{RRF\_Score}(d) = \frac{1}{k + \text{Rank}_{\text{dense}}(d)} + \frac{1}{k + \text{Rank}_{\text{sparse}}(d)}$$

Where $k = 60$ (standard TREC smoothing constant).

### Execution Pipeline:
1. **Dense Retrieval**: `text-embedding-004` converts the user query into a 768-dim float vector. PostgreSQL computes cosine similarity:
   $$\text{similarity} = 1 - (\text{embedding} \Leftrightarrow \mathbf{q})$$
2. **Sparse Lexical Retrieval**: Query is tokenized and executed against the `tsv_content` GIN index via `plainto_tsquery('english', :query)`.
3. **Fusion & Windowed Expansion**: For the top 5 fused documents, the system automatically retrieves preceding ($chunk - 1$) and succeeding ($chunk + 1$) sections from the same statute to ensure comprehensive judicial grounding.

---

## 4. Multi-Format Document Ingestion Engine

### 4.1 Input Ingestion Matrix
- **PDF Documents**: Direct base64 transmission via Google Gemini Flash `inlineData` (`mimeType: "application/pdf"`) combined with Apache PDFBox text parsing for DPDP sanitization.
- **Word (`.docx`) Documents**: Extracted via Apache POI `XWPFDocument` and `XWPFWordExtractor`.
- **Plain Text / Query Strings**: Cleaned and UTF-8 encoded.

### 4.2 Standardized Extraction JSON Schema
```json
{
  "applicantCredentials": {
    "applicantName": "string",
    "aadhaarNumber": "string or null",
    "panNumber": "string or null",
    "phoneNumber": "string or null",
    "emailAddress": "string or null",
    "locationOrAddress": "string or null"
  },
  "productDetails": {
    "documentTitle": "string",
    "productName": "string",
    "botanicalBinomials": ["string"],
    "regulatoryCategory": "AYURVEDIC_COSMETIC | PHYTOPHARMACEUTICAL | CLASSICAL_AYURVEDIC_FORMULATION | PROPRIETARY_AYURVEDIC_MEDICINE | AYURVEDA_AAHAR",
    "governingActAndRules": "string",
    "licensingAuthority": "string"
  },
  "patentabilityAndStatutoryAnalysis": {
    "technicalNovelty": "string",
    "isClassicalScriptureRecipe": false,
    "section3pTraditionalKnowledgeBar": {
      "isBarred": false,
      "rationale": "string"
    },
    "synergismOrEfficacy": {
      "proven": true,
      "evidence": "string"
    },
    "biodiversityActRequirement": "string",
    "clinicalTrialObligations": "string",
    "claimsSummary": [
      { "claimNumber": 1, "type": "PRODUCT", "summary": "string" },
      { "claimNumber": 2, "type": "PROCESS", "summary": "string" }
    ],
    "immediateNextSteps": ["string"]
  }
}
```

---

## 5. Sovereign Guardrails & Safe Abstention Engine

### 5.1 DPDP Act 2023 Masking Rules
- **Aadhaar**: Redacted into `[REDACTED_AADHAAR]` via `\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b`.
- **PAN**: Redacted into `[REDACTED_PAN]` via `\b[A-Z]{5}[0-9]{4}[A-Z]\b`.
- **Indian Mobile**: Redacted into `[REDACTED_PHONE]` via `(?:\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}\b`.
- **Email**: Redacted into `[REDACTED_EMAIL]` via standard RFC-5322 regex.

### 5.2 Drugs & Magic Remedies Act 1954 Interception
The engine enforces a strict blacklist of claims prohibited under the Schedule to the Drugs and Magic Remedies Act:
- Cancer cure, Diabetes reversal, Epilepsy cure, Blindness restoration, Kidney stone dissolution.
- If detected, generation halts and a mandatory statutory warning is appended to the advisory report.

### 5.3 Confidence Gatekeeper (< 60%)
- If the RAG retrieval similarity score falls below 0.60 or conflicting statutory provisions are identified:
  - Status is flagged as `ABSTENTION_REQUIRED`.
  - The engine outputs a safe abstention advisory directing the user to the appropriate State AYUSH Licensing Authority or an enrolled Indian Patent Agent.

---

## 6. End-to-End Test Matrix

| Suite | Script | Scope | Target Threshold |
| :--- | :--- | :--- | :--- |
| **Hybrid Search** | `scripts/verify_hybrid_search.py` | pgvector dense + GIN sparse retrieval | Latency < 800ms, RRF Top-5 precision 100% |
| **Legal Synthesis** | `scripts/verify_module4_gemini.py` | Gemini Flash 5-Pillar synthesis | Zero hallucinated citations; valid JSON |
| **DPDP & Audit** | `scripts/verify_module5_dpdp_audit.py` | PII redaction and audit persistence | 100% PII masked into `[REDACTED_*]` tokens |
| **Session Memory** | `scripts/verify_session_memory.py` | Multi-turn contextual continuity | Zero cross-session leakage |
| **Document Triage** | `verify_document_analysis.py` | Universal PDF/DOCX/Text extraction | 100% schema adherence across cosmetic & phyto patents |