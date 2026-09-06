import os
import ssl
import urllib.request
import shutil

# Ignore SSL errors for government sites with custom certificates
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8'
}

DOWNLOAD_TARGETS = [
    # --- 1. National Statutes (India Code) ---
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'patents_act_1970.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/9e02bd6e-8946-4131-9eec-b1a0dd71cf80/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'biological_diversity_act_2002.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/bf83f6e3-2c10-4dab-9daa-da46662849d2/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'trade_marks_act_1999.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/7648d2d2-4e14-40dc-80d0-db8f99716fd5/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'drugs_and_cosmetics_act_1940.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/3b64f195-bdb9-4837-afb2-7d7b24ac83d2/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'geographical_indications_act_1999.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/55740471-35c8-4016-a122-c20c019b91ab/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'drugs_and_magic_remedies_act_1954.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/6381cc69-0b65-4e0f-9754-71f0f3bf91b7/content'
    ),
    (
        os.path.join('data', 'raw', 'national', 'statutes', 'plant_varieties_and_farmers_rights_act_2001.pdf'),
        'https://indiacode.gov.in/server/api/core/bitstreams/10f311df-9755-45a6-b81c-f81a63698c54/content'
    ),

    # --- 2. National Rules & Regulations ---
    (
        os.path.join('data', 'raw', 'national', 'rules', 'patent_amendment_rules_2024_gazette.pdf'),
        'https://ipindia.gov.in/frontend/pdf/patents/rules/1_83_1_Patent_Amendment_Rule_2024_Gazette_Copy.pdf'
    ),
    (
        os.path.join('data', 'raw', 'national', 'rules', 'patent_second_amendment_rules_2024.pdf'),
        'https://ipindia.gov.in/frontend/pdf/patents/rules/Patent_second_amendment_rules_2024.pdf'
    ),
    (
        os.path.join('data', 'raw', 'national', 'rules', 'fssai_ayurveda_aahar_regulations_2022.pdf'),
        'https://fssai.gov.in/docs/food-law/regulations/62789a20b54bdGazette_Notification_Ayurveda_Aahara_09_05_2022.pdf'
    ),

    # --- 3. International Treaties & Agreements ---
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'wipo_gratk_treaty_2024.pdf'),
        'https://www.wipo.int/edocs/mdocs/tk/en/gratk_dc/gratk_dc_7.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'cbd_convention_1992.pdf'),
        'https://www.cbd.int/doc/legal/cbd-en.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'nagoya_protocol_2010.pdf'),
        'https://www.cbd.int/abs/doc/protocol/nagoya-protocol-en.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'wto_trips_agreement.pdf'),
        'https://www.wto.org/english/docs_e/legal_e/27-trips.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'pct_patent_cooperation_treaty.pdf'),
        'https://www.wipo.int/documents/d/pct-system/docs-en-texts-pct.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'budapest_treaty_microorganisms.pdf'),
        'https://www.wipo.int/documents/d/treaties/docs-en-budapest.pdf'
    ),

    # --- 4. International Directives & Guidelines ---
    (
        os.path.join('data', 'raw', 'international', 'regulations', 'eu_directive_2004_24_ec_thmpd.pdf'),
        'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32004L0024'
    )
]

def download_file(target_path, url):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        print(f"[EXISTS] {target_path} ({os.path.getsize(target_path):,} bytes)")
        return True

    print(f"[DOWNLOADING] {url} -> {target_path}")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=35) as resp:
            content = resp.read()
            if content.startswith(b'%PDF'):
                with open(target_path, 'wb') as f:
                    f.write(content)
                print(f" -> SUCCESS: {len(content):,} bytes written.")
                return True
            else:
                print(f" -> WARNING: Response header is not PDF: {content[:30]}")
                return False
    except Exception as e:
        print(f" -> FAILED: {e}")
        return False

def main():
    print("=== IP-SHAKTI Legal Corpus Batch Downloader ===")
    success_count = 0
    for target_path, url in DOWNLOAD_TARGETS:
        if download_file(target_path, url):
            success_count += 1
    
    print(f"\nCompleted: {success_count}/{len(DOWNLOAD_TARGETS)} files verified and stored.")

if __name__ == '__main__':
    main()
