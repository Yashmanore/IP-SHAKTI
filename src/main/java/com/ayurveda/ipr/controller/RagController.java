package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.rag.CorpusIngestionService;
import com.ayurveda.ipr.rag.LegalSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@CrossOrigin(origins = "*")
@Tag(name = "RAG Legal Search & Ingestion", description = "Endpoints for dense vector similarity search across the 2,026 legal chunks in Neon pgvector and corpus ingestion management")
public class RagController {

    private final CorpusIngestionService ingestionService;
    private final LegalSearchService searchService;

    public RagController(CorpusIngestionService ingestionService, LegalSearchService searchService) {
        this.ingestionService = ingestionService;
        this.searchService = searchService;
    }

    /**
     * Endpoint to trigger ingestion of the 27 legal PDFs into PostgreSQL pgvector
     */
    @PostMapping("/ingest")
    @Operation(summary = "Trigger PDF corpus ingestion", description = "Parses and embeds legal PDFs from data/raw/ into PostgreSQL pgvector table")
    public ResponseEntity<Map<String, Object>> triggerIngestion(
            @RequestParam(value = "path", required = false) String customPath) {
        Map<String, Object> result = ingestionService.ingestAll(customPath);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint to query the legal RAG using Hybrid Reciprocal Rank Fusion (pgvector HNSW + PostgreSQL BM25 FTS)
     */
    @GetMapping("/hybrid-search")
    @Operation(
            summary = "Hybrid Search (Dense pgvector + Sparse BM25 via Reciprocal Rank Fusion)",
            description = "Executes fused search combining 384-dim HNSW vector cosine distance and PostgreSQL tsvector/ts_rank_cd full-text search with canonical k=60 RRF scoring to ensure zero-miss precision on exact statutory sections."
    )
    public ResponseEntity<List<Map<String, Object>>> searchHybrid(
            @Parameter(description = "Natural language legal inquiry or statutory section", example = "Can I patent an Ashwagandha formulation under Section 3(p)?")
            @RequestParam("query") String query,
            @Parameter(description = "Jurisdiction filter (INDIA or INTERNATIONAL)", example = "INDIA")
            @RequestParam(value = "jurisdiction", defaultValue = "INDIA") String jurisdiction,
            @Parameter(description = "Maximum fused chunks to retrieve", example = "5")
            @RequestParam(value = "maxResults", defaultValue = "5") int maxResults) {
        List<Map<String, Object>> matches = searchService.searchHybrid(query, jurisdiction, maxResults);
        return ResponseEntity.ok(matches);
    }

    /**
     * Endpoint to query the legal RAG with strict jurisdiction filtering (Dense Vector Only)
     */
    @GetMapping("/search")
    @Operation(
            summary = "Search legal vector corpus (Dense Only)",
            description = "Performs dense vector similarity search with strict metadata filtering on jurisdiction (INDIA vs INTERNATIONAL) against the 2,026 legal chunks in Neon pgvector."
    )
    public ResponseEntity<List<Map<String, Object>>> search(
            @Parameter(description = "Natural language legal inquiry", example = "Can I patent an Ashwagandha formulation?")
            @RequestParam("query") String query,
            @Parameter(description = "Jurisdiction filter (INDIA or INTERNATIONAL)", example = "INDIA")
            @RequestParam(value = "jurisdiction", defaultValue = "INDIA") String jurisdiction,
            @Parameter(description = "Maximum chunks to retrieve", example = "5")
            @RequestParam(value = "maxResults", defaultValue = "5") int maxResults,
            @Parameter(description = "Minimum cosine similarity score threshold", example = "0.65")
            @RequestParam(value = "minScore", defaultValue = "0.65") double minScore) {
        List<Map<String, Object>> matches = searchService.searchLegalCorpus(query, jurisdiction, maxResults, minScore);
        return ResponseEntity.ok(matches);
    }
}
