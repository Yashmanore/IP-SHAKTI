package com.ayurveda.ipr.rag;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static dev.langchain4j.store.embedding.filter.MetadataFilterBuilder.metadataKey;

@Service
public class LegalSearchService {

    private static final Logger log = LoggerFactory.getLogger(LegalSearchService.class);

    private static final String HYBRID_RRF_SQL = """
        WITH vector_matches AS (
            -- 1. Dense Vector Search (pgvector HNSW cosine distance)
            SELECT 
                embedding_id,
                text,
                metadata,
                ROW_NUMBER() OVER (ORDER BY embedding <=> CAST(? AS vector)) AS rank_vec
            FROM legal_document_embeddings
            WHERE metadata->>'jurisdiction' = ?
            ORDER BY embedding <=> CAST(? AS vector)
            LIMIT 15
        ),
        keyword_matches AS (
            -- 2. Sparse Keyword Search (PostgreSQL Full-Text BM25 ts_rank_cd)
            SELECT 
                embedding_id,
                text,
                metadata,
                ROW_NUMBER() OVER (
                    ORDER BY ts_rank_cd(to_tsvector('english', text), plainto_tsquery('english', ?)) DESC
                ) AS rank_kw
            FROM legal_document_embeddings
            WHERE metadata->>'jurisdiction' = ?
              AND to_tsvector('english', text) @@ plainto_tsquery('english', ?)
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
        LIMIT ?;
        """;

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public LegalSearchService(EmbeddingStore<TextSegment> embeddingStore,
                              EmbeddingModel embeddingModel,
                              JdbcTemplate jdbcTemplate,
                              ObjectMapper objectMapper) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Executes Native PostgreSQL Hybrid Search combining Dense HNSW Vector Cosine Distance
     * and Sparse BM25 Full-Text Search via Reciprocal Rank Fusion (RRF, k=60).
     *
     * @param query        Innovator legal query or section reference
     * @param jurisdiction Jurisdiction filter ("INDIA" or "INTERNATIONAL")
     * @param maxResults   Maximum fused results to return
     * @return List of matching legal documents with RRF scores and dense/sparse ranks
     */
    public List<Map<String, Object>> searchHybrid(String query, String jurisdiction, int maxResults) {
        long startTime = System.currentTimeMillis();
        String cleanJurisdiction = (jurisdiction == null || jurisdiction.isBlank()) ? "INDIA" : jurisdiction.trim().toUpperCase();
        int limit = maxResults > 0 ? maxResults : 5;

        log.info("Executing Hybrid RRF Search | Query: '{}' | Jurisdiction: '{}' | Limit: {}", query, cleanJurisdiction, limit);

        // 1. Generate 384-dimensional query embedding via in-process ONNX model
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        float[] vector = queryEmbedding.vector();

        // 2. Format vector as PostgreSQL vector string literal [0.123, -0.456, ...]
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        String vectorString = sb.toString();

        // 3. Execute Unified RRF Query in Neon PostgreSQL
        List<Map<String, Object>> results = jdbcTemplate.query(
                HYBRID_RRF_SQL,
                ps -> {
                    ps.setString(1, vectorString);
                    ps.setString(2, cleanJurisdiction);
                    ps.setString(3, vectorString);
                    ps.setString(4, query);
                    ps.setString(5, cleanJurisdiction);
                    ps.setString(6, query);
                    ps.setInt(7, limit);
                },
                (rs, rowNum) -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("embedding_id", rs.getString("embedding_id"));
                    item.put("text", rs.getString("text"));
                    double rrfScore = rs.getDouble("rrf_score");
                    item.put("score", rrfScore);
                    item.put("rrf_score", rrfScore);
                    // Canonical RRF max possible score for k=60 with 2 rank lists is 2.0 / 61.0 (~0.0328)
                    double maxPossibleRrf = 2.0 / 61.0;
                    double confidence = Math.min(1.0, rrfScore / maxPossibleRrf);
                    item.put("confidence", Math.round(confidence * 100.0) / 100.0);

                    Object rankVec = rs.getObject("rank_vec");
                    item.put("dense_rank", rankVec != null ? ((Number) rankVec).intValue() : null);

                    Object rankKw = rs.getObject("rank_kw");
                    item.put("sparse_rank", rankKw != null ? ((Number) rankKw).intValue() : null);

                    String metaJson = rs.getString("metadata_json");
                    if (metaJson != null && !metaJson.isBlank()) {
                        try {
                            Map<String, Object> metaMap = objectMapper.readValue(metaJson, new TypeReference<>() {});
                            item.put("metadata", metaMap);
                        } catch (Exception e) {
                            log.warn("Failed to parse metadata JSON: {}", e.getMessage());
                            item.put("metadata", Map.of());
                        }
                    } else {
                        item.put("metadata", Map.of());
                    }

                    return item;
                }
        );

        long elapsedMs = System.currentTimeMillis() - startTime;
        log.info("Hybrid RRF Search returned {} matches in {} ms", results.size(), elapsedMs);
        return results;
    }

    /**
     * Shortcut method defaulting to Hybrid RRF search
     */
    public List<Map<String, Object>> search(String query, String jurisdiction, int maxResults) {
        return searchHybrid(query, jurisdiction, maxResults);
    }

    /**
     * Executes Hybrid RRF search and expands the top hits by N previous and N next chunks (default windowSize=5),
     * merging contiguous intervals from the same document into continuous statutory text.
     */
    public List<Map<String, Object>> searchHybridWithWindow(String query, String jurisdiction, int maxResults, int windowSize) {
        List<Map<String, Object>> rawHits = searchHybrid(query, jurisdiction, maxResults);
        return expandWindowedContext(rawHits, windowSize > 0 ? windowSize : 5);
    }

    /**
     * Expands context for retrieved hits by fetching N previous and N next chunks (default windowSize=5),
     * merging contiguous intervals from the same document, and stitching the full statutory chapter.
     *
     * @param hits       Top hits from hybrid search
     * @param windowSize Number of neighbor chunks before and after each hit (e.g. 5)
     * @return Expanded and stitched context blocks preserving ranking and scores
     */
    public List<Map<String, Object>> expandWindowedContext(List<Map<String, Object>> hits, int windowSize) {
        if (hits == null || hits.isEmpty() || windowSize <= 0) {
            return hits != null ? hits : List.of();
        }

        // Group hits by document file_path
        Map<String, List<Map<String, Object>>> groupedByDoc = new java.util.LinkedHashMap<>();
        List<Map<String, Object>> standaloneHits = new ArrayList<>();

        for (Map<String, Object> hit : hits) {
            @SuppressWarnings("unchecked")
            Map<String, Object> meta = (Map<String, Object>) hit.get("metadata");
            String filePath = meta != null ? (String) meta.get("file_path") : null;
            Object chunkIdxObj = meta != null ? meta.get("chunk_index") : null;

            if (filePath != null && !filePath.isBlank() && chunkIdxObj != null) {
                groupedByDoc.computeIfAbsent(filePath, k -> new ArrayList<>()).add(hit);
            } else {
                standaloneHits.add(hit);
            }
        }

        List<Map<String, Object>> expandedResults = new ArrayList<>();

        // Process each document group
        for (Map.Entry<String, List<Map<String, Object>>> entry : groupedByDoc.entrySet()) {
            String filePath = entry.getKey();
            List<Map<String, Object>> docHits = entry.getValue();

            // Build intervals: [max(0, idx - windowSize), idx + windowSize]
            List<int[]> intervals = new ArrayList<>();
            for (Map<String, Object> hit : docHits) {
                @SuppressWarnings("unchecked")
                Map<String, Object> meta = (Map<String, Object>) hit.get("metadata");
                int cIdx = ((Number) meta.get("chunk_index")).intValue();
                int start = Math.max(0, cIdx - windowSize);
                int end = cIdx + windowSize;
                intervals.add(new int[]{start, end});
            }

            // Sort intervals by start index
            intervals.sort(java.util.Comparator.comparingInt(a -> a[0]));

            // Merge overlapping or contiguous intervals
            List<int[]> mergedIntervals = new ArrayList<>();
            for (int[] current : intervals) {
                if (mergedIntervals.isEmpty()) {
                    mergedIntervals.add(new int[]{current[0], current[1]});
                } else {
                    int[] last = mergedIntervals.get(mergedIntervals.size() - 1);
                    if (current[0] <= last[1] + 1) {
                        last[1] = Math.max(last[1], current[1]);
                    } else {
                        mergedIntervals.add(new int[]{current[0], current[1]});
                    }
                }
            }

            String fetchSql = """
                SELECT 
                    (metadata->>'chunk_index')::int as c_idx,
                    metadata->>'page_number' as page_num,
                    metadata->>'section_ref' as sec_ref,
                    text
                FROM legal_document_embeddings
                WHERE metadata->>'file_path' = ?
                  AND (metadata->>'chunk_index')::int BETWEEN ? AND ?
                ORDER BY (metadata->>'chunk_index')::int ASC;
                """;

            for (int[] range : mergedIntervals) {
                int start = range[0];
                int end = range[1];

                // Find the best score among seeds that contributed to this interval
                Map<String, Object> bestSeed = docHits.stream()
                        .filter(h -> {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> m = (Map<String, Object>) h.get("metadata");
                            int idx = ((Number) m.get("chunk_index")).intValue();
                            return idx >= start - windowSize && idx <= end + windowSize;
                        })
                        .max(java.util.Comparator.comparingDouble(h -> ((Number) h.getOrDefault("score", 0.0)).doubleValue()))
                        .orElse(docHits.get(0));

                List<Map<String, Object>> sequence = jdbcTemplate.query(
                        fetchSql,
                        ps -> {
                            ps.setString(1, filePath);
                            ps.setInt(2, start);
                            ps.setInt(3, end);
                        },
                        (rs, rowNum) -> {
                            Map<String, Object> row = new HashMap<>();
                            row.put("c_idx", rs.getInt("c_idx"));
                            row.put("page_num", rs.getString("page_num"));
                            row.put("sec_ref", rs.getString("sec_ref"));
                            row.put("text", rs.getString("text"));
                            return row;
                        }
                );

                if (!sequence.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> seedMeta = (Map<String, Object>) bestSeed.get("metadata");
                    String docTitle = seedMeta != null && seedMeta.containsKey("doc_title") ? (String) seedMeta.get("doc_title") : "Statute";

                    StringBuilder stitchedText = new StringBuilder();
                    stitchedText.append(String.format("=== [%s | Continuous Chunks %d to %d (±%d Window)] ===\n\n", docTitle, start, end, windowSize));

                    java.util.Set<String> sectionRefs = new java.util.LinkedHashSet<>();
                    String firstPage = null;
                    String lastPage = null;

                    for (Map<String, Object> chunk : sequence) {
                        String rawText = (String) chunk.get("text");
                        String pNum = (String) chunk.get("page_num");
                        String sRef = (String) chunk.get("sec_ref");

                        if (pNum != null) {
                            if (firstPage == null) firstPage = pNum;
                            lastPage = pNum;
                        }
                        if (sRef != null && !sRef.isBlank() && !sRef.equalsIgnoreCase("Preamble / General Provisions")) {
                            sectionRefs.add(sRef);
                        }

                        // Remove repetitive bracket headers for clean reading flow
                        if (rawText != null) {
                            String body = rawText;
                            if (body.startsWith("[") && body.contains("]\n")) {
                                body = body.substring(body.indexOf("]\n") + 2);
                            }
                            stitchedText.append(body.trim()).append("\n\n");
                        }
                    }

                    Map<String, Object> expandedHit = new HashMap<>(bestSeed);
                    expandedHit.put("text", stitchedText.toString().trim());
                    expandedHit.put("is_window_expanded", true);
                    expandedHit.put("window_start_chunk", start);
                    expandedHit.put("window_end_chunk", end);
                    expandedHit.put("window_chunk_count", sequence.size());

                    Map<String, Object> updatedMeta = new HashMap<>(seedMeta != null ? seedMeta : Map.of());
                    updatedMeta.put("window_chunks", String.format("%d-%d", start, end));
                    if (firstPage != null && lastPage != null) {
                        updatedMeta.put("page_range", firstPage.equals(lastPage) ? "Page " + firstPage : "Pages " + firstPage + "-" + lastPage);
                    }
                    if (!sectionRefs.isEmpty()) {
                        updatedMeta.put("section_ref", String.join(" / ", sectionRefs));
                    }
                    expandedHit.put("metadata", updatedMeta);

                    expandedResults.add(expandedHit);
                } else {
                    expandedResults.add(bestSeed);
                }
            }
        }

        // Add standalone hits (e.g., TKDL monographs)
        expandedResults.addAll(standaloneHits);

        // Keep highest scores first
        expandedResults.sort((a, b) -> {
            double sA = ((Number) a.getOrDefault("score", 0.0)).doubleValue();
            double sB = ((Number) b.getOrDefault("score", 0.0)).doubleValue();
            return Double.compare(sB, sA);
        });

        return expandedResults;
    }

    /**
     * Search pgvector strictly filtered by user-selected jurisdiction (Dense Vector Only)
     */
    public List<Map<String, Object>> searchLegalCorpus(String query, String jurisdiction, int maxResults, double minScore) {
        log.info("Executing dense-only legal vector search | Query: '{}' | Jurisdiction Filter: '{}'", query, jurisdiction);

        Embedding queryEmbedding = embeddingModel.embed(query).content();
        Filter jurisdictionFilter = metadataKey("jurisdiction").isEqualTo(jurisdiction != null ? jurisdiction.toUpperCase() : "INDIA");

        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .filter(jurisdictionFilter)
                .maxResults(maxResults > 0 ? maxResults : 5)
                .minScore(minScore > 0 ? minScore : 0.65)
                .build();

        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(request);

        List<Map<String, Object>> results = new ArrayList<>();
        for (EmbeddingMatch<TextSegment> match : searchResult.matches()) {
            Map<String, Object> item = new HashMap<>();
            item.put("score", match.score());
            item.put("text", match.embedded().text());
            item.put("metadata", match.embedded().metadata().toMap());
            results.add(item);
        }

        return results;
    }
}
