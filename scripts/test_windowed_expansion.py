import psycopg2
import json

conn = psycopg2.connect(
    host="ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech",
    port=5432,
    dbname="neondb",
    user="neondb_owner",
    password="npg_4rwHVRYI6bnj",
    sslmode="require"
)
cur = conn.cursor()

# Find chunk index of section 3(p) in Patents Act 1970
cur.execute("""
SELECT metadata->>'file_path', (metadata->>'chunk_index')::int, metadata->>'section_ref'
FROM legal_document_embeddings
WHERE metadata->>'doc_title' = 'Patents Act 1970'
  AND text ILIKE '%traditional knowledge%'
LIMIT 1;
""")
r = cur.fetchone()
file_path, hit_index, sec_ref = r
print(f"Hit Chunk Index: {hit_index} (File: {file_path}, Ref: {sec_ref})")

# Window: 5 previous and 5 next chunks [-5, +5]
start_idx = max(0, hit_index - 5)
end_idx = hit_index + 5
print(f"Expanding Window: [{start_idx} to {end_idx}] (Total {end_idx - start_idx + 1} chunks)")

cur.execute("""
SELECT (metadata->>'chunk_index')::int, metadata->>'page_number', metadata->>'section_ref', text
FROM legal_document_embeddings
WHERE metadata->>'file_path' = %s
  AND (metadata->>'chunk_index')::int BETWEEN %s AND %s
ORDER BY (metadata->>'chunk_index')::int ASC;
""", (file_path, start_idx, end_idx))

chunks = cur.fetchall()
print(f"\nFetched {len(chunks)} continuous chunks from Neon!")
print("=" * 80)
for c in chunks:
    idx, page, sec, txt = c
    # Strip metadata breadcrumb header if present for cleaner reading
    lines = txt.split("\n", 1)
    header = lines[0] if len(lines) > 1 else ""
    body = lines[1] if len(lines) > 1 else txt
    print(f"--- [Chunk #{idx} | Page {page} | Section: {sec}] ---")
    clean_snippet = body[:120].replace("\n", " ").encode('ascii', 'replace').decode('ascii')
    print(f"    {clean_snippet}...")

conn.close()
