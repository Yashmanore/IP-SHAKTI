package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.classifier.Rule158BClassificationEngine;
import com.ayurveda.ipr.classifier.model.ClassificationRequest;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/classifier")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<ClassificationResult> evaluateProduct(@RequestBody ClassificationRequest request) {
        ClassificationResult result = classificationEngine.evaluate(request);
        return ResponseEntity.ok(result);
    }
}
