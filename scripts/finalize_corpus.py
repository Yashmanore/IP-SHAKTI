import os
import requests
import pypdf

# 1. Download Hague and Paris treaties from WIPO
wipo_treaties = [
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'hague_agreement_designs.pdf'),
        'https://www.wipo.int/documents/d/treaties/docs-en-hague.pdf'
    ),
    (
        os.path.join('data', 'raw', 'international', 'treaties', 'paris_convention_industrial_property.pdf'),
        'https://www.wipo.int/documents/d/treaties/docs-en-paris.pdf'
    )
]

headers = {'User-Agent': 'Mozilla/5.0'}
for path, url in wipo_treaties:
    if not os.path.exists(path):
        print(f"Downloading {url} -> {path}...")
        try:
            r = requests.get(url, headers=headers, timeout=20)
            if r.status_code == 200 and r.content.startswith(b'%PDF'):
                with open(path, 'wb') as f:
                    f.write(r.content)
                print(f" -> SUCCESS: {len(r.content):,} bytes")
        except Exception as e:
            print(f" -> ERROR: {e}")
    else:
        print(f"[EXISTS] {path}")

# 2. Extract Standalone NBA Statutory Forms from Biological Diversity Rules 2024
bd_rules_path = os.path.join('data', 'raw', 'national', 'rules', 'biological_diversity_rules_2024.pdf')
forms_dir = os.path.join('data', 'raw', 'national', 'forms')
os.makedirs(forms_dir, exist_ok=True)

if os.path.exists(bd_rules_path):
    reader = pypdf.PdfReader(bd_rules_path)
    form_slices = [
        ('nba_form_1_access_biological_resources.pdf', 61, 63), # 0-indexed: pages 62-63
        ('nba_form_2_transfer_research_results.pdf', 63, 65),   # pages 64-65
        ('nba_form_3_prior_approval_ipr.pdf', 65, 67),          # pages 66-67
        ('nba_form_4_third_party_transfer.pdf', 67, 69)         # pages 68-69
    ]
    for filename, start_idx, end_idx in form_slices:
        out_path = os.path.join(forms_dir, filename)
        writer = pypdf.PdfWriter()
        for page_num in range(start_idx, end_idx):
            if page_num < len(reader.pages):
                writer.add_page(reader.pages[page_num])
        with open(out_path, 'wb') as f_out:
            writer.write(f_out)
        print(f"Created standalone statutory form: {out_path} ({os.path.getsize(out_path):,} bytes)")
