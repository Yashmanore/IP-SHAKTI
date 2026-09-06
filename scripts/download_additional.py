import os
import ssl
import urllib.request

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml,application/pdf;q=0.9,*/*;q=0.8'
}

ADDITIONAL_DOWNLOADS = [
    # NBA Statutory Forms (I to IV)
    (
        os.path.join('data', 'raw', 'national', 'forms', 'nba_form_1_access_biological_resources.pdf'),
        'http://nbaindia.org/uploaded/pdf/Application_Form_I.pdf'
    ),
    (
        os.path.join('data', 'raw', 'national', 'forms', 'nba_form_2_transfer_research_results.pdf'),
        'http://nbaindia.org/uploaded/pdf/Application_Form_II.pdf'
    ),
    (
        os.path.join('data', 'raw', 'national', 'forms', 'nba_form_3_prior_approval_ipr.pdf'),
        'http://nbaindia.org/uploaded/pdf/Application_Form_III.pdf'
    ),
    (
        os.path.join('data', 'raw', 'national', 'forms', 'nba_form_4_third_party_transfer.pdf'),
        'http://nbaindia.org/uploaded/pdf/Application_Form_IV.pdf'
    ),
    # NBA ABS Regulations
    (
        os.path.join('data', 'raw', 'national', 'rules', 'nba_abs_regulations_2014_gazette.pdf'),
        'http://nbaindia.org/uploaded/pdf/Notification_of_ABS_Regulation.pdf'
    ),
    # Pharmacopoeia (API Sample Monograph / Quality Standards from PCIM&H)
    (
        os.path.join('data', 'raw', 'national', 'pharmacopoeia', 'ayurvedic_pharmacopoeia_of_india_standards.pdf'),
        'https://pcimh.gov.in/WriteReadData/CMS/Quality%20Standard%20for%20Indian%20Medicinal%20Plants%20Vol%201.pdf'
    ),
    # US FDA Botanical Drug Guidance
    (
        os.path.join('data', 'raw', 'international', 'guidelines', 'us_fda_botanical_drug_development_guidance.pdf'),
        'https://www.fda.gov/media/93113/download'
    ),
    # WHO Traditional Medicine Strategy / Guidelines
    (
        os.path.join('data', 'raw', 'international', 'guidelines', 'who_traditional_medicine_strategy.pdf'),
        'https://iris.who.int/bitstream/handle/10665/92455/9789241506090_eng.pdf'
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
        with urllib.request.urlopen(req, context=ctx, timeout=40) as resp:
            content = resp.read()
            if content.startswith(b'%PDF'):
                with open(target_path, 'wb') as f:
                    f.write(content)
                print(f" -> SUCCESS: {len(content):,} bytes written.")
                return True
            else:
                print(f" -> WARNING: Response is not PDF (starts with {content[:30]})")
                return False
    except Exception as e:
        print(f" -> FAILED: {e}")
        return False

def main():
    print("=== Downloading Additional Guidelines & Forms ===")
    for target_path, url in ADDITIONAL_DOWNLOADS:
        download_file(target_path, url)

if __name__ == '__main__':
    main()
