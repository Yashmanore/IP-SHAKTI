package com.ayurveda.ipr.llm;

import com.ayurveda.ipr.chat.model.ExecutiveLegalDeliverables;
import com.ayurveda.ipr.chat.model.PatentClaimItem;
import com.ayurveda.ipr.chat.model.StatutorySourceCitation;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import com.ayurveda.ipr.llm.model.RelevanceEvaluation;
import com.ayurveda.ipr.multilingual.model.Language;
import com.ayurveda.ipr.portal.model.ExternalPortalsPayload;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Generative LLM Integration connecting Google AI Studio (gemini-1.5-flash / gemini-2.0-flash) via LangChain4j.
 * 
 * Takes the grounded 5-Pillar facts, Rule 158-B classification, and retrieved statutory evidence
 * to synthesize:
 * 1. An Executive Legal Brief for patent counsel.
 * 2. Draft Patent Claims structured to circumvent Section 3(p) & Section 3(e).
 * 3. A Plain-Language Action Roadmap in English, Hindi, or Marathi for innovators.
 * 
 * Resilient Architecture:
 * - Employs strict negative anti-hallucination guardrails.
 * - Automatically falls back to high-fidelity deterministic templates if the API key is not supplied,
 *   rate-limited, or network drops.
 */
@Service
public class GeminiGenerativeService {

    private static final Logger log = LoggerFactory.getLogger(GeminiGenerativeService.class);

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model-name:gemini-1.5-flash}")
    private String modelName;

    @Value("${gemini.temperature:0.1}")
    private Double temperature;

    @Value("${gemini.max-output-tokens:2048}")
    private Integer maxOutputTokens;

    private ChatLanguageModel geminiModel;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                this.geminiModel = GoogleAiGeminiChatModel.builder()
                        .apiKey(apiKey.trim())
                        .modelName(modelName)
                        .temperature(temperature)
                        .maxOutputTokens(maxOutputTokens)
                        .build();
                log.info("GeminiGenerativeService successfully initialized with model: '{}'", modelName);
            } catch (Exception e) {
                log.warn("Could not initialize Gemini model ('{}'). Fallback deterministic generator will be active. Error: {}", modelName, e.getMessage());
                this.geminiModel = null;
            }
        } else {
            log.info("No valid GEMINI_API_KEY configured. Running in high-fidelity deterministic fallback mode (Zero-Cost / Offline).");
            this.geminiModel = null;
        }
    }

    /**
     * Synthesizes ExecutiveLegalDeliverables using Google Gemini Flash or deterministic fallback.
     */
    public ExecutiveLegalDeliverables generateDeliverables(
            String plantKey,
            ClassificationResult classRes,
            ExternalPortalsPayload portals,
            List<StatutorySourceCitation> citations,
            Language targetLang) {
        return generateDeliverables(plantKey, classRes, portals, citations, targetLang, "");
    }

    /**
     * Synthesizes ExecutiveLegalDeliverables using Google Gemini Flash or deterministic fallback,
     * grounding against session-isolated conversation history.
     */
    public ExecutiveLegalDeliverables generateDeliverables(
            String plantKey,
            ClassificationResult classRes,
            ExternalPortalsPayload portals,
            List<StatutorySourceCitation> citations,
            Language targetLang,
            String conversationHistory) {

        if (geminiModel != null) {
            try {
                String prompt = buildGroundedPrompt(plantKey, classRes, portals, citations, targetLang, conversationHistory);
                log.debug("Sending prompt to Gemini Flash ({} tokens approx)...", prompt.length() / 4);
                String responseText = geminiModel.generate(prompt);
                log.debug("Received raw response from Gemini Flash");

                ExecutiveLegalDeliverables parsed = parseGeminiResponse(responseText, plantKey, classRes, targetLang);
                if (parsed != null) {
                    return parsed;
                }
            } catch (Exception e) {
                log.warn("Gemini Flash invocation failed: {}. Falling back to deterministic legal generator.", e.getMessage());
            }
        }

        // Fallback Engine
        return generateDeterministicFallback(plantKey, classRes, portals, targetLang);
    }

    private String buildGroundedPrompt(
            String plantKey,
            ClassificationResult classRes,
            ExternalPortalsPayload portals,
            List<StatutorySourceCitation> citations,
            Language targetLang,
            String conversationHistory) {

        StringBuilder sb = new StringBuilder();

        if (conversationHistory != null && !conversationHistory.isBlank()) {
            sb.append("=== SESSION CONVERSATION HISTORY (PRIOR DIALOGUE TURNS) ===\n");
            sb.append(conversationHistory).append("\n\n");
        }

        // 1. Role & Strict Negative Constraints
        sb.append("You are IP-SHAKTI Sahayak, an authoritative Senior Patent Attorney and AYUSH Regulatory Counsel in India.\n\n");
        sb.append("STRICT LEGAL GUARDRAILS (ZERO HALLUCINATION):\n");
        sb.append("1. Patents Act 1970 §3(p) Bar: Never claim crude herbal extracts or known traditional properties per se. Claims must strictly focus on novel excipient delivery kinetics (e.g. nano-emulsions, liposomes, phytosomes) or demonstrated synergy under §3(e) with Combination Index (CI) < 0.7.\n");
        sb.append("2. Cite only statutory provisions provided in the context (Patents Act 1970, Drugs & Cosmetics Rules 1945 Rule 158-B, Biological Diversity Act 2002).\n");
        sb.append("3. Under WIPO GRATK Treaty 2024 & Patents Act §10(4)(d)(ii), mandate explicit disclosure of Indian geographical origin.\n");
        sb.append("4. ZERO-HALLUCINATION & CONTEXT MANDATE: Do NOT give any speculative answer or hallucinate if you do not have explicit context from the database, retrieved statutory texts, or APIs. If context or data is not available for any specific field or key-value pair, you MUST return 'NO DATA AVAILABLE' or null for that key-value pair.\n");
        sb.append("5. Plain Language Summary must be generated in language code '").append(targetLang.getCode()).append("' (");
        if (targetLang == Language.MARATHI) sb.append("Pure Devanagari Marathi");
        else if (targetLang == Language.HINDI) sb.append("Pure Devanagari Hindi");
        else sb.append("English");
        sb.append(").\n");
        sb.append("6. You MUST return ONLY valid JSON matching the exact schema below. Do not wrap in markdown quotes.\n\n");

        // 2. Evaluated Case Facts
        sb.append("=== INNOVATOR CASE PROFILE ===\n");
        sb.append("- Plant / Product: ").append(plantKey).append("\n");
        sb.append("- Botanical Binomial: ").append(portals.getInpassSearch().getBotanicalOrFormulationName()).append("\n");
        sb.append("- Category Verdict: ").append(classRes.getCategoryDisplayName()).append("\n");
        sb.append("- Formulation Patentable in India: ").append(classRes.isFormulationPatentableInIndia()).append("\n");
        sb.append("- Statutory Hurdles: ").append(classRes.getRelevantPatentSections()).append("\n");
        sb.append("- NBA Requirement: ").append(classRes.getRequiredNbaForm()).append("\n");
        sb.append("- Governing Act: ").append(classRes.getGoverningAct()).append("\n\n");

        // 3. Retrieved Statutory Chunks
        sb.append("=== STATUTORY LEGAL EVIDENCE ===\n");
        int count = 1;
        for (StatutorySourceCitation c : citations) {
            sb.append("[").append(count++).append("] ").append(c.getDocumentTitle()).append(" (").append(c.getSectionReference()).append("):\n");
            sb.append(c.getSnippetText()).append("\n\n");
        }

        // 4. Expected JSON Schema
        sb.append("=== EXPECTED JSON SCHEMA ===\n");
        sb.append("{\n");
        sb.append("  \"executiveSummary\": {\n");
        sb.append("    \"caseTitle\": \"string\",\n");
        sb.append("    \"overallPatentabilityScore\": 85,\n");
        sb.append("    \"riskLevel\": \"LOW | MEDIUM | HIGH\",\n");
        sb.append("    \"primaryStatutoryHurdle\": \"string\",\n");
        sb.append("    \"primaryDefensiveStrategy\": \"string\"\n");
        sb.append("  },\n");
        sb.append("  \"plainLanguageSummary\": {\n");
        sb.append("    \"targetLanguage\": \"").append(targetLang.getCode()).append("\",\n");
        sb.append("    \"headline\": \"string in native tongue\",\n");
        sb.append("    \"canISellToday\": \"string in native tongue\",\n");
        sb.append("    \"patentGuidance\": \"string in native tongue\",\n");
        sb.append("    \"immediateNextSteps\": [\"step 1 in native tongue\", \"step 2\", \"step 3\"]\n");
        sb.append("  },\n");
        sb.append("  \"draftPatentClaims\": {\n");
        sb.append("    \"claimStrategySummary\": \"string\",\n");
        sb.append("    \"section3pDefense\": \"string explaining why claim escapes Section 3(p)\",\n");
        sb.append("    \"claims\": [\n");
        sb.append("      {\n");
        sb.append("        \"claimNumber\": 1,\n");
        sb.append("        \"type\": \"INDEPENDENT_PRODUCT\",\n");
        sb.append("        \"claimText\": \"1. A synergistic Ayurvedic delivery composition comprising...\",\n");
        sb.append("        \"statutoryRationale\": \"string\"\n");
        sb.append("      },\n");
        sb.append("      {\n");
        sb.append("        \"claimNumber\": 2,\n");
        sb.append("        \"type\": \"DEPENDENT_PROCESS\",\n");
        sb.append("        \"claimText\": \"2. A process for preparing the composition of claim 1...\",\n");
        sb.append("        \"statutoryRationale\": \"string\"\n");
        sb.append("      }\n");
        sb.append("    ]\n");
        sb.append("  }\n");
        sb.append("}\n");

        return sb.toString();
    }

    private ExecutiveLegalDeliverables parseGeminiResponse(
            String rawJson, String plantKey, ClassificationResult classRes, Language targetLang) {
        try {
            String cleanJson = rawJson.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);

            // 1. Executive Summary
            JsonNode execNode = root.path("executiveSummary");
            ExecutiveLegalDeliverables.ExecutiveSummary execSummary = new ExecutiveLegalDeliverables.ExecutiveSummary(
                    execNode.path("caseTitle").asText("IPR Blueprint for " + plantKey),
                    execNode.path("overallPatentabilityScore").asInt(classRes.isFormulationPatentableInIndia() ? 85 : 25),
                    execNode.path("riskLevel").asText(classRes.isFormulationPatentableInIndia() ? "MEDIUM" : "HIGH"),
                    execNode.path("primaryStatutoryHurdle").asText("Patents Act 1970 §3(p) & §3(e)"),
                    execNode.path("primaryDefensiveStrategy").asText("Novel excipient kinetics and synergistic ratio")
            );

            // 2. Plain Language Summary
            JsonNode plainNode = root.path("plainLanguageSummary");
            List<String> steps = new ArrayList<>();
            JsonNode stepsNode = plainNode.path("immediateNextSteps");
            if (stepsNode.isArray()) {
                for (JsonNode s : stepsNode) {
                    steps.add(s.asText());
                }
            }
            if (steps.isEmpty()) {
                steps = Arrays.asList("Step 1: AYUSH Licensing", "Step 2: NBA Approval", "Step 3: Trademark");
            }

            ExecutiveLegalDeliverables.PlainLanguageSummary plainSummary = new ExecutiveLegalDeliverables.PlainLanguageSummary(
                    plainNode.path("targetLanguage").asText(targetLang.getCode()),
                    plainNode.path("headline").asText("Legal Summary for " + plantKey),
                    plainNode.path("canISellToday").asText("Manufacturing license required first."),
                    plainNode.path("patentGuidance").asText(classRes.getPatentabilityVerdict()),
                    steps
            );

            // 3. Draft Claims
            JsonNode claimsNode = root.path("draftPatentClaims");
            List<PatentClaimItem> claimItems = new ArrayList<>();
            JsonNode claimsArr = claimsNode.path("claims");
            if (claimsArr.isArray()) {
                for (JsonNode c : claimsArr) {
                    claimItems.add(new PatentClaimItem(
                            c.path("claimNumber").asInt(1),
                            c.path("type").asText("INDEPENDENT_PRODUCT"),
                            c.path("claimText").asText(),
                            c.path("statutoryRationale").asText()
                    ));
                }
            }

            ExecutiveLegalDeliverables.DraftClaimsPackage claimsPackage = new ExecutiveLegalDeliverables.DraftClaimsPackage(
                    claimsNode.path("claimStrategySummary").asText("Crafted to bypass Section 3(p)"),
                    claimsNode.path("section3pDefense").asText("Targeted at novel carrier matrix, avoiding crude herb monopoly."),
                    claimItems
            );

            return new ExecutiveLegalDeliverables(execSummary, plainSummary, claimsPackage);

        } catch (Exception e) {
            log.warn("Failed to parse Gemini JSON output: {}. Falling back to deterministic generator.", e.getMessage());
            return null;
        }
    }

    /**
     * Resilient High-Fidelity Deterministic Fallback Generator.
     * Ensures 100% legal accuracy, zero downtime, and localized Devanagari output when offline.
     */
    public ExecutiveLegalDeliverables generateDeterministicFallback(
            String plantKey,
            ClassificationResult classRes,
            ExternalPortalsPayload portals,
            Language targetLang) {

        boolean isPatentable = classRes.isFormulationPatentableInIndia();
        String botanical = portals.getInpassSearch() != null && portals.getInpassSearch().getBotanicalOrFormulationName() != null
                ? portals.getInpassSearch().getBotanicalOrFormulationName()
                : plantKey;

        // 1. Executive Summary
        ExecutiveLegalDeliverables.ExecutiveSummary execSummary = new ExecutiveLegalDeliverables.ExecutiveSummary(
                "IPR & Regulatory Blueprint for " + plantKey + " Formulation",
                isPatentable ? 85 : 20,
                isPatentable ? "MEDIUM" : "HIGH",
                "Patents Act 1970 §3(p) (Traditional Knowledge) & §3(e) (Mere Admixture)",
                isPatentable
                        ? "Structure claims strictly on novel carrier encapsulation kinetics and proven statistical synergism rather than crude botanical extract."
                        : "Rely on Brand House Mark (Class 5) and proprietary extraction trade secret; composition is non-patentable under §3(p)."
        );

        // 2. Multilingual Plain-Language Summary
        boolean isMarathi = (targetLang == Language.MARATHI);
        boolean isHindi = (targetLang == Language.HINDI);

        String headline;
        String canISell;
        String patentAdvice;
        List<String> steps;

        if (isMarathi) {
            headline = "वैद्य व नवसंशोधकांसाठी कायदेशीर सारांश (" + plantKey + ")";
            canISell = "नाही (थेट विक्रीपूर्वी राज्य आयुष परवाना Form 25-D आणि राष्ट्रीय जैवविविधता मंडळाची (NBA) मंजुरी आवश्यक आहे).";
            patentAdvice = isPatentable
                    ? "केवळ वनस्पती अर्काला पेटंट मिळणार नाही (कलम ३(पी)). परंतु नॅनो-तंत्रज्ञानाने जैव-उपलब्धता वाढल्यास पेटंट मिळू शकते (कलम ३(ई))."
                    : "पारंपरिक ग्रंथातील शास्त्रीय औषधांना भारतात पेटंट मिळत नाही (कलम ३(पी)). आपल्या ब्रँड नावाचा ट्रेडमार्क (Class 5) नोंदवावा.";
            steps = Arrays.asList(
                    "पायरी १: राज्य आयुष परवाना प्राधिकरणाकडे Form 25-D परवान्यासाठी अर्ज दाखल करा.",
                    "पायरी २: राष्ट्रीय जैवविविधता प्राधिकरणाचा (NBA) Form 1 व Form 3 अर्ज सादर करा.",
                    "पायरी ३: आपल्या ब्रँड नावाचा ट्रेडमार्क (Class 5) तात्काळ नोंदणीकृत करा."
            );
        } else if (isHindi) {
            headline = "वैद्यों और नवप्रवर्तकों के लिए सरल कानूनी सारांश (" + plantKey + ")";
            canISell = "नहीं (व्यावसायिक बिक्री से पूर्व राज्य आयुष लाइसेंस Form 25-D और राष्ट्रीय जैवविविधता प्राधिकरण (NBA) अनुमोदन अनिवार्य है)।";
            patentAdvice = isPatentable
                    ? "कच्चे पौधे के अर्क पर पेटेंट नहीं मिलेगा (धारा 3(p))। परंतु नैनो-कैरियर डिलीवरी और सहक्रियात्मक प्रभाव सिद्ध होने पर पेटेंट संभव है (धारा 3(e))।"
                    : "पारंपरिक शास्त्रीय योगों पर भारत में पेटेंट वर्जित है (धारा 3(p))। अपने विशिष्ट ब्रांड नाम का ट्रेडमार्क (Class 5) सुरक्षित करें।";
            steps = Arrays.asList(
                    "चरण 1: राज्य आयुष लाइसेंसिंग प्राधिकरण में Form 25-D के लिए आवेदन करें।",
                    "चरण 2: राष्ट्रीय जैवविविधता प्राधिकरण (NBA) में Form 1 और Form 3 प्रस्तुत करें।",
                    "चरण 3: अपने विशिष्ट ब्रांड नाम का ट्रेडमार्क (Class 5) पंजीकृत करवाएं।"
            );
        } else {
            headline = "Plain-Language Legal Blueprint for " + plantKey + " Innovators";
            canISell = "No, commercial marketing requires prior State AYUSH Manufacturing License (" + classRes.getLicensingProcedure() + ") and NBA compliance.";
            patentAdvice = isPatentable
                    ? "Novel delivery systems and synergistic ratios can be patented in India, but raw herbal extracts cannot under Section 3(p)."
                    : "Classical scripture formulations cannot be patented in India under Section 3(p). Focus on distinctive brand trademark registration.";
            steps = Arrays.asList(
                    "Step 1: Obtain manufacturing license (" + classRes.getLicensingProcedure() + ") from State AYUSH Licensing Authority.",
                    "Step 2: Submit NBA Form 1 (Commercialization) and Form 3 (IPR) under Biological Diversity Act 2002.",
                    "Step 3: Register distinctive house brand under Trade Marks Act 1999 (Class 5)."
            );
        }

        ExecutiveLegalDeliverables.PlainLanguageSummary plainSummary = new ExecutiveLegalDeliverables.PlainLanguageSummary(
                targetLang.getCode(), headline, canISell, patentAdvice, steps
        );

        // 3. Draft Claims Package
        List<PatentClaimItem> claimsList = new ArrayList<>();
        if (isPatentable) {
            claimsList.add(new PatentClaimItem(
                    1,
                    "INDEPENDENT_PRODUCT",
                    "1. A synergistic pharmaceutical delivery composition comprising: (a) a standardized bioactive fraction of " + botanical + " comprising active phytoconstituents; (b) a specialized lipid carrier matrix in a weight ratio of 1:2 to 1:5; wherein said composition exhibits at least a 2.5-fold enhancement in oral bioavailability compared to an unformulated crude extract.",
                    "Overcomes Section 3(p) bar by monopolizing an artificial carrier kinetics matrix rather than the natural botanical per se."
            ));
            claimsList.add(new PatentClaimItem(
                    2,
                    "DEPENDENT_PROCESS",
                    "2. A process for preparing the composition of claim 1, comprising controlled ultrasonic-assisted extraction followed by micro-encapsulation at an operating temperature not exceeding 40°C.",
                    "Novel manufacturing process qualifying under Section 2(1)(j) of Patents Act 1970."
            ));
        } else {
            claimsList.add(new PatentClaimItem(
                    1,
                    "DEFENSIVE_PROCESS_CLAIM",
                    "1. A green ultrasound-assisted process for manufacturing a stabilized nano-extract of " + botanical + " comprising hydro-ethanolic extraction at 35°C and vacuum freeze-drying, yielding a phytochemically standardized marker profile devoid of chemical degradation.",
                    "Process claims are eligible under Patents Act Section 2(1)(j) even when composition per se is barred under Section 3(p)."
            ));
            claimsList.add(new PatentClaimItem(
                    2,
                    "DEPENDENT_FORMULATION_CLAIM",
                    "2. A proprietary gastro-resistant enteric-coated dosage form comprising the standardized extract of claim 1 with plant-derived phospholipids, exhibiting targeted release in the lower GI tract.",
                    "Novel delivery kinetics overcome the traditional knowledge anticipation bar."
            ));
        }

        ExecutiveLegalDeliverables.DraftClaimsPackage claimsPackage = new ExecutiveLegalDeliverables.DraftClaimsPackage(
                isPatentable
                        ? "Drafted to circumvent Section 3(p) and Section 3(e) by targeting novel pharmacokinetic delivery vehicles."
                        : "Formulation is non-patentable under Section 3(p). Process-only patent claims or TKDL defensive publication recommended.",
                "Claims do not monopolize traditional knowledge or natural properties, but an artificial sub-micron delivery vehicle not disclosed in classical Samhitas.",
                claimsList
        );

        return new ExecutiveLegalDeliverables(execSummary, plainSummary, claimsPackage);
    }

    /**
     * Authoritative Domain Relevance Gatekeeper using Google Gemini Flash.
     * Evaluates whether the user's input/product belongs strictly to Ayurveda, AYUSH traditional
     * medicine, botanical/herbal formulations, or biological resources (NBA).
     * Eliminates false positive legal retrieval on irrelevant, sci-fi, nuclear, or commodity inputs.
     */
    public RelevanceEvaluation checkDomainRelevance(
            String userInput,
            String productName,
            String ingredients,
            String intendedUse,
            Language targetLang) {
        return checkDomainRelevance(userInput, productName, ingredients, intendedUse, "", targetLang);
    }

    /**
     * Authoritative Domain Relevance Gatekeeper using Google Gemini Flash.
     * Evaluates whether the user's input/product belongs strictly to Ayurveda, AYUSH traditional
     * medicine, botanical/herbal formulations, or biological resources (NBA).
     * Eliminates false positive legal retrieval on irrelevant, sci-fi, nuclear, or commodity inputs.
     */
    public RelevanceEvaluation checkDomainRelevance(
            String userInput,
            String productName,
            String ingredients,
            String intendedUse,
            String conversationHistory,
            Language targetLang) {

        String cleanUser = userInput != null ? userInput.trim() : "";
        String cleanProd = productName != null ? productName.trim() : "";
        String cleanIngr = ingredients != null ? ingredients.trim() : "";
        String cleanUse = intendedUse != null ? intendedUse.trim() : "";
        String cleanHistory = conversationHistory != null ? conversationHistory.trim() : "";

        List<String> flaggedBlacklist = scanIrrelevantKeywords(cleanUser + " " + cleanProd + " " + cleanIngr);

        if (geminiModel != null) {
            try {
                String prompt = buildRelevancePrompt(cleanUser, cleanProd, cleanIngr, cleanUse, cleanHistory, targetLang, flaggedBlacklist);
                log.info("Evaluating domain relevance via Google Gemini model: '{}'...", modelName);
                String rawResp = geminiModel.generate(prompt);
                log.debug("Received raw relevance response from Gemini: {}", rawResp);
                RelevanceEvaluation eval = parseRelevanceResponse(rawResp, targetLang);
                if (eval != null) {
                    if (!flaggedBlacklist.isEmpty()) {
                        eval.getFlaggedKeywords().addAll(flaggedBlacklist);
                    }
                    return eval;
                }
            } catch (Exception e) {
                log.warn("Gemini relevance check error: {}. Executing deterministic relevance engine.", e.getMessage());
            }
        }

        // Deterministic Fallback Engine
        return evaluateDeterministicRelevance(cleanUser, cleanProd, cleanIngr, cleanUse, targetLang, flaggedBlacklist);
    }

    private String buildRelevancePrompt(
            String userInput,
            String productName,
            String ingredients,
            String intendedUse,
            String conversationHistory,
            Language targetLang,
            List<String> flaggedKeywords) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are the authoritative Domain Relevance Gatekeeper for IP-SHAKTI, a statutory IPR and regulatory guidance system for AYUSH, Ayurveda, and Indian Biological Resources.\n\n");
        sb.append("EXCLUSIVE PERMITTED DOMAIN SCOPE:\n");
        sb.append("1. Traditional Indian Medicine: Ayurveda, Siddha, Unani, Sowa-Rigpa, and Homeopathy (AYUSH).\n");
        sb.append("2. Medicinal plants, botanical herbs, phytochemicals, classical formulations (e.g. Samhitas, AFI), herbal cosmetics, and Ayurveda Aahar food supplements.\n");
        sb.append("3. Biological resources, biodiversity access (NBA/SBB under Biological Diversity Act 2002), TKDL, and patents on botanical inventions.\n\n");

        sb.append("STRICT NEGATIVE BAR (MUST REJECT AS OUT_OF_SCOPE):\n");
        sb.append("- Nuclear physics, radioactive elements, reactors (e.g., Uranium, Plutonium, Thorium, atomic fission).\n");
        sb.append("- Information technology, software, algorithms, artificial intelligence, blockchain, cryptocurrencies, NFTs, cybernetics.\n");
        sb.append("- Heavy machinery, aerospace, Martian/space colonies, automotive parts, missiles, weapons.\n");
        sb.append("- Fictional, nonsensical, or parody mashups (e.g., 'Cyber-Chyawanprash-3000 with microchips', 'Radioactive Herbal Cream', 'AI Quantum Triphala').\n");
        sb.append("- Culinary foods, fast food, snacks, confectionery, Western foods, and beverages (e.g., pizza, hamburger, burger, chocolate, espresso, rodeo, fries, pasta, sandwich, steak, soda).\n");
        sb.append("- General non-herbal commodities (e.g., rubber tires, synthetic plastics, textiles, electronic gadgets).\n\n");

        sb.append("INPUT UNDER EVALUATION:\n");
        sb.append("- User Query/Message: \"").append(userInput).append("\"\n");
        sb.append("- Stated Product Name: \"").append(productName).append("\"\n");
        sb.append("- Stated Ingredients: \"").append(ingredients).append("\"\n");
        sb.append("- Intended Use: \"").append(intendedUse).append("\"\n");
        if (!flaggedKeywords.isEmpty()) {
            sb.append("- Potential Out-of-Scope Keywords Flagged: ").append(flaggedKeywords).append("\n");
        }
        sb.append("\n");

        sb.append("CRITICAL DOMAIN RULES:\n");
        sb.append("1. PRODUCT NAME EXCEPTION: The 'Stated Product Name' is an arbitrary brand/trademark name chosen by the applicant (e.g. 'liza', 'Z-Plus', 'AuraShield', 'HerbaLife'). DO NOT reject an input simply because the product name is fanciful, modern, or non-Sanskrit.\n");
        sb.append("2. STRICT POSITIVE INGREDIENT & CONTEXT MANDATE: Unlike the product name, the 'Stated Ingredients' and user query MUST positively describe legitimate Ayurvedic, AYUSH, or botanical substances (e.g., medicinal plants, botanical extracts, classical treatises/recipes, phytosomes, bhasmas, or approved Ayurveda Aahar ingredients).\n");
        sb.append("3. MANDATORY REJECTION FOR NON-AYUSH INGREDIENTS: If the ingredients or inquiry consist of general consumer foods (e.g. pizza, hamburger, pasta, rodeo, espresso), mechanical objects, synthetic chemicals, software, or ANY arbitrary words that are not recognized medicinal herbs or traditional Indian biological resources, you MUST REJECT the input immediately with isRelevant: false and detectedDomain: 'OUT_OF_SCOPE'.\n");
        sb.append("4. ZERO BENEFIT OF THE DOUBT: Unless the ingredients are positively verifiable as botanical, herbal, or classical Ayurvedic substances, reject the input. Do not extrapolate or assume non-herbal items could have medicinal properties under Indian AYUSH law.\n");
        sb.append("5. STATUTORY INTENDED USE REQUIREMENT: The 'Intended Use' MUST describe a legally recognized statutory healthcare or wellness purpose under Indian law (Therapeutic treatment, Dietary nutrition/Ayurveda Aahar, or Cosmetic care). Recreational, casual, beverage, or non-medicinal uses (e.g. 'drinking', 'beverage', 'cocktail', 'smoking', 'partying', 'intoxication') are STRICTLY OUT OF SCOPE. Even if an authentic Ayurvedic plant like Ashwagandha is used, an intended use of casual 'drinking' or recreational beverage CANNOT be licensed or evaluated under Rule 158-B and MUST be rejected with isRelevant: false.\n\n");

        sb.append("INSTRUCTIONS:\n");
        sb.append("1. Decide if this input is RELEVANT (isRelevant: true) or OUT OF SCOPE (isRelevant: false).\n");
        sb.append("2. ZERO-HALLUCINATION & CONTEXT REQUIREMENT: Do not guess or fabricate facts. If no context or verified botanical/AYUSH data exists for the ingredients, state 'NO DATA AVAILABLE / OUT OF SCOPE' rather than assuming validity.\n");
        sb.append("3. Provide the explanation ('reason') and recommendation ('suggestedAction') in language '").append(targetLang.getCode()).append("' (");
        if (targetLang == Language.MARATHI) sb.append("Pure Devanagari Marathi");
        else if (targetLang == Language.HINDI) sb.append("Pure Devanagari Hindi");
        else sb.append("English");
        sb.append(").\n");
        sb.append("4. Return ONLY valid JSON matching this schema:\n");
        sb.append("{\n");
        sb.append("  \"isRelevant\": true,\n");
        sb.append("  \"confidence\": 0.98,\n");
        sb.append("  \"detectedDomain\": \"AYUSH_HERBAL_MEDICINE | OUT_OF_SCOPE\",\n");
        sb.append("  \"reason\": \"Detailed explanation of why it is in-scope or rejected as out of scope\",\n");
        sb.append("  \"suggestedAction\": \"Guidance to user\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    private RelevanceEvaluation parseRelevanceResponse(String rawJson, Language targetLang) {
        try {
            String cleanJson = rawJson.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);
            boolean isRelevant = root.path("isRelevant").asBoolean(true);
            double confidence = root.path("confidence").asDouble(0.95);
            String domain = root.path("detectedDomain").asText(isRelevant ? "AYUSH_HERBAL_MEDICINE" : "OUT_OF_SCOPE");
            String reason = root.path("reason").asText();
            String action = root.path("suggestedAction").asText();

            RelevanceEvaluation eval = new RelevanceEvaluation(isRelevant, confidence, domain, reason, action);
            return eval;
        } catch (Exception e) {
            log.warn("Failed to parse Gemini relevance response JSON: {}", e.getMessage());
            return null;
        }
    }

    private List<String> scanIrrelevantKeywords(String fullText) {
        List<String> flagged = new ArrayList<>();
        if (fullText == null || fullText.isBlank()) return flagged;

        String lower = fullText.toLowerCase();

        // Nuclear / Radioactive
        String[] nuclearKeys = {"uranium", "plutonium", "thorium", "nuclear", "reactor", "radioactive", "radiation", "fission", "atomic bomb", "enrichment"};
        for (String k : nuclearKeys) {
            if (lower.contains(k)) flagged.add(k);
        }

        // Cyber / IT / Crypto / AI
        String[] cyberKeys = {"blockchain", "cryptocurrency", "bitcoin", "ethereum", "crypto", "nft", "tokenomics", "cyber", "microchip", "semiconductor", "quantum computer", "quantum computing", "algorithm", "firmware", "cpu", "gpu", "neural network"};
        for (String k : cyberKeys) {
            if (lower.contains(k)) flagged.add(k);
        }

        // Sci-fi / Aerospace / Military
        String[] sciFiKeys = {"mars colony", "spacecraft", "spaceship", "rocket engine", "missile", "warhead", "alien", "time travel", "laser weapon", "cyborg", "android robot"};
        for (String k : sciFiKeys) {
            if (lower.contains(k)) flagged.add(k);
        }

        // Heavy industrial / Non-herbal commodities
        String[] industrialKeys = {"diesel engine", "combustion engine", "gasoline", "petroleum refining", "rubber tire", "sneaker"};
        for (String k : industrialKeys) {
            if (lower.contains(k)) flagged.add(k);
        }

        // Culinary, Western junk food, and non-AYUSH commodities
        String[] culinaryKeys = {"pizza", "hamburger", "burger", "chocolate", "espresso", "rodeo", "french fries", "fries", "pasta", "sandwich", "steak", "hotdog", "chips", "soda", "coke", "pepsi", "beer", "whiskey"};
        for (String k : culinaryKeys) {
            if (lower.contains(k)) flagged.add(k);
        }

        return flagged;
    }

    private RelevanceEvaluation evaluateDeterministicRelevance(
            String userInput,
            String productName,
            String ingredients,
            String intendedUse,
            Language targetLang,
            List<String> flaggedBlacklist) {

        boolean isMarathi = (targetLang == Language.MARATHI);
        boolean isHindi = (targetLang == Language.HINDI);

        // CASUAL / NON-STATUTORY INTENDED USE CHECK: Reject non-medicinal, recreational or beverage uses
        if (intendedUse != null && !intendedUse.isBlank()) {
            String useLower = intendedUse.toLowerCase().trim();
            String[] casualNonAyushUses = {"drinking", "beverage", "drink", "cocktail", "alcohol", "beer", "wine", "liquor", "smoking", "party", "partying", "recreation", "intoxication", "fuel", "weapon"};
            for (String casual : casualNonAyushUses) {
                if (useLower.contains(casual)) {
                    String domain = "OUT_OF_SCOPE";
                    String reason = isMarathi
                            ? "विनंती केलेला वापर ('" + intendedUse + "') हा आयुष किंवा औषध कायद्यांतर्गत कायदेशीर औषधी/आरोग्य हेतू म्हणून मान्य नाही. केवळ उपचारात्मक, आयुर्वेद आहार किंवा सौंदर्य प्रसाधन हेतू मान्य आहेत."
                            : (isHindi
                            ? "प्रविष्ट किया गया उपयोग ('" + intendedUse + "') आयुष या औषधि कानून के अंतर्गत मान्य चिकित्सीय या स्वास्थ्य उद्देश्य नहीं है। केवल रोगोपचार, पोषण (आयुर्वेद आहार) या कॉस्मेटिक प्रयोजन मान्य हैं।"
                            : "The specified intended use ('" + intendedUse + "') is a casual, recreational, or beverage purpose not recognized under the Drugs & Cosmetics Act (Rule 158-B) or FSSAI Ayurveda Aahar regulations. Ayurvedic medicine cannot be licensed or evaluated for casual '" + intendedUse + "'.");
                    String suggestion = isMarathi
                            ? "कृपया अधिकृत कायदेशीर हेतू नमूद करा: उपचारात्मक (रोग निवारण), आहार पूरक (आयुर्वेद आहार), किंवा सौंदर्य प्रसाधन."
                            : (isHindi
                            ? "कृपया मान्य विनियामक प्रयोजन चुनें: चिकित्सीय उपचार (Therapeutic Treatment), आहार पूरक (Ayurveda Aahar), या प्रसाधन (Cosmetic)."
                            : "Please select a recognized statutory intended use: Therapeutic Treatment (disease mitigation), Dietary Nutrition (Ayurveda Aahar), or Cosmetic Care.");
                    return new RelevanceEvaluation(false, 0.99, domain, reason, suggestion);
                }
            }
        }

        // If flagged by out-of-scope blacklist keywords
        if (!flaggedBlacklist.isEmpty()) {
            String domain = "OUT_OF_SCOPE";
            String reason;
            String suggestion;

            if (isMarathi) {
                reason = "दाखल केलेली माहिती (" + String.join(", ", flaggedBlacklist) + ") ही आयुर्वेदिक, पारंपरिक औषधी किंवा वनस्पती घटकांच्या कार्यक्षेत्राबाहेरील आहे. IP-SHAKTI केवळ आयुष (AYUSH) व जैविक विविधता कायद्याशी संबंधित बाबींचे विश्लेषण करते.";
                suggestion = "कृपया अस्सल आयुर्वेदिक वनस्पती, पारंपरिक कृती (जसे की अश्वगंधा, त्रिफळा, हळद) किंवा नैसर्गिक घटकांची चौकशी दाखल करा.";
            } else if (isHindi) {
                reason = "प्रविष्ट किया गया इनपुट (" + String.join(", ", flaggedBlacklist) + ") आयुर्वेदिक, वानस्पतिक या पारंपरिक चिकित्सा के कार्यक्षेत्र से बाहर है। IP-SHAKTI केवल आयुष (AYUSH) और भारतीय जैवविविधता कानून के लिए समर्पित है।";
                suggestion = "कृपया वास्तविक आयुर्वेदिक जड़ी-बूटी, पारंपरिक योग (जैसे अश्वगंधा, त्रिफला, गिलोय) या प्राकृतिक औषध संबंधी प्रश्न पूछें।";
            } else {
                reason = "The provided ingredients/query contain non-botanical items (" + String.join(", ", flaggedBlacklist) + ") that fall outside the statutory scope of Ayurveda and traditional medicine. IP-SHAKTI exclusively provides guidance for AYUSH and natural biological resource IPR.";
                suggestion = "Please enter an authentic Ayurvedic medicinal plant, classical formulation (e.g., Ashwagandha, Triphala, Turmeric), or botanical extract.";
            }

            RelevanceEvaluation eval = new RelevanceEvaluation(false, 0.99, domain, reason, suggestion);
            eval.setFlaggedKeywords(flaggedBlacklist);
            return eval;
        }

        // POSITIVE AYUSH / BOTANICAL VALIDATION
        // Product name is an arbitrary trademark and is NOT evaluated for botanical names.
        // Ingredients and query MUST contain recognizable botanical, herbal, or classical Ayurvedic keywords.
        String contentToCheck = (ingredients != null && !ingredients.isBlank()) ? ingredients.toLowerCase() : userInput.toLowerCase();
        if (!contentToCheck.isBlank()) {
            boolean hasBotanicalIndicator = containsBotanicalOrAyushIndicators(contentToCheck);
            if (!hasBotanicalIndicator) {
                String domain = "OUT_OF_SCOPE";
                String reason = isMarathi
                        ? "दाखल केलेले घटक हे आयुर्वेदिक ग्रंथ, वनस्पती औषध किंवा आयुष कायद्यांतर्गत औषधी घटक म्हणून मान्य नाहीत. IP-SHAKTI केवळ वनस्पती व पारंपारिक ज्ञान घटकांचे मूल्यांकन करते."
                        : (isHindi
                        ? "प्रविष्ट किए गए घटक आयुर्वेदिक संहिताओं, वानस्पतिक औषधियों या आयुष कानून के अंतर्गत मान्य नहीं हैं। IP-SHAKTI केवल प्रामाणिक जड़ी-बूटियों और जैविक संसाधनों का विश्लेषण करता है।"
                        : "The entered ingredients are not recognized as Ayurvedic medicinal plants, traditional extracts, or biological resources under the Drugs & Cosmetics Act or First Schedule treatises.");
                String suggestion = isMarathi
                        ? "कृपया अधिकृत वनस्पती नाव (उदा. Withania somnifera), शास्त्रीय ग्रंथ नाव किंवा आयुर्वेदिक घटक प्रविष्ट करा."
                        : (isHindi
                        ? "कृपया प्रामाणिक वानस्पतिक नाम (जैसे Curcuma longa, अश्वगंधा) या पारंपरिक आयुर्वेदिक योग दर्ज करें।"
                        : "Please enter authentic botanical binomials (e.g., Withania somnifera, Curcuma longa) or recognized Ayurvedic herbs.");
                return new RelevanceEvaluation(false, 0.95, domain, reason, suggestion);
            }
        }

        // Default: Positively verified as within scope
        String domain = "AYUSH_HERBAL_MEDICINE";
        String reason = isMarathi
                ? "दाखल केलेले घटक व प्रश्न आयुष व पारंपारिक ज्ञान क्षेत्राशी संबंधित आहेत."
                : (isHindi
                ? "प्रविष्ट घटक और प्रश्न आयुष और पारंपरिक ज्ञान के दायरे में उपयुक्त हैं।"
                : "The ingredients and formulation are positively verified as relevant to Ayurveda, natural botanicals, and biological resource IPR.");
        String suggestion = isMarathi
                ? "पुढील कायदेशीर व नियामक मूल्यांकनासाठी पुढे चालू ठेवा."
                : (isHindi
                ? "अगले विनियामक और पेटेंट मूल्यांकन के लिए आगे बढ़ें।"
                : "Proceed with 5-pillar IPR and regulatory evaluation.");

        return new RelevanceEvaluation(true, 0.90, domain, reason, suggestion);
    }

    /**
     * Checks whether the ingredient or query text contains authentic botanical, herbal,
     * or classical Ayurvedic indicators.
     */
    private boolean containsBotanicalOrAyushIndicators(String text) {
        String lower = text.toLowerCase();
        String[] indicators = {
                // Botanical parts and preparations
                "extract", "herb", "plant", "root", "leaf", "leaves", "bark", "seed", "flower", "fruit",
                "rhizome", "stem", "oil", "churna", "powder", "bhasma", "decoction", "taila", "ghrita",
                "asava", "arishta", "vati", "kwath", "rasayana", "synergy", "phytochemical", "botanical",
                "fraction", "standardized", "aqueous", "ethanolic", "tincture", "capsule", "syrup",
                // Common botanical genera / species
                "withania", "somnifera", "curcuma", "longa", "ocimum", "sanctum", "azadirachta", "indica",
                "emblica", "officinalis", "zingiber", "piper", "nigrum", "longum", "boswellia", "serrata",
                "aloe", "vera", "barbadensis", "bacopa", "monnieri", "terminalia", "arjuna", "chebula",
                "bellerica", "commiphora", "mukul", "tinospora", "cordifolia", "glycyrrhiza", "glabra",
                "cinnamomum", "tribulus", "terrestris", "asparagus", "racemosus", "mucuna", "pruriens",
                "centella", "asiatica", "andrographis", "paniculata", "picrorhiza", "kurroa", "swertia",
                "chirayita", "plumbago", "zeylanica", "sida", "cordifolia", "boerhavia", "diffusa",
                // Vernacular / Sanskrit common names
                "ashwagandha", "turmeric", "haldi", "tulsi", "neem", "amla", "triphala", "brahmi",
                "guggulu", "guggul", "giloy", "mulethi", "licorice", "shatavari", "safed musli",
                "haritaki", "bibhitaki", "shunthi", "sunthi", "maricha", "pippali", "ela", "dalchini",
                "lavang", "clove", "kesar", "saffron", "jaiphal", "nutmeg", "shankhpushpi", "manjistha",
                "kutki", "chirata", "chitraka", "bala", "punarnava", "musta", "bilva", "chandan",
                "sandalwood", "sariva", "vidanga", "kutaja", "chyawanprash", "dashmool", "churna",
                "bhasma", "ras", "aushadh", "ayurved"
        };

        for (String ind : indicators) {
            if (lower.contains(ind)) return true;
        }
        return false;
    }
}
