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
SELECT 
    plainto_tsquery('english', 'Section 3(p)'),
    websearch_to_tsquery('english', 'Section 3(p)'),
    plainto_tsquery('english', 'Can I patent Ashwagandha under Section 3(p)?'),
    websearch_to_tsquery('english', 'Can I patent Ashwagandha under Section 3(p)?');
""")
r = cur.fetchone()
print("plainto_tsquery('Section 3(p)'):", r[0])
print("websearch_to_tsquery('Section 3(p)'):", r[1])
print("plainto_tsquery long:", r[2])
print("websearch_to_tsquery long:", r[3])

conn.close()
