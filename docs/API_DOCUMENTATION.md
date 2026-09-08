# IP-SHAKTI Sahayak — REST API Documentation

This document outlines all backend endpoints for the **IP-SHAKTI Sahayak** AI Assistant. 
When the backend runs locally, interactive Swagger UI is live at:
👉 **`http://localhost:8080/swagger-ui/index.html`**  
OpenAPI JSON is available at:  
👉 **`http://localhost:8080/v3/api-docs`**

---

## 1. Conversational Assistant (Main Entrypoint)

### `POST /api/v1/chat/message`
Main conversational entrypoint managing the multi-turn dialogue with interactive clarifying chips and 5-Pillar synthesis.

#### Request Body (`ChatMessageRequest`):
```json
{
  "sessionId": "optional-uuid-string",
  "message": "I developed a new Ayurvedic formulation using Ashwagandha. Can I patent it in India?",
  "jurisdiction": "INDIA",
  "clarificationAnswers": {
    "isClassical": "NO",
    "technicalNovelty": "NANO_EXTRACT"
  }
}
```

#### Response Turn 1: Clarification Required (`CLARIFICATION_REQUIRED`)
Returned if `isClassical` or `technicalNovelty` is missing:
```json
{
  "sessionId": "b4e872c0-...",
  "status": "CLARIFICATION_REQUIRED",
  "botMessage": "Before evaluating patentability and regulatory pathway under Indian Law, I need to know whether this formulation is an existing classical scripture recipe or a newly developed formulation...",
  "clarificationPrompt": {
    "step": 1,
    "questionKey": "isClassical",
    "questionText": "Is this formulation directly based on an authoritative classical Ayurvedic text (e.g. Charaka Samhita, Sushruta Samhita, Sharangadhara)?",
    "options": [
      { "label": "Yes (Unaltered Classical Scripture Recipe)", "value": "YES" },
      { "label": "No (Newly Developed / Modified Formulation)", "value": "NO" },
      { "label": "Not sure", "value": "NOT_SURE" }
    ]
  },
  "citationPills": [
    "Patents Act, 1970 §3(p)",
    "TKDL Framework",
    "Drugs & Cosmetics Act First Schedule"
  ]
}
```

#### Response Turn 2: Assessment Complete (`ASSESSMENT_COMPLETE`)
Returned when clarification answers are provided:
```json
{
  "sessionId": "b4e872c0-...",
  "status": "ASSESSMENT_COMPLETE",
  "botMessage": "Assessment complete. Here is the verified 5-pillar IPR, Regulatory, and Biodiversity analysis for your Ashwagandha formulation under Indian and International Law.",
  "confidenceScore": {
    "level": "HIGH",
    "overallScore": 92,
    "retrievalScore": 95,
    "authorityScore": 100,
    "citationCoverage": 90
  },
  "citationPills": [
    "Patents Act 1970 §3(p)",
    "D&C Rules 1945 Rule 158-B",
    "Biological Diversity Act §6",
    "WIPO GRATK Treaty 2024"
  ],
  "pillars": {
    "ipAnalysis": {
      "patentableInIndia": true,
      "verdict": "Novel delivery mechanisms (e.g. nano-carriers) are PATENTABLE under Section 2(1)(j)...",
      "relevantPatentSections": ["Section 2(1)(j)", "Section 3(p)", "Section 3(e)"],
      "filingStrategy": "File patent claims strictly focused on the nano-carrier encapsulation process...",
      "inpassBooleanSyntax": "((IPC: A61K 36/81) AND (Abstract: \"Withania somnifera\" OR \"Ashwagandha\"))",
      "usptoSection101Guidance": "35 U.S.C. § 101 Subject-Matter Eligibility Assessment: Raw extracts barred under Product of Nature doctrine..."
    },
    "regulatoryAnalysis": {
      "productCategory": "Proprietary Ayurvedic Medicine - Category B (New Indication / Modified Form)",
      "licensingAuthority": "AYUSH State Licensing Authority with DCGI / Technical Review",
      "licensingForm": "Apply for Proprietary Ayurvedic Medicine license...",
      "clinicalTrialObligation": "Rule 158-B(1)(B) requires Pilot Clinical Trials on at least 30 patients...",
      "governingActAndRules": "Drugs & Cosmetics Rules 1945, Rule 158-B(1)(B)",
      "ayushEvidenceChecklist": "Rule 158-B(1)(A) Regulatory Submission Dossier: Compile at least 2 published peer-reviewed human clinical trial papers..."
    },
    "absCheck": {
      "complianceStatus": "Prior Intimation to State Biodiversity Board (SBB) required under Section 7 for commercial utilization...",
      "requiredForm": "SBB Form (Prior Intimation under Section 7) + Form III NBA Approval",
      "activeIndianPermitsInCbd": 3561,
      "liveCbdLink": "https://absch.cbd.int/en/countries/IN",
      "governingSection": "Biological Diversity Act 2002, Section 3, Section 6 & Section 7"
    },
    "tkdlCheck": {
      "botanicalBinomial": "Withania somnifera",
      "sanskritName": "Ashwagandha",
      "tkrcIpcClass": "A61K 36/81",
      "priorArtRiskWarning": "High prior art density in TKDL. Under Section 3(p), any patent claim asserting known properties or raw extracts will face automatic refusal...",
      "wipoPatentscopeDeepLink": "https://patentscope.wipo.int/search/en/result.jsf?query=IC:A61K36/81%20AND%20..."
    },
    "sources": [
      {
        "documentTitle": "The Patents Act, 1970",
        "sectionReference": "Section 3(p)",
        "jurisdiction": "INDIA",
        "snippetText": "an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties...",
        "sourceFilePath": "data/raw/national/statutes/Patents_Act_1970.pdf",
        "relevanceScore": 0.88
      }
    ]
  },
  "disclaimer": "Information provided is for educational and guidance purposes under Indian law and does not constitute formal legal counsel."
}
```

---

## 2. Product Classification Engine

### `POST /api/v1/classifier/evaluate`
Direct deterministic Rule 158-B decision tree endpoint.

#### Request Body (`ClassificationRequest`):
```json
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

#### Response (`ClassificationResult`):
```json
{
  "category": "CLASSICAL_AYURVEDIC_FORMULATION",
  "categoryDisplayName": "Classical Ayurvedic Formulation (Shastriya Aushadhi)",
  "governingAct": "Drugs and Cosmetics Act 1940, First Schedule Books; Rule 158-B",
  "licensingAuthority": "AYUSH State Licensing Authority (Form 25-D / Form 24-D)",
  "clinicalTrialRequirement": "COMPLETELY EXEMPT from clinical trials. Enjoys legal presumption of safety...",
  "formulationPatentableInIndia": false,
  "patentabilityVerdict": "STRICTLY NON-PATENTABLE under Section 3(p) of the Patents Act 1970...",
  "relevantPatentSections": [
    "Section 3(p) - Traditional Knowledge Bar (Absolute)",
    "Section 3(e) - Mere Admixture"
  ],
  "recommendedIprStrategy": "Brand Name Trademark Protection (Trade Marks Act 1999)...",
  "nbaComplianceStatus": "Prior Intimation to State Biodiversity Board (SBB) required under Section 7...",
  "requiredNbaForm": "SBB Form (Prior Intimation under Section 7)"
}
```

---

## 3. External Portals & Live Registries

### `GET /api/v1/portals/lookup?query={botanicalName}`
Returns live UN CBD ABSCH permits, InPASS boolean syntax, 1-click WIPO deep-links, USPTO §101 guidance, and AYUSH clinical evidence.

#### Example Request:
`GET http://localhost:8080/api/v1/portals/lookup?query=Ashwagandha`

#### Response (`ExternalPortalsPayload`):
* `abschCompliance`: Live UN CBD IRCC permits (total 3,561 in registry).
* `inpassSearch`: `((IPC: A61K 36/81) AND (Abstract: "Withania somnifera" OR "Ashwagandha"))` with Section 25(1) pre-grant opposition guide.
* `wipoPatentscope`: 1-click deep-link and WIPO GRATK Treaty 2024 disclosure guidance.
* `usptoGuidance`: CPC syntax (`A61K36/81.cpc.`) and 35 U.S.C. §101 Product of Nature doctrine (*Myriad/Alice*).
* `ayushResearchEvidence`: Search URL and Rule 158-B clinical trial exemption checklist.

---

## 4. Legal Vector RAG Search

### `GET /api/v1/rag/search`
Queries the 2,026 chunks in Neon `pgvector` with strict jurisdiction filtering.

#### Parameters:
| Name | Type | Default | Description |
|---|---|---|---|
| `query` | string | *(required)* | Search inquiry text |
| `jurisdiction` | string | `INDIA` | `INDIA` or `INTERNATIONAL` |
| `maxResults` | integer | `5` | Maximum chunks to return |
| `minScore` | number | `0.65` | Minimum cosine similarity threshold |

#### Example Request:
`GET http://localhost:8080/api/v1/rag/search?query=Section%203p%20traditional%20knowledge&jurisdiction=INDIA`
