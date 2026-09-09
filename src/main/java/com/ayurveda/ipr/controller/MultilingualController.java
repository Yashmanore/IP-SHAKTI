package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.multilingual.MultilingualTranslationService;
import com.ayurveda.ipr.multilingual.model.Language;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller providing dedicated multilingual translation and language detection
 * for Hindi (हिन्दी) and Marathi (मराठी) Ayurvedic legal inquiries.
 */
@RestController
@RequestMapping("/api/v1/multilingual")
@CrossOrigin(origins = "*")
@Tag(name = "Multilingual Engine", description = "Endpoints for language detection, query normalization, and translation across Hindi, Marathi, and English")
public class MultilingualController {

    private final MultilingualTranslationService translationService;

    public MultilingualController(MultilingualTranslationService translationService) {
        this.translationService = translationService;
    }

    /**
     * GET /api/v1/multilingual/languages
     * Returns list of supported languages
     */
    @GetMapping("/languages")
    @Operation(summary = "Get supported languages", description = "Returns the list of supported natural languages (English, Hindi, Marathi) with ISO codes and native scripts")
    public ResponseEntity<List<Map<String, String>>> getSupportedLanguages() {
        List<Map<String, String>> langs = Arrays.stream(Language.values())
                .map(l -> Map.of(
                        "code", l.getCode(),
                        "englishName", l.getEnglishName(),
                        "nativeName", l.getNativeName()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(langs);
    }

    /**
     * GET /api/v1/multilingual/detect
     * Detects if input text is in English, Hindi, or Marathi
     */
    @GetMapping("/detect")
    @Operation(
            summary = "Detect language of text",
            description = "Analyzes Devanagari script presence and grammatical lexical markers to detect whether text is English, Hindi (हिन्दी), or Marathi (मराठी)."
    )
    public ResponseEntity<Map<String, Object>> detectLanguage(
            @Parameter(description = "Natural language text to analyze", example = "माझ्या अश्वगंधा अर्काला पेटंट मिळू शकेल का?")
            @RequestParam("text") String text) {
        Language lang = translationService.detectLanguage(text, "AUTO");
        return ResponseEntity.ok(Map.of(
                "input_text", text,
                "detected_code", lang.getCode(),
                "language", lang.getEnglishName(),
                "native_name", lang.getNativeName(),
                "is_devanagari", lang != Language.ENGLISH
        ));
    }

    /**
     * POST /api/v1/multilingual/normalize
     * Normalizes a Hindi or Marathi legal query to English concepts for vector/hybrid search
     */
    @PostMapping("/normalize")
    @Operation(
            summary = "Normalize query to English concepts",
            description = "Translates Devanagari Ayurvedic plant names (e.g. हळद -> Haridra) and statutory references (e.g. कलम ३(पी) -> Section 3(p)) into English for RAG search."
    )
    public ResponseEntity<Map<String, Object>> normalizeQuery(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("query", "");
        String reqLang = request.getOrDefault("language", "AUTO");
        Language lang = translationService.detectLanguage(query, reqLang);
        String normalized = translationService.normalizeQueryToEnglish(query, lang);

        return ResponseEntity.ok(Map.of(
                "original_query", query,
                "detected_language", lang.getCode(),
                "normalized_english_query", normalized
        ));
    }
}
