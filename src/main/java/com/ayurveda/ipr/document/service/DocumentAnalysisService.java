package com.ayurveda.ipr.document.service;

import com.ayurveda.ipr.chat.model.ChatMessageRequest;
import com.ayurveda.ipr.chat.model.ChatMessageResponse;
import com.ayurveda.ipr.chat.service.ChatOrchestratorService;
import com.ayurveda.ipr.document.model.DocumentAnalysisResponse;
import com.ayurveda.ipr.document.model.ExtractedDocumentProfile;
import com.ayurveda.ipr.dpdp.DpdpSanitizationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * Single unified document and text query statutory analysis engine.
 * Handles PDFs (native multimodal), DOCX, TXT, and traditional formulation queries
 * by delegating directly to Google Gemini LLM in pure JSON mode.
 */
@Service
public class DocumentAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(DocumentAnalysisService.class);

    private static final String UNIFIED_SYSTEM_PROMPT = """
            You are IP-SHAKTI Sahayak's Senior Patent Attorney and AYUSH Regulatory Counsel in India.
            Analyze the provided document (PDF/text/query) and extract all critical applicant credentials,
            technical specifications, patentability parameters, and statutory regulatory requirements into STRICT JSON.

            Return ONLY a valid JSON object matching this schema:
            {
              "applicantCredentials": {
                "applicantName": "string",
                "aadhaarNumber": "string or null if not found",
                "panNumber": "string or null if not found",
                "phoneNumber": "string or null if not found",
                "emailAddress": "string or null if not found",
                "locationOrAddress": "string or null if not found"
              },
              "productDetails": {
                "documentTitle": "string",
                "productName": "string",
                "botanicalBinomials": ["string e.g. Withania somnifera, Curcuma longa, Boswellia serrata"],
                "regulatoryCategory": "AYURVEDIC_COSMETIC | PHYTOPHARMACEUTICAL | CLASSICAL_AYURVEDIC_FORMULATION | PROPRIETARY_AYURVEDIC_MEDICINE | AYURVEDA_AAHAR",
                "governingActAndRules": "string e.g. Drugs & Cosmetics Act 1940 Rule 158-B / Rule 122-E Schedule Y",
                "licensingAuthority": "string e.g. State AYUSH Licensing Authority or CDSCO / DCGI Central Licensing Authority"
              },
              "patentabilityAndStatutoryAnalysis": {
                "technicalNovelty": "string detailing novel carrier, selectively enriched fraction, synergistic ratio, etc.",
                "isClassicalScriptureRecipe": false,
                "section3pTraditionalKnowledgeBar": {
                  "isBarred": false,
                  "rationale": "string explaining Section 3(p) status and how novel delivery/purity overcomes traditional knowledge bar"
                },
                "synergismOrEfficacy": {
                  "proven": true,
                  "evidence": "string e.g. Combination Index (CI), IC50 enzymatic data, clinical/preclinical parameters"
                },
                "biodiversityActRequirement": "string (NBA Form I/III or State Biodiversity Board Section 7 intimation)",
                "clinicalTrialObligations": "string e.g. Phase I-IV trials under Schedule Y / GCTP or clinical exemption",
                "claimsSummary": [
                  {"claimNumber": 1, "type": "PRODUCT", "summary": "string"},
                  {"claimNumber": 2, "type": "PROCESS", "summary": "string"}
                ],
                "immediateNextSteps": ["string"]
              }
            }
            """;

    private final DocumentParserService documentParserService;
    private final DpdpSanitizationService dpdpSanitizationService;
    private final ChatOrchestratorService chatOrchestratorService;
    private final GoogleAiGeminiChatModel geminiModel;
    private final String apiKey;
    private final String modelName;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public DocumentAnalysisService(
            DocumentParserService documentParserService,
            DpdpSanitizationService dpdpSanitizationService,
            ChatOrchestratorService chatOrchestratorService,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model-name:gemini-flash-lite-latest}") String modelName,
            @Value("${gemini.temperature:0.1}") double temperature) {
        this.documentParserService = documentParserService;
        this.dpdpSanitizationService = dpdpSanitizationService;
        this.chatOrchestratorService = chatOrchestratorService;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.modelName = modelName != null && !modelName.isBlank() ? modelName.trim() : "gemini-flash-lite-latest";

        if (!this.apiKey.isEmpty() && !this.apiKey.contains("YOUR_API_KEY")) {
            GoogleAiGeminiChatModel model = null;
            try {
                model = GoogleAiGeminiChatModel.builder()
                        .apiKey(this.apiKey)
                        .modelName(this.modelName)
                        .temperature(temperature)
                        .maxOutputTokens(2048)
                        .build();
                log.info("DocumentAnalysisService initialized with Gemini model: '{}'", this.modelName);
            } catch (Exception e) {
                log.warn("Could not initialize LangChain4j Gemini model: {}", e.getMessage());
            }
            this.geminiModel = model;
        } else {
            this.geminiModel = null;
        }
    }

    /**
     * Unified processor for uploaded documents (PDF, Word DOCX, plain text).
     */
    public DocumentAnalysisResponse analyzeDocument(
            MultipartFile file,
            String sessionId,
            String jurisdiction,
            String targetLanguage) {

        String base64Pdf = null;
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        long fileSize = file.getSize();
        String fileType = "UNKNOWN";

        try {
            if (fileName.toLowerCase().endsWith(".pdf")) {
                fileType = "PDF";
                base64Pdf = Base64.getEncoder().encodeToString(file.getBytes());
            }
        } catch (Exception e) {
            log.warn("Could not extract raw PDF bytes for multimodal transmission: {}", e.getMessage());
        }

        // Parse text for DPDP redaction and fallback extraction
        DocumentParserService.ParsedDocument parsed = documentParserService.parse(file);
        if (fileType.equals("UNKNOWN")) {
            fileType = parsed.fileType();
        }

        DpdpSanitizationService.SanitizationResult sanitizedResult = dpdpSanitizationService.sanitize(parsed.rawText());
        String cleanText = sanitizedResult.sanitizedText();

        return executeAnalysisWorkflow(
                fileName,
                fileType,
                fileSize,
                cleanText,
                base64Pdf,
                sessionId,
                jurisdiction,
                targetLanguage
        );
    }

    /**
     * Unified processor for traditional text queries or formulation descriptions.
     */
    public DocumentAnalysisResponse analyzeTextQuery(
            String textQuery,
            String sessionId,
            String jurisdiction,
            String targetLanguage) {

        DocumentParserService.ParsedDocument parsed = documentParserService.parseTextQuery(textQuery);
        DpdpSanitizationService.SanitizationResult sanitizedResult = dpdpSanitizationService.sanitize(parsed.rawText());
        String cleanText = sanitizedResult.sanitizedText();

        return executeAnalysisWorkflow(
                "query_input",
                "TEXT_QUERY",
                parsed.fileSizeBytes(),
                cleanText,
                null,
                sessionId,
                jurisdiction,
                targetLanguage
        );
    }

    private DocumentAnalysisResponse executeAnalysisWorkflow(
            String fileName,
            String fileType,
            long fileSize,
            String cleanText,
            String base64Pdf,
            String sessionId,
            String jurisdiction,
            String targetLanguage) {

        // 1. Single Unified Gemini Extraction
        ExtractedDocumentProfile profile = extractDocumentProfile(fileName, fileType, fileSize, cleanText, base64Pdf);

        // 2. Synthesize 5-Pillar Assessment
        ChatMessageRequest chatReq = new ChatMessageRequest();
        chatReq.setSessionId(sessionId != null && !sessionId.isBlank() ? sessionId : UUID.randomUUID().toString());
        chatReq.setMessage("Document Analysis for " + profile.getProductName() + ": " + profile.getSummarySynopsis());
        chatReq.setProductName(profile.getProductName());
        if (profile.getBotanicalBinomials() != null && !profile.getBotanicalBinomials().isEmpty()) {
            chatReq.setMainIngredients(String.join(", ", profile.getBotanicalBinomials()));
        }
        chatReq.setIntendedUse(profile.getIntendedUse());
        chatReq.setJurisdiction(jurisdiction != null ? jurisdiction : "INDIA");
        chatReq.setLanguage(targetLanguage != null ? targetLanguage : "AUTO");

        Map<String, String> answers = new HashMap<>();
        answers.put("isClassical", profile.getIsClassical());
        answers.put("technicalNovelty", profile.getTechnicalNovelty());
        chatReq.setClarificationAnswers(answers);

        ChatMessageResponse assessment = chatOrchestratorService.processMessage(chatReq);
        return new DocumentAnalysisResponse(profile, assessment);
    }

    private ExtractedDocumentProfile extractDocumentProfile(
            String fileName,
            String fileType,
            long size,
            String text,
            String base64Pdf) {

        ExtractedDocumentProfile profile = new ExtractedDocumentProfile(fileName, fileType, size);
        profile.setSourceMode("PDF".equalsIgnoreCase(fileType) ? "PDF Document (Direct LLM)" : "Text / Document Analysis");

        // 1. Try Direct Google Gemini REST Call (Native JSON mode & Multimodal PDF support)
        if (!apiKey.isEmpty() && !apiKey.contains("YOUR_API_KEY")) {
            try {
                String jsonResult = queryGeminiDirectApi(text, base64Pdf);
                if (jsonResult != null && !jsonResult.isBlank()) {
                    ExtractedDocumentProfile llmProfile = objectMapper.readValue(jsonResult, ExtractedDocumentProfile.class);
                    llmProfile.setFileName(fileName);
                    llmProfile.setFileType(fileType);
                    llmProfile.setFileSizeBytes(size);
                    llmProfile.setSourceMode(profile.getSourceMode());
                    log.info("Successfully extracted unified structured profile via Gemini JSON Mode for: {}", llmProfile.getProductName());
                    return llmProfile;
                }
            } catch (Exception e) {
                log.warn("Direct Gemini JSON mode call failed: {}. Trying LangChain4j fallback.", e.getMessage());
            }

            // 2. LangChain4j Fallback
            if (geminiModel != null) {
                try {
                    String sample = text.length() > 6000 ? text.substring(0, 6000) : text;
                    String prompt = UNIFIED_SYSTEM_PROMPT + "\n\n=== DOCUMENT TEXT ===\n" + sample + "\n=====================";
                    String result = geminiModel.generate(prompt);
                    String cleanJson = cleanMarkdownJson(result);
                    ExtractedDocumentProfile llmProfile = objectMapper.readValue(cleanJson, ExtractedDocumentProfile.class);
                    llmProfile.setFileName(fileName);
                    llmProfile.setFileType(fileType);
                    llmProfile.setFileSizeBytes(size);
                    return llmProfile;
                } catch (Exception e) {
                    log.warn("LangChain4j Gemini extraction failed: {}. Using deterministic fallback.", e.getMessage());
                }
            }
        }

        // 3. Fallback Heuristic
        extractDeterministicProfile(text, profile);
        return profile;
    }

    private String queryGeminiDirectApi(String cleanText, String base64Pdf) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        Map<String, Object> payload = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        if (base64Pdf != null && !base64Pdf.isBlank()) {
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", "application/pdf");
            inlineData.put("data", base64Pdf);
            parts.add(Map.of("inlineData", inlineData));
            parts.add(Map.of("text", UNIFIED_SYSTEM_PROMPT));
        } else {
            String sample = cleanText.length() > 7000 ? cleanText.substring(0, 7000) : cleanText;
            String promptText = UNIFIED_SYSTEM_PROMPT + "\n\n=== DOCUMENT CONTENT ===\n" + sample + "\n========================";
            parts.add(Map.of("text", promptText));
        }

        payload.put("contents", List.of(Map.of("parts", parts)));
        payload.put("generationConfig", Map.of(
                "temperature", 0.1,
                "responseMimeType", "application/json"
        ));

        String requestBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("Gemini direct API returned status {}: {}", response.statusCode(), response.body());
            return null;
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        }
        return null;
    }

    private String cleanMarkdownJson(String text) {
        if (text == null) return "";
        String s = text.trim();
        if (s.startsWith("```json")) s = s.substring(7);
        if (s.startsWith("```")) s = s.substring(3);
        if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        return s.trim();
    }

    private void extractDeterministicProfile(String text, ExtractedDocumentProfile profile) {
        String lower = text.toLowerCase(Locale.ROOT);

        if (lower.contains("ashwagandha") || lower.contains("withania")) {
            profile.setProductName("Ashwagandha");
            profile.setBotanicalBinomials(List.of("Withania somnifera"));
        } else if (lower.contains("turmeric") || lower.contains("curcumin") || lower.contains("haridra")) {
            profile.setProductName("Haridra (Turmeric)");
            profile.setBotanicalBinomials(List.of("Curcuma longa"));
        } else if (lower.contains("shallaki") || lower.contains("boswellia")) {
            profile.setProductName("Shallaki (Boswellia)");
            profile.setBotanicalBinomials(List.of("Boswellia serrata"));
        } else {
            profile.setProductName("Ayurvedic Botanical Complex");
            profile.setBotanicalBinomials(List.of("Herbal Formulation"));
        }

        if (lower.contains("nano") || lower.contains("liposom")) {
            profile.setTechnicalNovelty("NANO_EXTRACT");
            profile.setIsClassical("NO");
        } else if (lower.contains("fraction") || lower.contains("phytopharmaceutical")) {
            profile.setTechnicalNovelty("PHYTOCHEMICAL");
            profile.setIsClassical("NO");
        } else {
            profile.setTechnicalNovelty("SYNERGISTIC_RATIO");
            profile.setIsClassical("NO");
        }

        if (lower.contains("cosmetic") || lower.contains("skin")) {
            profile.setIntendedUse("AYURVEDIC_COSMETIC");
        } else if (lower.contains("phytopharmaceutical")) {
            profile.setIntendedUse("PHYTOPHARMACEUTICAL");
        } else {
            profile.setIntendedUse("PROPRIETARY_AYURVEDIC_MEDICINE");
        }

        profile.setDocumentTitle("Specification for " + profile.getProductName());
        profile.setSummarySynopsis("Parsed specification disclosing formulation process and therapeutic parameters for " + profile.getProductName() + ".");
    }
}
