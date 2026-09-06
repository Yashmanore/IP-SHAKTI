import requests
from bs4 import BeautifulSoup

headers = {'User-Agent': 'Mozilla/5.0'}
for tid in ['500864', '288637', '283781']:
    url = f'https://www.wipo.int/wipolex/en/text/{tid}'
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    links = []
    for a in soup.find_all('a', href=True):
        if 'pdf' in a['href'].lower() or 'download' in a['href'].lower():
            links.append(a['href'])
    print(f"ID {tid}: Found {len(links)} candidate links:")
    for l in links[:5]:
        print("  ", l)
