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
  "jurisdiction": "INDIA",
  "language": "en",
  "detectedLanguage": "en",
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
    "WIPO GRATK Treaty 2024",
    "Trade Marks Act 1999 Class 5"
  ],
  "llmDeliverables": {
    "executiveSummary": {
      "caseTitle": "IPR & Regulatory Blueprint for Ashwagandha Formulation",
      "overallPatentabilityScore": 85,
      "riskLevel": "MEDIUM",
      "primaryStatutoryHurdle": "Patents Act 1970 §3(p) (Traditional Knowledge) & §3(e) (Mere Admixture)",
      "primaryDefensiveStrategy": "Structure claims strictly on novel carrier encapsulation kinetics and proven statistical synergism rather than crude botanical extract."
    },
    "plainLanguageSummary": {
      "targetLanguage": "en",
      "headline": "Plain-Language Summary for Ashwagandha Innovators",
      "canISellToday": "No, commercial manufacturing requires an AYUSH State License (Form 25-D) and NBA compliance first.",
      "patentGuidance": "Novel nano-delivery and synergistic ratios can be patented in India, but raw herbal extracts cannot under Section 3(p).",
      "immediateNextSteps": [
        "Step 1: Obtain Form 25-D manufacturing license from State AYUSH Licensing Authority.",
        "Step 2: Submit NBA Form 1 & Form 3 prior approval under Biological Diversity Act.",
        "Step 3: Register distinctive house mark brand in Class 5 & Class 30."
      ]
    },
    "draftPatentClaims": {
      "claimStrategySummary": "Drafted to circumvent Section 3(p) and Section 3(e) by targeting novel pharmacokinetic delivery vehicles.",
      "section3pDefense": "Claims do not monopolize Withania somnifera per se, but an artificial sub-micron delivery vehicle not disclosed in classical Samhitas.",
      "claims": [
        {
          "claimNumber": 1,
          "type": "INDEPENDENT_PRODUCT",
          "claimText": "1. A synergistic pharmaceutical delivery composition comprising: (a) a standardized fraction of Withania somnifera... (b) a specialized carrier matrix in a weight ratio of 1:2 to 1:5; wherein said composition demonstrates enhanced bioavailability...",
          "statutoryRationale": "Overcomes Section 3(p) bar by monopolizing an artificial carrier kinetics matrix rather than natural botanical per se."
        },
        {
          "claimNumber": 2,
          "type": "DEPENDENT_PROCESS",
          "claimText": "2. A process for preparing the composition of claim 1, comprising controlled ultrasonic-assisted extraction followed by micro-encapsulation...",
          "statutoryRationale": "Novel manufacturing process qualifying under Section 2(1)(j) of Patents Act 1970."
        }
      ]
    }
  },
  "pillars": {
    "ipAnalysis": {
      "patentableInIndia": true,
      "verdict": "Novel delivery mechanisms (e.g. nano-carriers) are PATENTABLE under Section 2(1)(j)...",
      "relevantPatentSections": ["Section 2(1)(j)", "Section 3(p)", "Section 3(e)"],
      "filingStrategy": "File patent claims strictly focused on the nano-carrier encapsulation process...",
      "trademarkGuidance": {
        "recommendedNiceClass": "Class 5 (Ayurvedic Pharmaceuticals & Herbal Formulations), Class 30 (Ayurveda Aahar), Class 3 (Herbal Cosmetics)",
        "houseMarkStrategy": "Register distinctive coined house prefix as brand trademark (e.g. 'BrandName Ashwagandha'). Classical names from First Schedule texts cannot be monopolized under Section 9/11 (Dabur India v. Baidyanath).",
        "classicalNameBarWarning": "Generic classical Ayurvedic formulation names are publici juris and strictly barred from exclusive trademark monopolization.",
        "giRelevance": "Verify geographical origin under GI Act 1999 if raw botanical cultivars originate from registered GI clusters."
      },
      "wipoGratkDisclosure": "Article 3 WIPO GRATK Treaty 2024: Mandatory patent applicant disclosure of genetic resources country of origin (India) and associated traditional knowledge.",
      "designProtectionRelevance": "Designs Act 2000: Novel ergonomic bottle geometry, dropper mechanism, or topical applicator shapes can be registered independently in Class 09-01.",
      "inpassBooleanSyntax": "((IPC: A61K 36/81) AND (Abstract: \"Withania somnifera\" OR \"Ashwagandha\"))",
      "usptoSection101Guidance": "35 U.S.C. § 101 Subject-Matter Eligibility Assessment: Raw extracts barred under Product of Nature doctrine..."
    },
    "regulatoryAnalysis": {
      "productCategory": "Proprietary Ayurvedic Medicine - Category B (New Indication / Modified Form)",
      "licensingAuthority": "AYUSH State Licensing Authority with DCGI / Technical Review",
      "licensingForm": "Apply for Proprietary Ayurvedic Medicine license (Form 25-D)...",
      "clinicalTrialObligation": "Rule 158-B(1)(B) requires Pilot Clinical Trials on at least 30 patients...",
      "governingActAndRules": "Drugs & Cosmetics Rules 1945, Rule 158-B(1)(B)",
      "ayushEvidenceChecklist": "Rule 158-B(1)(A) Regulatory Submission Dossier: Compile at least 2 published peer-reviewed human clinical trial papers...",
      "fssaiOrCosmeticGuidance": "If marketed as Ayurveda Aahar: Central FSSAI License with mandatory Ayurveda Aahar logo required under FSSAI Regulations 2022."
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
        "officialUrl": "https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d",
        "governingBody": "Indian Patent Office / DPIIT",
        "actYear": 1970,
        "relevanceScore": 0.88
      }
    ]
  },
  "actionRoadmap": [
    {
      "stepNumber": 1,
      "phase": "REGULATORY_COMPLIANCE",
      "action": "Apply for AYUSH Manufacturing License (Form 25-D)",
      "authority": "State AYUSH Licensing Authority (SLA)",
      "governingAct": "Drugs and Cosmetics Rules 1945, Rule 158-B",
      "portalName": "e-Aushadhi / State AYUSH Licensing Portal",
      "portalUrl": "https://e-aushadhi.gov.in",
      "mandatory": true,
      "estimatedTimeline": "60-90 days"
    },
    {
      "stepNumber": 2,
      "phase": "BIODIVERSITY_APPROVAL",
      "action": "Submit Form 1 for Commercial Utilization & Form 3 for IPR Prior Approval",
      "authority": "National Biodiversity Authority (Chennai)",
      "governingAct": "Biological Diversity Act 2002, Section 3, 6(1) & 7",
      "portalName": "ABS e-Filing Portal",
      "portalUrl": "https://absefiling.nic.in",
      "mandatory": true,
      "estimatedTimeline": "90-180 days"
    },
    {
      "stepNumber": 3,
      "phase": "IPR_PATENT_PROTECTION",
      "action": "File Process / Drug Delivery Patent Application with Mandatory Origin Declaration (Form 1 & 2)",
      "authority": "Indian Patent Office (IPO / DPIIT)",
      "governingAct": "Patents Act 1970 §2(1)(j), §3(p), §10(4)(d)(ii)",
      "portalName": "InPASS e-Filing Portal",
      "portalUrl": "https://ipindiaonline.gov.in",
      "mandatory": false,
      "estimatedTimeline": "1-3 days for provisional filing"
    },
    {
      "stepNumber": 4,
      "phase": "TRADEMARK_BRAND_PROTECTION",
      "action": "Register Coined House Mark & Product Logo in Class 5 (Pharma) and Class 30 (Aahar)",
      "authority": "Trade Marks Registry (TMR)",
      "governingAct": "Trade Marks Act 1999, Section 18",
      "portalName": "IP India Trademark Portal",
      "portalUrl": "https://ipindiaonline.gov.in",
      "mandatory": true,
      "estimatedTimeline": "7-15 days for formal filing receipt"
    }
  ],
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

---

## 5. Multi-Format Document Ingestion & Analysis

### `POST /api/v1/document/analyze`
Uploads and parses a complete specification or dossier (PDF, DOCX, TXT), performs automated DPDP Act PII masking, extracts statutory parameters via Gemini LLM JSON mode, and returns both the structured profile and the full 5-Pillar assessment.

#### Request (`multipart/form-data`):
* `file`: (Binary PDF, Word `.docx`, or `.txt` specification)
* `sessionId`: (Optional UUID to maintain conversational memory)
* `jurisdiction`: `INDIA` or `INTERNATIONAL` (Default: `INDIA`)
* `language`: `EN`, `HI`, `MR`, or `AUTO` (Default: `AUTO`)

### `POST /api/v1/document/analyze-text`
Analyzes an inline formulation description or specification string via JSON without requiring a file upload.

#### Request Body (`TextAnalysisRequest`):
```json
{
  "text": "Applicant: Dr. Rajesh Sharma, PAN: ABCPS1234K, Aadhaar: 3344 5566 7788. Synergistic extract of Withania somnifera and Curcuma longa in a 3:1 ratio showing 4x bioavailability...",
  "sessionId": "optional-uuid",
  "jurisdiction": "INDIA",
  "language": "EN"
}
```

#### Response (`DocumentAnalysisResponse`):
```json
{
  "extractedProfile": {
    "fileName": "patent.pdf",
    "fileType": "PDF",
    "fileSizeBytes": 142850,
    "sourceMode": "PDF Document (Direct LLM)",
    "applicantCredentials": {
      "applicantName": "Dr. Sunita Deshmukh / AyurCosmeceuticals Pvt Ltd",
      "aadhaarNumber": "9876 5432 1098",
      "panNumber": "ABCDE1234F",
      "phoneNumber": "+91 9822012345",
      "emailAddress": null,
      "locationOrAddress": "Maharashtra and Jammu & Kashmir"
    },
    "productDetails": {
      "documentTitle": "A SYNERGISTIC PHYTO-LIPOSOMAL TOPICAL COSMETIC COMPOSITION...",
      "productName": "Phyto-liposomal topical cosmetic composition comprising Haridra and Kumkumadi actives",
      "botanicalBinomials": ["Curcuma longa", "Crocus sativus", "Pterocarpus santalinus"],
      "regulatoryCategory": "AYURVEDIC_COSMETIC",
      "governingActAndRules": "Drugs & Cosmetics Act 1940, Section 3(aaa), Rule 158-B",
      "licensingAuthority": "State AYUSH Licensing Authority / FDA Maharashtra"
    },
    "patentabilityAndStatutoryAnalysis": {
      "technicalNovelty": "Proprietary sub-micron phospholipid lipid bilayer encapsulation (110-140 nm)...",
      "isClassicalScriptureRecipe": false,
      "section3pTraditionalKnowledgeBar": {
        "isBarred": false,
        "rationale": "Overcomes Section 3(p) TKDL bar by creating an artificial sub-micron liposomal delivery matrix."
      },
      "synergismOrEfficacy": {
        "proven": true,
        "evidence": "Combination Index (CI) of 0.62 under Section 3(e) with 6.2-fold increase in dermal retention."
      },
      "biodiversityActRequirement": "Section 7 intimation to Maharashtra State Biodiversity Board (MSBB).",
      "clinicalTrialObligations": "Cosmetic formulation exemption from therapeutic clinical trials under Schedule Y.",
      "claimsSummary": [
        { "claimNumber": 1, "type": "PRODUCT", "summary": "Sub-micron liposomal composition (110-140 nm)..." },
        { "claimNumber": 2, "type": "PROCESS", "summary": "Process for preparing via rotary thin-film hydration..." }
      ],
      "immediateNextSteps": [
        "File Form 32-A Cosmetic License application with FDA Maharashtra.",
        "Submit Section 7 intimation to MSBB."
      ]
    }
  },
  "assessment": {
    "sessionId": "b4e872c0-...",
    "status": "ASSESSMENT_COMPLETE",
    "jurisdiction": "INDIA",
    "confidenceScore": { "overallScore": 92, "level": "HIGH" },
    "pillars": { ... },
    "llmDeliverables": { ... },
    "actionRoadmap": [ ... ]
  }
}
```


---

## 6. Sovereign Audit & DPDP Act Compliance

### `GET /api/v1/audit/recent`
Returns the 20 most recent sovereign audit logs with redacted personal identifiers.

### `GET /api/v1/audit/session/{sessionId}`
Returns all audit records for a given session UUID.

