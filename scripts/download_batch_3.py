import os
import requests
import ssl
import urllib3
urllib3.disable_warnings()

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8'
}

targets = [
    # 1. US FDA Botanical Drug Guidance
    (
        os.path.join('data', 'raw', 'international', 'regulations', 'us_fda_botanical_drug_development_guidance.pdf'),
        'https://www.fda.gov/media/93113/download'
    ),
    # 2. US FDA DSHEA 1994 (Dietary Supplement Health and Education Act)
    (
        os.path.join('data', 'raw', 'international', 'regulations', 'us_fda_dshea_act_1994.pdf'),
        'https://www.govinfo.gov/content/pkg/STATUTE-108/pdf/STATUTE-108-Pg4325.pdf'
    ),
    # 3. CDSCO Phytopharmaceutical Drugs Regulatory Pathway
    (
        os.path.join('data', 'raw', 'national', 'rules', 'cdsco_phytopharmaceutical_guidance_2015.pdf'),
        'https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/Consumer_Section_PDFS/PhytopharmaceuticalGuideline.pdf'
    )
]

for filepath, url in targets:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    print(f"Downloading {url} -> {filepath}...")
    try:
        r = requests.get(url, headers=headers, verify=False, timeout=30)
        if r.status_code == 200 and r.content.startswith(b'%PDF'):
            with open(filepath, 'wb') as f:
                f.write(r.content)
            print(f" -> SUCCESS: {len(r.content):,} bytes written.")
        else:
            print(f" -> FAILED: Status {r.status_code}, starts with {r.content[:20]}")
    except Exception as e:
        print(f" -> ERROR: {e}")
