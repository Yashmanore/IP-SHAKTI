package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.classifier.Rule158BClassificationEngine;
import com.ayurveda.ipr.classifier.model.ClassificationRequest;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import com.ayurveda.ipr.llm.GeminiGenerativeService;
import com.ayurveda.ipr.llm.model.RelevanceEvaluation;
import com.ayurveda.ipr.multilingual.model.Language;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/classifier")
@CrossOrigin(origins = "*")
@Tag(name = "Product Classifier", description = "Deterministic decision tree engine implementing Drugs & Cosmetics Rule 158-B, FSSAI 2022, Patents Act §3(p)/§3(e), and Biological Diversity Act 2002")
public class ClassificationController {

    private final Rule158BClassificationEngine classificationEngine;
    private final GeminiGenerativeService geminiGenerativeService;

    public ClassificationController(Rule158BClassificationEngine classificationEngine,
                                    GeminiGenerativeService geminiGenerativeService) {
        this.classificationEngine = classificationEngine;
        this.geminiGenerativeService = geminiGenerativeService;
    }

    /**
     * POST /api/v1/classifier/evaluate
     * Evaluates an Ayurvedic formulation against Drugs & Cosmetics Act (Rule 158-B),
     * FSSAI Ayurveda Aahar 2022, Indian Patents Act Section 3(p)/3(e), and NBA 2002.
     */
    @PostMapping("/evaluate")
    @Operation(
            summary = "Evaluate Ayurvedic product classification",
            description = "Evaluates an Ayurvedic formulation against D&C Act Rule 158-B (Classical vs Proprietary Cat A/B vs Phytopharmaceutical), FSSAI Ayurveda Aahar 2022, Section 3(p) TK bar, and NBA Biodiversity compliance.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Evaluation verdict with licensing pathway, clinical trial requirements, patentability bar, and NBA forms",
                            content = @Content(schema = @Schema(implementation = ClassificationResult.class))
                    )
            }
    )
    public ResponseEntity<ClassificationResult> evaluateProduct(@RequestBody ClassificationRequest request) {
        String botanicalStr = request.getBotanicalIngredients() != null ? String.join(", ", request.getBotanicalIngredients()) : "";
        String intendedUseStr = request.getIntendedUse() != null ? request.getIntendedUse().name() : "";

        String combinedClaims = java.util.stream.Stream.of(request.getClaimedIndication(), request.getScheduleIBookName())
                .filter(s -> s != null && !s.isBlank())
                .collect(java.util.stream.Collectors.joining(" | "));

        RelevanceEvaluation relevance = geminiGenerativeService.checkDomainRelevance(
                combinedClaims,
                request.getProductName(),
                botanicalStr,
                intendedUseStr,
                Language.ENGLISH
        );

        if (!relevance.isRelevant()) {
            ClassificationResult outResult = new ClassificationResult();
            outResult.setCategoryDisplayName("Out of Scope / Non-Ayurvedic Input (" + relevance.getDetectedDomain() + ")");
            outResult.setGoverningAct("Not Applicable");
            outResult.setLicensingAuthority("Not Applicable");
            outResult.setLicensingProcedure("Not eligible for AYUSH licensing or Rule 158-B pathways.");
            outResult.setClinicalTrialRequirement("Not applicable.");
            outResult.setMandatoryLabelDisclaimers(Collections.singletonList("This product does not qualify under AYUSH or herbal medicine frameworks."));
            outResult.setFormulationPatentableInIndia(false);
            outResult.setPatentabilityVerdict(relevance.getReason());
            outResult.setRelevantPatentSections(Collections.emptyList());
            outResult.setRecommendedIprStrategy(relevance.getSuggestedAction());
            outResult.setNbaComplianceStatus("Not applicable (no Indian biological resources utilized).");
            outResult.setRequiredNbaForm("None");
            outResult.setDecisionTrace(List.of("Domain Gatekeeper: Input rejected as outside AYUSH/Botanical scope: " + relevance.getReason()));
            return ResponseEntity.ok(outResult);
        }

        ClassificationResult result = classificationEngine.evaluate(request);
        return ResponseEntity.ok(result);
    }
}
