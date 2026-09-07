# IP‑SHAKTI Project Specification (Condensed)

## 1. Technical Architecture Overview
```
                         ┌─────────────────┐
                         │      USER       │
                         │ Web / Mobile UI │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Query Understanding   │
                    │ • Language Detection    │
                    │ • Intent Detection      │
                    │ • Jurisdiction          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Product Classification  │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        ┌───────────────┐               ┌──────────────┐
        │ IP Protection │               │ Regulatory   │
        │   Analysis    │               │    Check     │
        └───────┬───────┘               └──────┬───────┘
                │                              │
                └───────────────┬──────────────┘
                                ▼
                       ┌─────────────────────┐
                       │   RAG Retrieval Layer│
                       │  Vector DB + Filters│
                       └────────────┬─────────┘
                                    ▼
                       ┌─────────────────────┐
                       │       LLM Engine    │
                       │ Citation + Safety   │
                       └────────────┬─────────┘
                                    ▼
                               FINAL ANSWER
```

## 2. Recommended Tech Stack

### 2.1 Primary Default Configuration (100% Free & Open-Source / FOSS)
*Designed for Smart India Hackathon (SIH), national data sovereignty, and zero recurring infrastructure cost:*
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, i18next *(MIT License — 100% Free & Open Source)*.
- **Backend**: Spring Boot 3.x (Java 21 OpenJDK), Spring AI, Spring WebFlux, Spring Security *(Apache 2.0 / OpenJDK — 100% Free & Open Source)*.
- **Database & Vector Store (Unified)**: **PostgreSQL with `pgvector` extension** *(PostgreSQL License — 100% Free & Open Source)*.
  - Serves as the single unified engine for structured relational entities (users, chats, audit logs) and dense vector embeddings.
  - Eliminates external cloud dependencies and commercial SaaS costs.
- **Embeddings & LLM**:
  - *Primary Free Cloud*: Google AI Studio Gemini 1.5 Flash *(Generous 15 RPM Free Tier)*.
  - *100% Offline / Sovereign Alternative*: Local **Ollama** (Llama 3.1 8B / Gemma 2 9B) with open-source embeddings (`bge-small-en-v1.5` / `all-MiniLM-L6-v2`) via Spring AI / LangChain4j.
- **Deployment**: **Docker & Docker Compose** *(Self-hosted, offline hackathon-ready, zero hosting expense)*.

### 2.2 Optional / Secondary Cloud Alternatives
- **Vector DB**: Qdrant (Self-hosted/Cloud), Pinecone (Proprietary SaaS starter tier).
- **LLMs**: OpenAI API (Paid commercial).
- **Cloud Hosting**: Render, Railway, AWS, Vercel (Hobby tiers).

## 3. Core MVP Features
### 3.1 Jurisdiction Switch
- Store `jurisdiction` in each document chunk metadata.
- Filter vector‑DB queries by `jurisdiction` (`INDIA` vs `INTERNATIONAL`).

### 3.2 Product Classification Engine
- Rule‑based decision tree (classical medicine, proprietary, new drug, food, cosmetic).
- Questionnaire drives classification before RAG is invoked.

### 3.3 IP Protection Router
- After classification, route to appropriate IP type (Patent, Trademark, GI, Design).
- Simple Java service returns list of viable protections.

### 3.4 Regulatory Check Engine
- Mapping table (`product_type → authority → requirements`).
- Returns regulatory guidelines for the selected product.

### 3.5 RAG System (Citation‑Based)
- **Embedding → Vector Search → Keyword Search → Reranker → LLM**.
- Every answer includes structured citation blocks.
- Confidence score (high/medium/low) calculated from retrieval & authority scores.

## 4. Document Ingestion Pipeline
1. Harvest PDFs/HTML from government sites.
2. Text extraction → cleaning → hierarchical chunking (chapter/section/subsection).
3. Generate embeddings → store in vector DB with rich metadata (jurisdiction, section, etc.).

## 5. Citation & Confidence Engine
- Each chunk stores `{document, section, citation, source_url}`.
- LLM prompt enforces: *Only answer using provided context; always cite.*
- Confidence = `0.5*retrievalScore + 0.3*authorityScore + 0.2*citationCoverage`.
- Low confidence triggers safe‑abstention message.

## 6. Database Schema (PostgreSQL)
```sql
CREATE TABLE users(id SERIAL PRIMARY KEY, name TEXT, email TEXT);
CREATE TABLE conversations(id SERIAL PRIMARY KEY, user_id INT, jurisdiction TEXT);
CREATE TABLE documents(id SERIAL PRIMARY KEY, title TEXT, source TEXT, jurisdiction TEXT, version TEXT);
CREATE TABLE document_chunks(id SERIAL PRIMARY KEY, document_id INT, content TEXT, section TEXT, embedding BYTEA);
CREATE TABLE citations(id SERIAL PRIMARY KEY, document_id INT, section TEXT, source_url TEXT);
CREATE TABLE product_classifications(id SERIAL PRIMARY KEY, product_type TEXT, confidence NUMERIC);
CREATE TABLE audit_logs(id SERIAL PRIMARY KEY, user_query TEXT, retrieved_sources TEXT, generated_answer TEXT, timestamp TIMESTAMP);
```

## 7. Backend Service Flow (Package Layout)
```
com.ayurveda.ipr
│   ├─ controller
│   ├─ service
│   │   ├─ QueryService
│   │   ├─ ClassificationService
│   │   ├─ RetrievalService
│   │   ├─ IPAnalysisService
│   │   ├─ RegulatoryService
│   │   ├─ ConfidenceService
│   │   └─ CitationService
│   ├─ rag (Embedding, VectorStore, HybridSearch, Reranker)
│   ├─ agent (Orchestrator, IPAgent, RegulatoryAgent, CitationAgent)
│   ├─ repository
│   ├─ entity
│   └─ config
```

## 8. Roadmap (Phased Development)
**Phase 1 – MVP**: Jurisdiction filter + RAG + Citation + basic UI.
**Phase 2 – Classification & IP Router**: Rule‑based questionnaire, IP options.
**Phase 3 – Hybrid Search & Confidence**: Add keyword search, confidence scoring, safe abstention.
**Phase 4 – Knowledge Graph**: Neo4j for entity relationships.
**Phase 5 – Agentic AI**: Specialized agents (IP, Regulatory, ABS, Citation).
**Phase 6 – Multilingual & Voice**: Bhashini integration, Hindi/Marathi UI.

---
*Only the most critical components are listed (≈70 % of the original detail) to keep the spec concise while preserving the architectural vision.*