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
     * Endpoint to query the legal RAG with strict jurisdiction filtering
     */
    @GetMapping("/search")
    @Operation(
            summary = "Search legal vector corpus",
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
