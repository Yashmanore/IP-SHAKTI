import psycopg2
from fastembed import TextEmbedding

# 1. Connect
conn = psycopg2.connect(
    host="ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech",
    port=5432,
    dbname="neondb",
    user="neondb_owner",
    password="npg_4rwHVRYI6bnj",
    sslmode="require"
)
cur = conn.cursor()

# 2. Embed query
query = "Section 3(p)"
embedder = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
query_embedding = list(embedder.embed([query]))[0].tolist()
vec_str = "[" + ",".join(map(str, query_embedding)) + "]"

jurisdiction = "INDIA"
keyword_query = "Section 3(p)"

sql = """
WITH vector_matches AS (
    -- 1. Dense Vector Search (pgvector HNSW)
    SELECT 
        embedding_id,
        text,
        metadata,
        ROW_NUMBER() OVER (ORDER BY embedding <=> %s::vector) AS rank_vec
    FROM legal_document_embeddings
    WHERE metadata->>'jurisdiction' = %s
    ORDER BY embedding <=> %s::vector
    LIMIT 15
),
keyword_matches AS (
    -- 2. Sparse Keyword Search (PostgreSQL Full-Text BM25)
    SELECT 
        embedding_id,
        text,
        metadata,
        ROW_NUMBER() OVER (
            ORDER BY ts_rank_cd(to_tsvector('english', text), plainto_tsquery('english', %s)) DESC
        ) AS rank_kw
    FROM legal_document_embeddings
    WHERE metadata->>'jurisdiction' = %s
      AND to_tsvector('english', text) @@ plainto_tsquery('english', %s)
    ORDER BY rank_kw ASC
    LIMIT 15
)
-- 3. Reciprocal Rank Fusion (RRF)
SELECT 
    COALESCE(v.embedding_id, k.embedding_id) AS embedding_id,
    COALESCE(v.text, k.text) AS text,
    COALESCE(v.metadata, k.metadata) AS metadata,
    (
        COALESCE(1.0 / (60.0 + v.rank_vec), 0.0) + 
        COALESCE(1.0 / (60.0 + k.rank_kw), 0.0)
    ) AS rrf_score,
    v.rank_vec,
    k.rank_kw
FROM vector_matches v
FULL OUTER JOIN keyword_matches k ON v.embedding_id = k.embedding_id
ORDER BY rrf_score DESC
LIMIT %s;
"""

cur.execute(sql, (vec_str, jurisdiction, vec_str, keyword_query, jurisdiction, keyword_query, 5))
rows = cur.fetchall()

print(f"\n--- Hybrid Search Results for '{query}' ---")
for idx, r in enumerate(rows, 1):
    emb_id, text, meta, rrf_score, rank_vec, rank_kw = r
    print(f"\n#{idx} [RRF Score: {rrf_score:.5f} | Dense Rank: {rank_vec} | Sparse Rank: {rank_kw}]")
    print(f"Title: {meta.get('doc_title')}")
    print(f"Ref: {meta.get('section_ref')}")
    snippet = text[:200].encode('ascii', 'replace').decode('ascii')
    print(f"Snippet: {snippet}...")

conn.close()
