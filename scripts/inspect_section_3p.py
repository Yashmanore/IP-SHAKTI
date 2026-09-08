import psycopg2

conn = psycopg2.connect(
    host="ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech",
    port=5432,
    dbname="neondb",
    user="neondb_owner",
    password="npg_4rwHVRYI6bnj",
    sslmode="require"
)
cur = conn.cursor()

cur.execute("""
SELECT metadata->>'doc_title', metadata->>'file_path', metadata->>'chunk_index'
FROM legal_document_embeddings
WHERE metadata->>'file_path' IS NULL OR metadata->>'file_path' ILIKE '%.json'
LIMIT 5;
""")
for r in cur.fetchall():
    print(r[0], '| file_path:', r[1], '| chunk_index:', r[2])

conn.close()
