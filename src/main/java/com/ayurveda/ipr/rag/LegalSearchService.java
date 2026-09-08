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
