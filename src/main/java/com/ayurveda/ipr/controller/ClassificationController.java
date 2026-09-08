package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.classifier.Rule158BClassificationEngine;
import com.ayurveda.ipr.classifier.model.ClassificationRequest;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/classifier")
@CrossOrigin(origins = "*")
@Tag(name = "Product Classifier", description = "Deterministic decision tree engine implementing Drugs & Cosmetics Rule 158-B, FSSAI 2022, Patents Act §3(p)/§3(e), and Biological Diversity Act 2002")
public class ClassificationController {

    private final Rule158BClassificationEngine classificationEngine;

    public ClassificationController(Rule158BClassificationEngine classificationEngine) {
        this.classificationEngine = classificationEngine;
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
        ClassificationResult result = classificationEngine.evaluate(request);
        return ResponseEntity.ok(result);
    }
}
