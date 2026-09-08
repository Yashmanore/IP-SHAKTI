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
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'legal_document_embeddings';
""")
indexes = cur.fetchall()
print("Existing Indexes on legal_document_embeddings:")
for idx in indexes:
    print(f" - {idx[0]}: {idx[1]}")

cur.execute("SELECT COUNT(*) FROM legal_document_embeddings;")
print(f"Total rows in legal_document_embeddings: {cur.fetchone()[0]}")

# Create GIN index if not exists
print("\nCreating GIN index 'legal_text_fts_idx' if not exists...")
cur.execute("""
CREATE INDEX IF NOT EXISTS legal_text_fts_idx 
ON legal_document_embeddings USING gin(to_tsvector('english', text));
""")
conn.commit()
print("GIN Index verified/created successfully!")

cur.execute("""
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE indexname = 'legal_text_fts_idx';
""")
gin_idx = cur.fetchone()
print(f"Confirmed GIN Index in Neon: {gin_idx}")

conn.close()
