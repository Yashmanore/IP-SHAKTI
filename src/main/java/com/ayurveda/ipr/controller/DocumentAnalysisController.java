package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.document.model.DocumentAnalysisResponse;
import com.ayurveda.ipr.document.service.DocumentAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/document")
@Tag(name = "Document Analysis", description = "Multi-format document ingestion (PDF, DOCX, TXT) and automated 5-Pillar IPR & regulatory analysis")
@CrossOrigin(origins = "*")
public class DocumentAnalysisController {

    private final DocumentAnalysisService documentAnalysisService;

    public DocumentAnalysisController(DocumentAnalysisService documentAnalysisService) {
        this.documentAnalysisService = documentAnalysisService;
    }

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload and analyze document (PDF, DOCX, TXT)",
            description = "Extracts technical claims, DPDP masks personal data, and generates a comprehensive 5-pillar IPR, Regulatory, and Biodiversity legal assessment."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Document successfully extracted and analyzed",
            content = @Content(schema = @Schema(implementation = DocumentAnalysisResponse.class))
    )
    public ResponseEntity<DocumentAnalysisResponse> uploadAndAnalyze(
            @Parameter(description = "Uploaded patent specification, protocol, or dossier (PDF, DOCX, TXT)")
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "Optional session UUID for conversation history continuity")
            @RequestParam(value = "sessionId", required = false) String sessionId,

            @Parameter(description = "Statutory jurisdiction ('INDIA' or 'INTERNATIONAL')")
            @RequestParam(value = "jurisdiction", defaultValue = "INDIA") String jurisdiction,

            @Parameter(description = "Target Language code ('EN', 'HI', 'MR', or 'AUTO')")
            @RequestParam(value = "language", defaultValue = "AUTO") String language) {

        DocumentAnalysisResponse response = documentAnalysisService.analyzeDocument(file, sessionId, jurisdiction, language);
        return ResponseEntity.ok(response);
    }

    public record TextAnalysisRequest(
            String text,
            String sessionId,
            String jurisdiction,
            String language
    ) {}

    @PostMapping(value = "/analyze-text", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Analyze traditional text formulation query or specification",
            description = "Analyzes a raw text query, DPDP masks personal data, extracts structured parameters via Gemini LLM, and generates 5-pillar IPR analysis."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Text query successfully analyzed",
            content = @Content(schema = @Schema(implementation = DocumentAnalysisResponse.class))
    )
    public ResponseEntity<DocumentAnalysisResponse> analyzeTextQuery(@RequestBody TextAnalysisRequest request) {
        String query = request.text() != null ? request.text() : "";
        String sessionId = request.sessionId();
        String jurisdiction = request.jurisdiction() != null ? request.jurisdiction() : "INDIA";
        String language = request.language() != null ? request.language() : "AUTO";

        DocumentAnalysisResponse response = documentAnalysisService.analyzeTextQuery(query, sessionId, jurisdiction, language);
        return ResponseEntity.ok(response);
    }
}

