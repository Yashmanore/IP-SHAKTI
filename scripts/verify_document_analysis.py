#!/usr/bin/env python3
"""
==============================================================================
UNIFIED DOCUMENT & QUERY STATUTORY ANALYSIS ENGINE (GEMINI LLM)
==============================================================================
Single, universal pipeline for all query types (PDF, Docs, or Traditional Text):
1. Ingests any PDF, document (DOCX, TXT), or traditional text query.
2. Directly passes the input (native PDF / document bytes / text) to Google Gemini LLM.
3. Gemini extracts all critical information (Applicant Credentials, Aadhaar, PAN,
   Phone, Botanical Binomials, Technical Novelty, Section 3(p) TKDL Bar, 
   Regulatory Category, Biodiversity Obligations, Claims) into strict JSON.
4. Single, unified logic handles cosmetic, phytopharmaceutical, proprietary, or classical cases.

Usage:
    python verify_document_analysis.py
    python verify_document_analysis.py ../sample_data_for_test/patent.pdf
    python verify_document_analysis.py ../sample_data_for_test/phytopharmaceutical_patent.pdf
    python verify_document_analysis.py "Can I patent an extract of Ashwagandha with Curcumin for joint inflammation?"
==============================================================================
"""

import os
import sys
import json
import base64
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def load_env_file():
    curr = Path(__file__).resolve()
    for parent in [curr.parent, curr.parent.parent]:
        env_path = parent / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and not os.environ.get(k):
                            os.environ[k] = v
            return

load_env_file()

PROMPT_SCHEMA = """
You are IP-SHAKTI Sahayak's Senior Patent Attorney and AYUSH Regulatory Counsel in India.
Analyze the provided document (PDF/text/query) and extract all critical applicant credentials,
technical specifications, patentability parameters, and statutory regulatory requirements into STRICT JSON.

Return ONLY a valid JSON object matching this schema:
{
  "applicantCredentials": {
    "applicantName": "string",
    "aadhaarNumber": "string or null if not found",
    "panNumber": "string or null if not found",
    "phoneNumber": "string or null if not found",
    "emailAddress": "string or null if not found",
    "locationOrAddress": "string or null if not found"
  },
  "productDetails": {
    "documentTitle": "string",
    "productName": "string",
    "botanicalBinomials": ["string e.g. Withania somnifera, Curcuma longa, Boswellia serrata"],
    "regulatoryCategory": "AYURVEDIC_COSMETIC | PHYTOPHARMACEUTICAL | CLASSICAL_AYURVEDIC_FORMULATION | PROPRIETARY_AYURVEDIC_MEDICINE | AYURVEDA_AAHAR",
    "governingActAndRules": "string e.g. Drugs & Cosmetics Act 1940 Rule 158-B / Rule 122-E Schedule Y",
    "licensingAuthority": "string e.g. State AYUSH Licensing Authority or CDSCO / DCGI Central Licensing Authority"
  },
  "patentabilityAndStatutoryAnalysis": {
    "technicalNovelty": "string detailing novel carrier, selectively enriched fraction, synergistic ratio, etc.",
    "isClassicalScriptureRecipe": false,
    "section3pTraditionalKnowledgeBar": {
      "isBarred": false,
      "rationale": "string explaining Section 3(p) status and how novel delivery/purity overcomes traditional knowledge bar"
    },
    "synergismOrEfficacy": {
      "proven": true,
      "evidence": "string e.g. Combination Index (CI), IC50 enzymatic data, clinical/preclinical parameters"
    },
    "biodiversityActRequirement": "string (NBA Form I/III or State Biodiversity Board Section 7 intimation)",
    "clinicalTrialObligations": "string e.g. Phase I-IV trials under Schedule Y / GCTP or clinical exemption",
    "claimsSummary": [
      {"claimNumber": 1, "type": "PRODUCT", "summary": "string"},
      {"claimNumber": 2, "type": "PROCESS", "summary": "string"}
    ],
    "immediateNextSteps": ["string"]
  }
}
"""

def analyze_document_or_query(input_source):
    """
    Unified logic for processing any input:
    - If input is a PDF: passes PDF bytes directly via Gemini inlineData
    - If input is a DOCX: extracts text and passes to Gemini
    - If input is a file or plain text query: passes text to Gemini
    Gemini extracts all essential information into structured JSON.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[!] Error: GEMINI_API_KEY is not set in environment or .env file.")
        return None

    model_name = os.environ.get("GEMINI_MODEL", "gemini-flash-lite-latest")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    print("=" * 75)
    print("UNIFIED DOCUMENT & QUERY STATUTORY ANALYSIS (GEMINI LLM)")
    print("=" * 75)

    content_parts = []
    source_type = "Traditional Text Query"
    source_name = "Text Input"

    # Check if input is an existing file
    if isinstance(input_source, str) and os.path.exists(input_source):
        file_path = Path(input_source)
        source_name = file_path.name
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            source_type = "PDF Document (Direct LLM Ingestion)"
            pdf_bytes = file_path.read_bytes()
            pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")
            content_parts.append({
                "inlineData": {
                    "mimeType": "application/pdf",
                    "data": pdf_b64
                }
            })
            content_parts.append({"text": PROMPT_SCHEMA})
            print(f"  • Source Mode  : {source_type}")
            print(f"  • Target File  : '{source_name}' ({len(pdf_bytes):,} bytes)")

        elif suffix == ".docx":
            source_type = "Microsoft Word Document (DOCX)"
            with zipfile.ZipFile(str(file_path)) as docx_zip:
                xml_content = docx_zip.read("word/document.xml")
                root = ET.fromstring(xml_content)
                text_parts = [elem.text for elem in root.iter() if elem.text]
                extracted_text = " ".join(text_parts)
            content_parts.append({
                "text": f"{PROMPT_SCHEMA}\n\n=== DOCUMENT TEXT ===\n{extracted_text[:7000]}\n====================="
            })
            print(f"  • Source Mode  : {source_type}")
            print(f"  • Target File  : '{source_name}' ({len(extracted_text):,} chars)")

        else:
            source_type = "Plain Text / Markdown File"
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
            content_parts.append({
                "text": f"{PROMPT_SCHEMA}\n\n=== DOCUMENT TEXT ===\n{extracted_text[:7000]}\n====================="
            })
            print(f"  • Source Mode  : {source_type}")
            print(f"  • Target File  : '{source_name}' ({len(extracted_text):,} chars)")

    else:
        # Traditional text query or pasted document text
        source_type = "Traditional Text / Formulation Query"
        content_parts.append({
            "text": f"{PROMPT_SCHEMA}\n\n=== USER QUERY / TEXT ===\n{str(input_source)}\n========================="
        })
        print(f"  • Source Mode  : {source_type}")
        print(f"  • Query Length : {len(str(input_source))} chars")

    payload = {
        "contents": [{"parts": content_parts}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    print("\n[Step] Calling Google Gemini LLM in Structured JSON Mode...")
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            res_json = json.loads(body)
            candidates = res_json.get("candidates", [])
            if candidates:
                raw_json = candidates[0]["content"]["parts"][0]["text"]
                extracted_data = json.loads(raw_json)

                # Display extracted essential parameters
                creds = extracted_data.get("applicantCredentials", {})
                prod = extracted_data.get("productDetails", {})
                patent = extracted_data.get("patentabilityAndStatutoryAnalysis", {})

                print("\n" + "-" * 75)
                print("EXTRACTED APPLICANT & IDENTIFIER CREDENTIALS (FROM LLM)")
                print("-" * 75)
                print(f"  • Applicant Name : {creds.get('applicantName')}")
                print(f"  • Aadhaar Number : {creds.get('aadhaarNumber')}")
                print(f"  • PAN Number     : {creds.get('panNumber')}")
                print(f"  • Phone Number   : {creds.get('phoneNumber')}")
                print(f"  • Email Address  : {creds.get('emailAddress')}")

                print("\n" + "-" * 75)
                print("EXTRACTED PRODUCT & STATUTORY ANALYSIS")
                print("-" * 75)
                print(f"  • Product Name   : {prod.get('productName')}")
                print(f"  • Botanicals     : {', '.join(prod.get('botanicalBinomials', []))}")
                print(f"  • Category       : {prod.get('regulatoryCategory')}")
                print(f"  • Governing Act  : {prod.get('governingActAndRules')}")
                print(f"  • Authority      : {prod.get('licensingAuthority')}")
                print(f"  • Section 3(p)   : Barred={patent.get('section3pTraditionalKnowledgeBar', {}).get('isBarred')}")
                print(f"  • Novelty Basis  : {patent.get('technicalNovelty')}")
                print(f"  • Biodiversity   : {patent.get('biodiversityActRequirement')}")

                print("\n" + "=" * 30 + " COMPLETE JSON SPECIFICATION " + "=" * 30)
                print(json.dumps(extracted_data, indent=2, ensure_ascii=False))
                print("=" * 75)
                print("\n[SUCCESS] Document analysis completed through single unified LLM logic!")
                return extracted_data
            else:
                print("  [!] Error: No candidates returned by Gemini.")
                return None

    except Exception as e:
        print(f"  [!] Gemini API execution failed: {e}")
        return None

if __name__ == "__main__":
    # Determine target document or query from CLI argument or run both sample PDFs
    if len(sys.argv) > 1:
        target = sys.argv[1]
        analyze_document_or_query(target)
    else:
        # Run default demonstration on patent.pdf
        sample_patent = Path(__file__).resolve().parent.parent / "sample_data_for_test" / "ayurveda_alternative_process_patent_example.pdf"
        print("\n>>> TEST CASE 1: AYURVEDIC COSMETIC PATENT SPECIFICATION (PDF) <<<")
        analyze_document_or_query(str(sample_patent))

        # sample_phyto = Path(__file__).resolve().parent.parent / "sample_data_for_test" / "phytopharmaceutical_patent.pdf"
        # print("\n\n>>> TEST CASE 2: PHYTOPHARMACEUTICAL PATENT SPECIFICATION (PDF) <<<")
        # analyze_document_or_query(str(sample_phyto))

        # print("\n\n>>> TEST CASE 3: TRADITIONAL TEXT QUERY (SWITCHING FROM DOCS TO TEXT) <<<")
        # sample_query = (
        #     "Applicant: Dr. Rajesh Sharma, PAN: ABCPS1234K, Aadhaar: 3344 5566 7788, Phone: +91 9811223344. "
        #     "We have developed a synergistic extract of Withania somnifera and Curcuma longa in a 3:1 ratio "
        #     "showing 4x enhanced bioavailability for rheumatoid arthritis. Can we patent this under Section 3(p)?"
        # )
        # analyze_document_or_query(sample_query)
