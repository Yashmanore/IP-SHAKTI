# IP‑SHAKTI Sahayak

## Problem Statement (ID 26045)

Ayurveda rests on a vast corpus of codified and community‑held traditional knowledge (TK) and on therapeutics derived from plant, microbial and animal sources. Protecting and commercialising an Ayurvedic product means navigating several overlapping regimes at once:
- Patents, Geographical Indications (GI), Trademarks, Copyright, Designs, Trade Secrets, Plant‑Variety Rights
- Access‑and‑Benefit‑Sharing (ABS) duties stemming from India’s sovereignty over its biological resources
- Drug‑regulatory frameworks that decide whether a formulation is a classical medicine, a proprietary medicine, a new drug, a phytopharmaceutical, a food or a cosmetic.

Practitioners, researchers, AYUSH startups, MSMEs and cultivators routinely struggle with this complexity. The result is two‑fold:
1. Legitimate Ayurvedic innovation is under‑protected and under‑commercialised.
2. India’s traditional knowledge remains exposed to misappropriation abroad.

Recent regulatory shifts (2024 Patent & Biodiversity Rules, WIPO GRATK Treaty 2024, evolving advertising and labelling laws) increase the need for authoritative, plain‑language guidance – a tool that currently does not exist for the AYUSH community.

---

## Solution Overview

**IP‑SHAKTI Sahayak** is a multilingual, Retrieval‑Augmented Generation (RAG) AI assistant that provides IP‑related and regulatory guidance for Ayurvedic products, with explicit jurisdiction separation (India vs International). Every answer is:
- **Source‑cited** (statute, rule, treaty article, case law, or registry record)
- **Jurisdiction‑clear** (never conflates national and international regimes)
- **Confidence‑rated** (high/medium/low) with safe‑abstention when uncertain
- **Multilingual** (Hindi, Marathi, English via Bhashini or Gemini multilingual models)
- **Disclaimer‑driven** (information only, not legal advice)

The system works in phases:
1. **Jurisdiction toggle** – user selects India or International
2. **Product classification questionnaire** – determines whether the formulation is classical Ayurvedic medicine, proprietary, new drug, phytopharmaceutical, Ayurveda‑Aahar/nutraceutical, or cosmetic
3. **RAG retrieval layer** – curated, version‑tracked corpus of statutes, rules, treaties, TKDL / prior‑art, ABS guidelines, case law
4. **AI reasoning** – routes the query through IP‑protection and regulatory‑check modules
5. **Citation‑based answer** – presents actionable next steps and escalation paths

---

## Core Modules

### 1️⃣ IP Protection 🛡️
Identifies the most suitable IP route for the user’s Ayurvedic product.
| Product Situation | Suggested IP | Simple Explanation |
|-------------------|--------------|--------------------|
| New formulation/invention | **Patent** | Grants exclusive rights if novelty & inventive step are met. |
| Brand name or logo | **Trademark** | Protects the commercial identity. |
| Traditional regional product | **Geographical Indication (GI)** | Recognises the product’s origin‑linked reputation. |
| Packaging or design | **Design protection** | Safeguards visual appearance. |
| Traditional knowledge | **TKDL / Prior‑art** | Defends against misappropriation under §3(p) of the Patents Act. |

### 2️⃣ Regulatory Check & Rule 158-B Product Classifier 📋
Maps the product classification to the relevant Indian and International regulatory regimes via a deterministic statutory decision tree:

```mermaid
flowchart TD
    Start([Innovator Enters Product Details]) --> Q1{"Is exact formulation found in<br/>First Schedule Authoritative Books?<br/><i>e.g., Charaka, Sharangadhara</i>"}

    Q1 -->|YES| Q2{"Was the formula, ratio, or<br/>excipients modified?"}
    Q2 -->|NO| CLASSICAL["<b>CLASSICAL AYURVEDIC FORMULATION</b><br/>D&C Act Form 24-D/25-D<br/>Sec 3(p) Patent Bar: TK<br/>No Clinical Trials Needed"]
    Q2 -->|YES| PROPRIETARY["<b>PROPRIETARY AYURVEDIC MEDICINE</b><br/>D&C Rules 1945 Rule 158-B"]

    Q1 -->|NO| Q3{"What is the primary intended use?"}

    Q3 -->|"Therapeutic Treatment /<br/>Disease Mitigation"| PROPRIETARY
    Q3 -->|"Cleansing, Beautifying,<br/>Skin/Hair Application"| COSMETIC["<b>AYURVEDIC COSMETIC</b><br/>D&C Act Sec 3(aaa)<br/>No therapeutic disease claims<br/>Process/base patentable"]
    Q3 -->|"Food/Dietary Supplement,<br/>Nutritional Support"| AAHAR["<b>AYURVEDA AAHAR</b><br/>FSSAI Regs 2022<br/>Mandatory Ayurveda Aahar Logo<br/>Central FSSAI License"]

    PROPRIETARY --> Q4{"Is it an unaltered ingredient combo<br/>or novel extract/new indication?"}
    Q4 -->|"Classical Ingredients,<br/>Existing Indication"| PROP_A["<b>Rule 158-B(1)(A)</b><br/>Published Safety Data Required"]
    Q4 -->|"New Indication / Altered Route"| PROP_B["<b>Rule 158-B(1)(B)</b><br/>Pilot Clinical Trials Required"]
    Q4 -->|"Novel Phytochemical Extract"| PROP_C["<b>Phytopharmaceutical</b><br/>Full Safety & Clinical Trials"]
```

#### Deterministic Regulatory Mapping:
| Classification | Governing Act & Authority | Clinical Trial Obligations | IPR / Patentability Outcome |
|:---|:---|:---|:---|
| **Classical Ayurvedic Formulation** | **AYUSH** (Form 25-D / 24-D)<br>Drugs & Cosmetics Act 1940 | **Completely Exempt** (Presumption of traditional safety) | **Non-patentable** under **Section 3(p)** (TK) & **Section 3(e)**. House trademark only. |
| **Proprietary Medicine (Cat A)** | **AYUSH** (Rule 158-B(1)(A)) | Published safety data + acute toxicity data | Formulation barred under §3(p); novel extraction/NDDS processes patentable. |
| **Proprietary Medicine (Cat B)** | **AYUSH** (Rule 158-B(1)(B)) | Pilot clinical trials (≥30 patients) required | Patentable only if statistical synergism is demonstrated (§3(e)). |
| **Phytopharmaceutical Drug** | **CDSCO / DCGI** (Rule 122-E) | Full Phase I, II, III clinical evidence + GMP | Patentable under §2(1)(j) & §3(d). NBA Form III required. |
| **Ayurveda Aahar** | **FSSAI** (Ayurveda Aahar Regs 2022) | Exempt; heavy metals/pesticide testing mandatory | Recipe barred under §3(p); proprietary process patentable. Food license (not drug). |
| **Ayurvedic Cosmetic** | **AYUSH / D&C Act** (Sec 3(aaa), Form 32-A) | BIS safety & skin irritation standards | Vehicle/base formulation patentable. No therapeutic disease claims permitted. |

#### Example Classifier API Request & Response:

**Request: Classical Formulation Check**
```json
POST /api/v1/classifier/evaluate
{
  "productName": "Maha Sudarshan Churna",
  "matchesScheduleIBook": true,
  "scheduleIBookName": "Sharangadhara Samhita",
  "formulaOrRatioModified": false,
  "intendedUse": "THERAPEUTIC_TREATMENT",
  "applicantType": "INDIAN_COMPANY",
  "commercialUtilization": true
}
```

**Output Verdict:**
```json
{
  "category": "CLASSICAL_AYURVEDIC_FORMULATION",
  "categoryDisplayName": "Classical Ayurvedic Formulation (Shastriya Aushadhi)",
  "governingAct": "Drugs and Cosmetics Act 1940, First Schedule Books; Rule 158-B",
  "licensingAuthority": "AYUSH State Licensing Authority (Form 25-D / Form 24-D)",
  "clinicalTrialRequirement": "COMPLETELY EXEMPT from clinical trials. Enjoys legal presumption of safety and efficacy based on centuries of documented traditional usage in authoritative texts.",
  "formulationPatentableInIndia": false,
  "patentabilityVerdict": "STRICTLY NON-PATENTABLE. Section 3(p) of the Indian Patents Act 1970 explicitly prohibits patenting any traditional formulation already documented in classical scriptures (and indexed in TKDL).",
  "relevantPatentSections": [
    "Section 3(p) - Traditional Knowledge Bar (Absolute)",
    "Section 3(e) - Mere Admixture"
  ],
  "recommendedIprStrategy": "Brand Name Trademark Protection (Trade Marks Act 1999). Note: The generic classical name ('Maha Sudarshan Churna') CANNOT be trademarked, but your brand prefix can (e.g., 'Arogya Maha Sudarshan Churna').",
  "nbaComplianceStatus": "Prior Intimation to State Biodiversity Board (SBB) required under Section 7 for commercial utilization.",
  "requiredNbaForm": "SBB Form (Prior Intimation to State Biodiversity Board under Section 7)"
}
```

### 3️⃣ Next Steps / Escalation 🚀
After analysis, the assistant presents concrete actions:
- Verify if the formulation already exists in TKDL / prior‑art databases.
- Run a patent‑eligibility check.
- Confirm ABS obligations (Nagoya Protocol, Biodiversity Act).
- File trademark or GI application.
- Initiate regulatory approvals (AYUSH licence, CDSCO trial, FSSAI registration).
- If the query is too complex or confidence is low, the system **escalates** to a human IP/legal expert (audit log created, user notified).

---

## End‑to‑End Flow
```mermaid
flowchart TD
    A[Ask IPR Question] --> B{Select Jurisdiction}
    B -->|India| C[Product Classification]
    B -->|International| C
    C --> D[RAG Knowledge Base]
    D --> E[AI Reasoning]
    E -->|IP Protection| F[IP Protection Module]
    E -->|Regulatory Check| G[Regulatory Module]
    F & G --> H[Citation‑Based Answer]
    H --> I[Next Steps / Escalation]
```

## Technical Highlights (100% Free & Open-Source Default)
- **Frontend**: React + Vite, Tailwind CSS, i18next for multilingual UI *(MIT License)*.
- **Backend**: Spring Boot (Java 21 OpenJDK), Spring AI, WebFlux, Spring Security *(Apache 2.0)*.
- **Unified Database & Vector Store**: **PostgreSQL + `pgvector`** *(Primary Default — 100% Open Source, $0 cost, zero cloud vendor lock-in)*. Handles relational metadata, conversations, and dense legal embeddings in a single engine.
- **AI & RAG Engine**:
  - *Primary Free Cloud*: Google AI Studio Gemini API *(15 RPM Free Tier)*.
  - *Offline / Self-Hosted FOSS*: Local **Ollama** (Llama 3.1 / Gemma 2) + Open-Source Embeddings (`bge-small-en-v1.5`) via Spring AI / LangChain4j.
  - *Hybrid Search*: Vector similarity search combined with PostgreSQL BM25 full-text keyword search and cross-encoder reranking.
- **Deployment**: **Docker & Docker Compose** for reproducible, 1-command deployment (runs completely offline for hackathon demos).
- **Security & Sovereignty**: National data privacy (DPDP Act alignment), audit logging, and strict 'Information, not legal advice' disclaimers.

---

## Getting Started (100% Free & Local Setup)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Yashmanore/IP-SHAKTI.git
   cd IP-SHAKTI
   ```
2. **Start PostgreSQL with `pgvector` via Docker Compose**:
   ```bash
   docker compose up -d postgres
   ```
3. **Inspect the Authoritative Corpus**:
   - All 27 verified Gazette & Treaty PDFs are pre-loaded in `data/raw/` — see [DATASET_SOURCES.md](file:///d:/general/GenAI/IP-SHAKTI/DATASET_SOURCES.md).
4. **Run the Spring Boot Backend (Maven)**:
   ```bash
   mvn spring-boot:run
   ```
5. **Run the React Frontend**:
   ```bash
   cd frontend && npm install && npm run dev
   ```
6. Open your browser at `http://localhost:5173` to test the jurisdiction toggle, classification questionnaire, and citation RAG!

---

## Disclaimer
The assistant provides **information only** and **does not constitute legal advice**. Users should consult qualified IP/legal professionals for definitive guidance.

---

*Repository structure, detailed API specs, and contributor guidelines are documented in the `docs/` folder.*