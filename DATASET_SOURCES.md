# IP-SHAKTI Sahayak — Authoritative Corpus & Dataset Catalog
> Comprehensive inventory of all National (India) and International legal, regulatory, scientific, and prior-art data sources, public API endpoints, registries, and classical texts for 99%+ citation accuracy.

---

## 1. National Regime (India 🇮🇳)

### 1.1 Statutory Laws & Rules (India Code & Official Gazettes)
| Statute / Rule | Official Identifier / Act ID | Direct URL / Portal | Key Provisions Relevant to Ayurveda IPR |
| :--- | :--- | :--- | :--- |
| **The Patents Act, 1970** (as amended) | Act No. 39 of 1970<br>`a49ad42b-f2dc-4ee2-9884-11ef0839798d` | [India Code - Patents Act](https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d) | **Section 3(p)**: Excludes traditional knowledge or aggregation of known properties.<br>**Section 3(e)**: Mere admixture non-patentable.<br>**Section 10(4)(d)(ii)**: Mandatory disclosure of source and geographical origin of biological material.<br>**Section 25**: Opposition on grounds of TK anticipation. |
| **The Patents (Amendment) Rules, 2024** | GSR 190(E) dated 15 March 2024 | [IP India Patent Rules 2024](https://ipindia.gov.in) | Streamlined statements of working (Form 27), updated examination timelines, concession fees for educational/startups. |
| **The Biological Diversity Act, 2002** (as amended 2023) | Act No. 18 of 2003<br>`000de0a3-39ce-4e18-85f0-0c51b4bdab5d` | [India Code - BD Act](https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d) | **Section 6**: Prior approval of National Biodiversity Authority (NBA) required before applying for IPR based on Indian biological resources/TK.<br>**Section 3 & 4**: Access approvals for non-Indian entities / research transfers.<br>**Section 7**: Prior intimation to State Biodiversity Boards (SBB). |
| **Biological Diversity Rules, 2024 & Amendment Rules 2025** | MoEFCC Notifications | [NBA India Rules](https://www.nbaindia.nic.in/acts-and-rules/rules) | Procedures for Access and Benefit Sharing (ABS), statutory forms, exemptions for registered AYUSH practitioners and codified traditional knowledge. |
| **The Drugs and Cosmetics Act, 1940 & Rules 1945** | Act No. 23 of 1940<br>`8725a8a7-45a4-42e3-9046-e2a6383cd049` | [India Code - D&C Act](https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049) | **Chapter IVA**: Provisions relating to Ayurvedic, Siddha, and Unani drugs (Sections 33A - 33N).<br>**Section 3(a)**: Definitions of ASU drugs.<br>**First Schedule**: Statutory list of 54+ authoritative texts for classical formulations.<br>**Rule 158-B**: Regulatory requirements for licensing patent/proprietary ASU medicines. |
| **Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954** | Act No. 21 of 1954 | [India Code - DMR Act](https://indiacode.gov.in) | Prohibits false/misleading advertisements regarding 54 specified diseases/conditions for Ayurvedic drugs. |
| **FSSAI Ayurveda Aahar Regulations, 2022** | Food Safety and Standards (Ayurveda Aahar) Reg. | [FSSAI Portal](https://fssai.gov.in) | Formulations for food supplements/nutrition based on classical Ayurvedic texts; distinct logo and labeling regulations. |
| **The Geographical Indications of Goods Act, 1999** | Act No. 48 of 1999 | [IP India GI](https://ipindia.gov.in) | Protection of origin-based Ayurvedic products (e.g., Navara rice, Pokkali rice, Malabar pepper, Nilambur teak). |
| **The Trade Marks Act, 1999** | Act No. 47 of 1999<br>`62219d21-0553-405b-9ccb-a11b4d9c41c2` | [India Code - Trade Marks](https://indiacode.gov.in/act/62219d21-0553-405b-9ccb-a11b4d9c41c2) | Protection of brand names, logos, Class 5 (pharmaceuticals & herbal formulations), Class 3 (cosmetics), Class 30/31 (herbal teas/food). |
| **Protection of Plant Varieties & Farmers' Rights Act, 2001** | Act No. 53 of 2001 | [PPV&FR Authority](https://plantauthority.gov.in) | Protection of novel, extant, and farmers' medicinal plant varieties. |

---

### 1.2 Prior Art & Traditional Knowledge Databases
| Repository / System | Managing Body | Access Type & URL | Scope & Content |
| :--- | :--- | :--- | :--- |
| **Traditional Knowledge Digital Library (TKDL)** | CSIR & Ministry of AYUSH | [TKDL Portal](https://www.tkdl.res.in) | **454,000+** formulations/practices (Ayurveda, Unani, Siddha, Sowa Rigpa, Yoga). Classified under Traditional Knowledge Resource Classification (TKRC) mapped to IPC `A61K 36/00`. |
| **First Schedule Authoritative Texts (D&C Act)** | Ministry of AYUSH / Legislative Dept. | [AYUSH First Schedule](https://ayush.gov.in) | **54+ Authoritative Classical Books** including: Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Sharangadhara Samhita, Bhavaprakasha, Bhaishajya Ratnavali, Sahasrayogam, Rasa Tarangini, Ayurvedic Pharmacopoeia of India (API), Ayurvedic Formulary of India (AFI). |
| **Ayurvedic Pharmacopoeia of India (API) & Formulary (AFI)** | Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H) | [PCIM&H Portal](https://pcimh.gov.in) | Official monographs: Part I (single drugs - plants), Part II (compound formulations), physical-chemical standards, TLC/HPTLC profiles. |
| **Ayush Research Portal** | Ministry of AYUSH | [AYUSH Portal](https://ayushportal.nic.in) | Evidence-based clinical trials, pharmacological research, and experimental validation of Ayurvedic formulations. |

---

### 1.3 Registries & Search Endpoints (India)
| System / Registry | Endpoint / Search Interface | Query Capabilities |
| :--- | :--- | :--- |
| **InPASS (Indian Patent Advanced Search System)** | `https://ipindiaservices.gov.in/publicsearch` | Search by Patent Application No., Title, Abstract, IPC Class (`A61K36`, `A61K35`, `A61P`), Applicant, Section 3(p) references. |
| **Trade Marks Registry Public Search** | `https://ipindiaservices.gov.in/tmrpublicsearch` | Search wordmark, phonetics, Vienna code, Class 5 (herbal medicine) and Class 3 (herbal cosmetics). |
| **GI Registry (Geographical Indications)** | `https://ipindiaservices.gov.in/GIRPublic/` | Registered GI applications, geographical specifications, authorised users list. |
| **NBA ABS e-Filing & Monitoring Portal** | `https://www.nbaindia.nic.in` | **Form I** (Access for bio-survey/commercial), **Form II** (Transfer of research results), **Form III** (Prior approval for IPR application), **Form IV** (Third party transfer). |
| **SUGAM Portal (CDSCO)** | `https://cdscoonline.gov.in` | Phytopharmaceutical drug approvals, New Drugs and Clinical Trials applications under NDCT Rules 2019. |

---

## 2. International Regime (Global 🌍)

### 2.1 Multilateral Treaties & Conventions
| Treaty / Agreement | Governing Organization | Official Resource URL | Crucial Articles & Direct Impact on Ayurveda |
| :--- | :--- | :--- | :--- |
| **WIPO GRATK Treaty, 2024** | World Intellectual Property Organization (WIPO) | [WIPO GRATK Treaty 2024](https://www.wipo.int/en/web/traditional-knowledge/wipo-treaty-on-ip-gr-and-associated-tk) | *WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge* (adopted May 24, 2024). **Mandatory disclosure** in patent applications if invention is based on genetic resources or associated TK. |
| **WTO TRIPS Agreement** | World Trade Organization | [WTO TRIPS](https://www.wto.org/english/tratop_e/trips_e/trips_e.htm) | **Article 27.1**: Patentable subject matter.<br>**Article 27.2**: Exclusions for ordre public and human health.<br>**Article 27.3(b)**: Exclusions of plants and animals; protection of plant varieties via sui generis system.<br>**Doha Declaration**: Public health flexibilities. |
| **Convention on Biological Diversity (CBD, 1992)** | United Nations Environment Programme | [CBD Official](https://www.cbd.int/convention/) | **Article 8(j)**: Respect, preserve and maintain knowledge, innovations and practices of indigenous and local communities.<br>**Article 15**: Sovereign rights over natural resources and Access on mutually agreed terms (MAT) + Prior Informed Consent (PIC). |
| **Nagoya Protocol on Access & Benefit Sharing (2010)** | Secretariat of the CBD | [ABS Clearing-House](https://absch.cbd.int/) | Operational framework for fair and equitable benefit sharing. Access and Benefit Sharing Clearing-House (ABSCH) tracking international certificates of compliance (IRCC). |
| **Patent Cooperation Treaty (PCT)** | WIPO | [WIPO PCT](https://www.wipo.int/pct/en/) | International patent filing system. PCT Minimum Documentation includes TKDL and traditional medicine journals as non-patent prior art. |
| **Budapest Treaty** | WIPO | [Budapest Treaty](https://www.wipo.int/treaties/en/registration/budapest/) | International recognition of deposit of microorganisms (relevant for fermented Ayurvedic preparations: Asava, Arishta, probiotic strains). |
| **Madrid System & Hague System** | WIPO | [Madrid System](https://www.wipo.int/madrid/en/) | International trademark and industrial design registrations. |

---

### 2.2 Key Export Market Regulatory Regimes
| Country / Region | Regulatory Body | Framework / Directive | Requirements for Ayurvedic Products |
| :--- | :--- | :--- | :--- |
| **United States 🇺🇸** | US FDA (Food & Drug Administration) | • **DSHEA (1994)** (Dietary Supplement Health and Education Act)<br>• **FDA Botanical Drug Guidance (2016)**<br>• **MoCRA (2022)** (Modernization of Cosmetics Regulation Act) | Ayurveda products mostly sold as **Dietary Supplements** (Structure/Function claims only, no disease cure claims; CGMP 21 CFR Part 111). If sold as prescription **Botanical Drugs**, requires full IND/NDA clinical trials. |
| **European Union 🇪🇺** | European Medicines Agency (EMA) & EFSA | • **Directive 2004/24/EC** (Traditional Herbal Medicinal Products Directive - THMPD)<br>• **Regulation (EC) No 1924/2006** (Nutrition & Health Claims) | Requires proof of **30 years traditional use** (including at least 15 years within the EU) for simplified registration. Otherwise evaluated under full medicinal product rules or as food supplements. |
| **United Kingdom 🇬🇧** | MHRA | Traditional Herbal Registration (THR) Scheme | Quality standards, safety monitoring, traditional use documentation. |
| **WHO Global Centre for Traditional Medicine (GCTM)** | World Health Organization | [WHO TCIM](https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine) | Global benchmarking, quality assurance, safety monographs for medicinal plants. |

---

### 2.3 International Patent & Search Databases
| Database | Organization | Search URL | Relevant Classification / Search Keys |
| :--- | :--- | :--- | :--- |
| **WIPO PATENTSCOPE** | WIPO | [PATENTSCOPE](https://patentscope.wipo.int/search/en/search.jsf) | 129.4M+ patent documents. IPC classes: `A61K 36/00` (Medicinal plants), `A61K 35/00`, `A61P` (Therapeutics). |
| **USPTO Patent Public Search** | US Patent & Trademark Office | [USPTO Search](https://ppubs.uspto.gov/) | US patent grants and applications. Checks 35 U.S.C. 101 (patent eligibility) and 102/103 (prior art). |
| **Espacenet** | European Patent Office (EPO) | [Espacenet](https://worldwide.espacenet.com/) | 140M+ patent documents, CPC classification `A61K 36/00`. |
| **ABS Clearing-House (ABSCH)** | UN CBD | [ABSCH Search](https://absch.cbd.int/en/search) | Internationally Recognized Certificates of Compliance (IRCC), national ABS focal points and laws. |

---

## 3. Data Ingestion & RAG Metadata Schema

To achieve 99%+ accuracy and complete isolation between national and international law, each ingested text chunk must conform to the following metadata structure:

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

## 4. Verification & Corpus Quality Check
- **Zero Hallucination Guardrail**: Strict retrieval constraint preventing the LLM from generating an answer without an exact statutory or treaty citation.
- **Safe Abstention**: If the retrieval confidence score is below 0.75, the system responds with a safe-abstention message directing the user to the National Biodiversity Authority, the Patent Office InPASS portal, or an accredited IP facilitator.
