package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.rag.CorpusIngestionService;
import com.ayurveda.ipr.rag.LegalSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Map<String, Object>> triggerIngestion(
            @RequestParam(value = "path", required = false) String customPath) {
        Map<String, Object> result = ingestionService.ingestAll(customPath);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint to query the legal RAG with strict jurisdiction filtering
     */
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam("query") String query,
            @RequestParam(value = "jurisdiction", defaultValue = "INDIA") String jurisdiction,
            @RequestParam(value = "maxResults", defaultValue = "5") int maxResults,
            @RequestParam(value = "minScore", defaultValue = "0.65") double minScore) {
        List<Map<String, Object>> matches = searchService.searchLegalCorpus(query, jurisdiction, maxResults, minScore);
        return ResponseEntity.ok(matches);
    }
}
