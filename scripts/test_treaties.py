import requests

headers = {'User-Agent': 'Mozilla/5.0'}
candidates = [
    ('WTO TRIPS PDF', 'https://www.wto.org/english/docs_e/legal_e/27-trips.pdf'),
    ('WTO TRIPS WTO doc', 'https://www.wto.org/english/docs_e/legal_e/trips_e.doc'),
    ('WIPO PCT Direct', 'https://www.wipo.int/export/sites/www/pct/en/texts/pdf/pct.pdf'),
    ('WIPO Treaties PDF', 'https://www.wipo.int/treaties/en/text.jsp?file_id=288637'),
    ('WIPO Budapest', 'https://www.wipo.int/treaties/en/text.jsp?file_id=283781'),
    ('US FDA Botanical', 'https://www.fda.gov/media/93113/download?attachment')
]

for name, u in candidates:
    try:
        r = requests.head(u, headers=headers, allow_redirects=True, timeout=10)
        print(name, r.status_code, r.headers.get('content-type'), r.headers.get('content-length'))
    except Exception as e:
        print(name, 'ERROR:', e)
