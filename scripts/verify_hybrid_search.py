import psycopg2
from fastembed import TextEmbedding
import time

conn = psycopg2.connect(
    host="ep-broad-brook-aexnflhy-pooler.c-2.us-east-2.aws.neon.tech",
    port=5432,
    dbname="neondb",
    user="neondb_owner",
    password="npg_4rwHVRYI6bnj",
    sslmode="require"
)
cur = conn.cursor()

embedder = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

HYBRID_SQL = """
WITH vector_matches AS (
    -- 1. Dense Vector Search (pgvector HNSW cosine distance)
    SELECT 
        embedding_id,
        text,
        metadata,
        ROW_NUMBER() OVER (ORDER BY embedding <=> CAST(%s AS vector)) AS rank_vec
    FROM legal_document_embeddings
    WHERE metadata->>'jurisdiction' = %s
    ORDER BY embedding <=> CAST(%s AS vector)
    LIMIT 15
),
keyword_matches AS (
    -- 2. Sparse Keyword Search (PostgreSQL Full-Text BM25 ts_rank_cd)
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
-- 3. Reciprocal Rank Fusion (RRF with canonical k=60)
SELECT 
    COALESCE(v.embedding_id, k.embedding_id) AS embedding_id,
    COALESCE(v.text, k.text) AS text,
    COALESCE(v.metadata, k.metadata)::text AS metadata_json,
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

test_queries = [
    ("Can I patent an Ashwagandha formulation under Section 3(p)?", "INDIA"),
    ("Section 3(p)", "INDIA"),
    ("Rule 158-B", "INDIA"),
    ("Joint pain and knee swelling", "INDIA")
]

print("=" * 80)
print(" VERIFYING HYBRID SEARCH (DENSE HNSW + SPARSE BM25 VIA RECIPROCAL RANK FUSION)")
print("=" * 80)

for query, jurisdiction in test_queries:
    t0 = time.perf_counter()
    query_embedding = list(embedder.embed([query]))[0].tolist()
    vec_str = "[" + ",".join(map(str, query_embedding)) + "]"
    
    t_query_start = time.perf_counter()
    cur.execute(HYBRID_SQL, (vec_str, jurisdiction, vec_str, query, jurisdiction, query, 3))
    rows = cur.fetchall()
    db_ms = (time.perf_counter() - t_query_start) * 1000.0
    total_ms = (time.perf_counter() - t0) * 1000.0

    print(f"\n>> Query: '{query}' (Jurisdiction: {jurisdiction})")
    print(f"   Neon PostgreSQL Latency: {db_ms:.2f} ms | Total (incl. embedding): {total_ms:.2f} ms")
    print(f"   Matches Returned: {len(rows)}")

    max_rrf = 2.0 / 61.0
    for idx, r in enumerate(rows, 1):
        emb_id, text, meta_json, rrf_score, rank_vec, rank_kw = r
        rrf_score = float(rrf_score)
        confidence = min(1.0, rrf_score / max_rrf) * 100.0
        
        # Parse metadata
        meta = meta_json if isinstance(meta_json, dict) else (eval(meta_json) if meta_json else {})
        file_path = meta.get("file_path")
        c_idx = meta.get("chunk_index")
        
        # Clean snippet for windows terminal
        snippet = text.replace("\n", " ")[:140].encode('ascii', 'replace').decode('ascii')
        print(f"   #{idx} RRF: {rrf_score:.5f} ({confidence:.1f}% conf) | Dense Rank: {rank_vec} | Sparse Rank: {rank_kw}")
        print(f"       Doc: {meta.get('doc_title')} | Ref: {meta.get('section_ref')}")
        print(f"       Seed Chunk: {snippet}...")

        # Demonstrate +-5 Window Expansion for top hit
        if idx == 1 and file_path and c_idx is not None:
            c_idx = int(c_idx)
            start_w = max(0, c_idx - 5)
            end_w = c_idx + 5
            cur.execute("""
                SELECT (metadata->>'chunk_index')::int, metadata->>'page_number', text
                FROM legal_document_embeddings
                WHERE metadata->>'file_path' = %s
                  AND (metadata->>'chunk_index')::int BETWEEN %s AND %s
                ORDER BY (metadata->>'chunk_index')::int ASC;
            """, (file_path, start_w, end_w))
            w_rows = cur.fetchall()
            print(f"       [+] EXPANDED CONTEXT (Chunks {start_w} to {end_w} | Total {len(w_rows)} Chunks):")
            stitched_preview = " ".join([wr[2].split("]\n")[-1].replace("\n", " ").strip() for wr in w_rows])[:250]
            clean_stitched = stitched_preview.encode('ascii', 'replace').decode('ascii')
            print(f"           Full Stitched Passage: \"{clean_stitched}...\"")

conn.close()
print("\n" + "=" * 80)
print(" HYBRID SEARCH WITH +-5 WINDOW EXPANSION VERIFICATION COMPLETE")
print("=" * 80)
