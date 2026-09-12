package com.ayurveda.ipr.chat.service;

import com.ayurveda.ipr.chat.model.*;
import com.ayurveda.ipr.classifier.Rule158BClassificationEngine;
import com.ayurveda.ipr.classifier.model.ClassificationRequest;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import com.ayurveda.ipr.llm.GeminiGenerativeService;
import com.ayurveda.ipr.llm.model.RelevanceEvaluation;
import com.ayurveda.ipr.portal.model.ExternalPortalsPayload;
import com.ayurveda.ipr.portal.service.ExternalPortalService;
import com.ayurveda.ipr.rag.LegalSearchService;
import com.ayurveda.ipr.multilingual.MultilingualTranslationService;
import com.ayurveda.ipr.multilingual.model.Language;
import org.springframework.stereotype.Service;

import com.ayurveda.ipr.audit.model.AuditLog;
import com.ayurveda.ipr.audit.repository.AuditLogRepository;
import com.ayurveda.ipr.dpdp.DpdpSanitizationService;
import com.ayurveda.ipr.dpdp.SafeAbstentionEngine;
import com.ayurveda.ipr.dpdp.model.AbstentionEvaluation;

import java.util.*;

@Service
public class ChatOrchestratorService {

    private final Rule158BClassificationEngine classificationEngine;
    private final LegalSearchService legalSearchService;
    private final ExternalPortalService externalPortalService;
    private final MultilingualTranslationService multilingualService;
    private final GeminiGenerativeService geminiGenerativeService;
    private final DpdpSanitizationService dpdpSanitizationService;
    private final SafeAbstentionEngine safeAbstentionEngine;
    private final AuditLogRepository auditLogRepository;
    private final ChatSessionMemoryService chatSessionMemoryService;

    public ChatOrchestratorService(Rule158BClassificationEngine classificationEngine,
                                   LegalSearchService legalSearchService,
                                   ExternalPortalService externalPortalService,
                                   MultilingualTranslationService multilingualService,
                                   GeminiGenerativeService geminiGenerativeService,
                                   DpdpSanitizationService dpdpSanitizationService,
                                   SafeAbstentionEngine safeAbstentionEngine,
                                   AuditLogRepository auditLogRepository,
                                   ChatSessionMemoryService chatSessionMemoryService) {
        this.classificationEngine = classificationEngine;
        this.legalSearchService = legalSearchService;
        this.externalPortalService = externalPortalService;
        this.multilingualService = multilingualService;
        this.geminiGenerativeService = geminiGenerativeService;
        this.dpdpSanitizationService = dpdpSanitizationService;
        this.safeAbstentionEngine = safeAbstentionEngine;
        this.auditLogRepository = auditLogRepository;
        this.chatSessionMemoryService = chatSessionMemoryService;
    }

    public ChatMessageResponse processMessage(ChatMessageRequest request) {
        String sessionId = (request.getSessionId() != null && !request.getSessionId().isEmpty())
                ? request.getSessionId()
                : UUID.randomUUID().toString();

        Map<String, String> answers = request.getClarificationAnswers() != null
                ? request.getClarificationAnswers()
                : new HashMap<>();

        String rawMsg = request.getMessage() != null ? request.getMessage() : "";
        DpdpSanitizationService.SanitizationResult sanitizationResult = dpdpSanitizationService.sanitize(rawMsg);
        String userMsg = sanitizationResult.sanitizedText();
        boolean piiRedacted = sanitizationResult.piiDetected();

        // Record User Turn into Session-Isolated Memory
        chatSessionMemoryService.addUserMessage(sessionId, userMsg);

        String jurisdiction = (request.getJurisdiction() != null && !request.getJurisdiction().isEmpty())
                ? request.getJurisdiction().toUpperCase()
                : "INDIA";

        // Detect language (English, Hindi, or Marathi)
        Language targetLang = multilingualService.detectLanguage(userMsg, request.getLanguage());

        // =========================================================================
        // SAFE ABSTENTION CHECK 1: Prohibited DMRA 1954 claims
        // =========================================================================
        AbstentionEvaluation dmraEval = safeAbstentionEngine.evaluateQuery(userMsg);
        if (dmraEval.isShouldAbstain()) {
            ChatMessageResponse response = new ChatMessageResponse(
                    sessionId,
                    ChatMessageResponse.DialogueStatus.SAFE_ABSTENTION,
                    dmraEval.getPublicAdvisoryMessage()
            );
            response.setCitationPills(dmraEval.getCitationPills());
            response.setJurisdiction(jurisdiction);
            response.setDisclaimer("Statutory Safe Abstention: Advertising or claiming cures for scheduled diseases violates the Drugs and Magic Remedies Act 1954.");

            chatSessionMemoryService.addAiMessage(sessionId, response.getBotMessage());

            auditLogRepository.save(new AuditLog(
                    sessionId,
                    userMsg,
                    jurisdiction,
                    "SAFE_ABSTENTION_PROHIBITED_CLAIM",
                    0.0,
                    "DMRA-1954-SEC3,PATENTS-ACT-SEC3I",
                    piiRedacted
            ));

            return multilingualService.localizeResponse(response, targetLang);
        }

        // =========================================================================
        // GEMINI DOMAIN RELEVANCE GATEKEEPER: Context-Aware — skip if mid-clarification
        // =========================================================================
        String prodName = request.getProductName() != null ? request.getProductName().trim() : "";
        String ingredients = request.getMainIngredients() != null ? request.getMainIngredients().trim() : "";
        String intendedUse = request.getIntendedUse() != null ? request.getIntendedUse().trim() : "";

        // If session is already active (user is answering clarification questions), skip the gatekeeper.
        // A single-word answer like "NO" or "YES" would otherwise be misidentified as out-of-scope.
        boolean isActiveClarificationSession = chatSessionMemoryService.hasActiveSession(sessionId) && !answers.isEmpty();

        RelevanceEvaluation relevance;
        if (isActiveClarificationSession) {
            // Mid-conversation: treat as in-scope, build a permissive relevance stub
            relevance = new RelevanceEvaluation(true, 0.95, "AYUSH_HERBAL_MEDICINE",
                    "Continuing active IP-SHAKTI clarification session.", "Proceed with evaluation.");
        } else {
            // Fresh session: run full relevance check, inject recent conversation history for context
            String conversationHistory = chatSessionMemoryService.getFormattedHistory(sessionId, 5);
            relevance = geminiGenerativeService.checkDomainRelevance(
                    userMsg,
                    prodName,
                    ingredients,
                    intendedUse,
                    conversationHistory,
                    targetLang
            );
        }

        if (!relevance.isRelevant()) {
            ChatMessageResponse response = new ChatMessageResponse(
                    sessionId,
                    ChatMessageResponse.DialogueStatus.OUT_OF_SCOPE,
                    relevance.getReason()
            );
            response.setJurisdiction(jurisdiction);
            response.setRelevanceEvaluation(relevance);
            List<String> pills = new ArrayList<>();
            pills.add("Out of Scope");
            if (relevance.getDetectedDomain() != null) {
                pills.add(relevance.getDetectedDomain());
            }
            if (!relevance.getFlaggedKeywords().isEmpty()) {
                pills.add("Flagged: " + String.join(", ", relevance.getFlaggedKeywords()));
            }
            response.setCitationPills(pills);
            response.setDisclaimer("Domain Boundary Enforcement: IP-SHAKTI exclusively provides statutory and IPR analysis for AYUSH, herbal formulations, and Biological Diversity Act compliance. Irrelevant or non-botanical inputs are not processed.");

            chatSessionMemoryService.addAiMessage(sessionId, response.getBotMessage());

            auditLogRepository.save(new AuditLog(
                    sessionId,
                    userMsg,
                    jurisdiction,
                    "OUT_OF_SCOPE_REJECTED",
                    0.0,
                    relevance.getDetectedDomain(),
                    piiRedacted
            ));

            return multilingualService.localizeResponse(response, targetLang);
        }


        // =========================================================================
        // DIALOGUE STEP 1: Check if "isClassical" parameter is answered
        // =========================================================================
        if (!answers.containsKey("isClassical")) {
            ChatMessageResponse response = new ChatMessageResponse(
                    sessionId,
                    ChatMessageResponse.DialogueStatus.CLARIFICATION_REQUIRED,
                    "Before evaluating patentability and regulatory pathway under Indian Law, I need to know " +
                    "whether this formulation is an existing classical scripture recipe or a newly developed formulation. " +
                    "This distinction is foundational under Patents Act 1970 §3(p) and the Traditional Knowledge Digital Library (TKDL) framework."
            );

            List<ClarificationOption> options = Arrays.asList(
                    new ClarificationOption("Yes (Unaltered Classical Scripture Recipe)", "YES"),
                    new ClarificationOption("No (Newly Developed / Modified Formulation)", "NO"),
                    new ClarificationOption("Not Sure", "NOT_SURE")
            );

            ClarificationPrompt prompt = new ClarificationPrompt(
                    1,
                    "isClassical",
                    "Is this formulation directly based on an authoritative classical Ayurvedic text (e.g. Charaka Samhita, Sushruta Samhita, Sharangadhara)?",
                    options
            );

            response.setClarificationPrompt(prompt);
            response.setCitationPills(Arrays.asList("Patents Act, 1970 §3(p)", "TKDL Framework", "Drugs & Cosmetics Act First Schedule"));

            chatSessionMemoryService.addAiMessage(sessionId, response.getBotMessage());

            auditLogRepository.save(new AuditLog(
                    sessionId,
                    userMsg,
                    jurisdiction,
                    "CLARIFICATION_REQUIRED",
                    100.0,
                    "PATENTS-ACT-SEC3P,DNC-ACT-SCH1",
                    piiRedacted
            ));

            return multilingualService.localizeResponse(response, targetLang);
        }

        String isClassicalVal = answers.get("isClassical");

        // =========================================================================
        // DIALOGUE STEP 2: If NOT classical, check technical novelty parameter
        // =========================================================================
        if ("NO".equalsIgnoreCase(isClassicalVal) && !answers.containsKey("technicalNovelty")) {
            ChatMessageResponse response = new ChatMessageResponse(
                    sessionId,
                    ChatMessageResponse.DialogueStatus.CLARIFICATION_REQUIRED,
                    "Since this is a newly developed Ayurvedic formulation, patentability in India hinges strictly " +
                    "on whether there is proven technical synergism or a novel drug delivery system, to overcome " +
                    "the 'mere admixture' bar under Section 3(e) and Rule 158-B(1)(B) clinical trial mandates."
            );

            List<ClarificationOption> options = Arrays.asList(
                    new ClarificationOption("Novel Drug Delivery System (Nano-Emulsion / Liposome / Micro-encapsulation)", "NANO_EXTRACT"),
                    new ClarificationOption("Specific Synergistic Ratio of Herbs (Lab / In-Vitro Data Available)", "SYNERGISTIC_RATIO"),
                    new ClarificationOption("Purified Bioactive Phytochemical Molecule (>90% Marker Purity)", "PHYTOCHEMICAL"),
                    new ClarificationOption("Simple Mixture of Known Crude Herbal Powders", "CRUDE_MIXTURE")
            );

            ClarificationPrompt prompt = new ClarificationPrompt(
                    2,
                    "technicalNovelty",
                    "What is technically new about your formulation?",
                    options
            );

            response.setClarificationPrompt(prompt);
            response.setCitationPills(Arrays.asList("Patents Act, 1970 §3(e)", "Rule 158-B(1)(B)", "CDSCO Rule 122-E"));

            chatSessionMemoryService.addAiMessage(sessionId, response.getBotMessage());

            auditLogRepository.save(new AuditLog(
                    sessionId,
                    userMsg,
                    jurisdiction,
                    "CLARIFICATION_REQUIRED",
                    100.0,
                    "PATENTS-ACT-SEC3E,RULE-158B",
                    piiRedacted
            ));

            return multilingualService.localizeResponse(response, targetLang);
        }

        // =========================================================================
        // DIALOGUE STEP 3: Clarifications Complete -> Synthesize 5-Pillars Response!
        // =========================================================================
        ChatMessageResponse response = synthesizeAssessment(sessionId, userMsg, jurisdiction, answers, targetLang, piiRedacted, request.getProductName());
        return multilingualService.localizeResponse(response, targetLang);
    }

    private ChatMessageResponse synthesizeAssessment(String sessionId, String userMsg, String jurisdiction, Map<String, String> answers, Language targetLang, boolean piiRedacted, String requestedProductName) {
        String isClassical = answers.getOrDefault("isClassical", "NO");
        String technicalNovelty = answers.getOrDefault("technicalNovelty", "CRUDE_MIXTURE");

        String plantKey = (requestedProductName != null && !requestedProductName.isBlank())
                ? requestedProductName.trim()
                : extractPlantOrProductName(userMsg);

        // 1. Run Deterministic Rule 158-B Classification Engine
        ClassificationRequest classReq = new ClassificationRequest();
        classReq.setProductName(plantKey);
        String lowerPlant = plantKey.toLowerCase();
        boolean isClassicalText = "YES".equalsIgnoreCase(isClassical)
                || lowerPlant.contains("triphala")
                || lowerPlant.contains("chyawanprash")
                || lowerPlant.contains("trikatu")
                || lowerPlant.contains("sitopaladi");
        classReq.setMatchesScheduleIBook(isClassicalText);
        if (isClassicalText) {
            classReq.setScheduleIBookName("Ayurvedic Formulary of India (AFI) / Charaka Samhita");
        }
        classReq.setFormulaOrRatioModified(!"YES".equalsIgnoreCase(isClassical));
        classReq.setNewIndicationOrDosageRoute("NANO_EXTRACT".equalsIgnoreCase(technicalNovelty));
        classReq.setPurifiedPhytochemicalExtract("PHYTOCHEMICAL".equalsIgnoreCase(technicalNovelty));
        classReq.setSynergisticDataAvailable("SYNERGISTIC_RATIO".equalsIgnoreCase(technicalNovelty) || "NANO_EXTRACT".equalsIgnoreCase(technicalNovelty));
        classReq.setIntendedUse(ClassificationRequest.IntendedUse.THERAPEUTIC_TREATMENT);
        classReq.setApplicantType(ClassificationRequest.EntityType.INDIAN_COMPANY);
        classReq.setCommercialUtilization(true);

        ClassificationResult classRes = classificationEngine.evaluate(classReq);

        // 2. Run Live External Portals (CBD ABSCH, InPASS, WIPO, USPTO, AYUSH)
        ExternalPortalsPayload portals = externalPortalService.resolveAllPortals(plantKey);

        // 3. Run Native PostgreSQL Hybrid RRF Search with ±5 Window Context Expansion
        String searchNormalizedQuery = multilingualService.normalizeQueryToEnglish(userMsg, targetLang);
        String queryForSearch = (!plantKey.equalsIgnoreCase("Ayurvedic Formulation") && !searchNormalizedQuery.contains(plantKey))
                ? plantKey + " " + searchNormalizedQuery
                : searchNormalizedQuery;

        List<Map<String, Object>> rawHits = legalSearchService.searchHybridWithWindow(queryForSearch, jurisdiction, 4, 5);
        if (rawHits == null || rawHits.isEmpty()) {
            rawHits = legalSearchService.searchHybridWithWindow(plantKey, jurisdiction, 4, 5);
        }

        List<StatutorySourceCitation> citations = new ArrayList<>();
        for (Map<String, Object> hit : rawHits) {
            String text = (String) hit.get("text");
            Double confidence = (Double) hit.get("confidence");
            Double score = (Double) hit.get("score");
            double displayScore = confidence != null ? confidence : (score != null ? Math.round(score * 100.0) / 100.0 : 0.85);
            @SuppressWarnings("unchecked")
            Map<String, Object> meta = (Map<String, Object>) hit.get("metadata");

            String docTitle = meta != null && meta.containsKey("doc_title") ? meta.get("doc_title").toString() : "Statute";
            String sectionRef = meta != null && meta.containsKey("section_ref") ? meta.get("section_ref").toString() : "Statutory Provision";
            String sourceFile = meta != null && meta.containsKey("file_path") ? meta.get("file_path").toString() : "";
            if (meta != null && meta.containsKey("window_chunks")) {
                sourceFile = (sourceFile.isEmpty() ? "" : sourceFile + " ") + "(Chunks " + meta.get("window_chunks") + ")";
            }

            // Resolve official Gazette / India Code URL and Authority
            String officialUrl = "https://indiacode.gov.in";
            String governingBody = "Government of India";
            Integer actYear = 1970;

            String docLower = docTitle.toLowerCase();
            if (docLower.contains("patent")) {
                officialUrl = "https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d";
                governingBody = "Indian Patent Office / DPIIT";
                actYear = 1970;
            } else if (docLower.contains("biodiversity") || docLower.contains("biological")) {
                officialUrl = "https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d";
                governingBody = "National Biodiversity Authority (NBA)";
                actYear = 2002;
            } else if (docLower.contains("drugs") || docLower.contains("cosmetics")) {
                officialUrl = "https://cdsco.gov.in";
                governingBody = "AYUSH State Licensing Authority / CDSCO";
                actYear = 1940;
            } else if (docLower.contains("wipo") || docLower.contains("gratk")) {
                officialUrl = "https://www.wipo.int/treaties/en/ip/gratk/";
                governingBody = "WIPO Secretariat (Geneva)";
                actYear = 2024;
            }

            citations.add(new StatutorySourceCitation(
                    docTitle,
                    sectionRef,
                    jurisdiction,
                    text != null && text.length() > 300 ? text.substring(0, 300) + "..." : text,
                    sourceFile,
                    displayScore,
                    officialUrl,
                    governingBody,
                    actYear
            ));
        }

        if (portals.getAyushResearchEvidence() != null && portals.getAyushResearchEvidence().isHasCuratedEvidence() 
                && !portals.getAyushResearchEvidence().getPublishedClinicalTrials().isEmpty()) {
            AyushEvidenceResponse.ClinicalTrial primaryTrial = portals.getAyushResearchEvidence().getPublishedClinicalTrials().get(0);
            citations.add(new StatutorySourceCitation(
                    "AYUSH Clinical Evidence / PubMed",
                    "PMID: " + primaryTrial.getPmid() + " (" + primaryTrial.getJournal() + ", " + primaryTrial.getYear() + ")",
                    "INDIA",
                    primaryTrial.getTitle() + " [n=" + primaryTrial.getSampleSize() + " subjects]. " + primaryTrial.getPrimaryOutcomes(),
                    "data/raw/json/ayush_clinical_evidence_dataset.json",
                    0.96,
                    primaryTrial.getPubmedUrl(),
                    "National Library of Medicine (PubMed) / Ministry of AYUSH",
                    primaryTrial.getYear()
            ));
        }

        // 4. Assemble the 5 Pillars

        // Pillar 1: IP Analysis
        FivePillarsResponse.IpPillar ipPillar = new FivePillarsResponse.IpPillar();
        ipPillar.setPatentableInIndia(classRes.isFormulationPatentableInIndia());
        ipPillar.setVerdict(classRes.getPatentabilityVerdict());
        ipPillar.setRelevantPatentSections(classRes.getRelevantPatentSections());
        ipPillar.setFilingStrategy(classRes.getRecommendedIprStrategy());
        ipPillar.setInpassBooleanSyntax(portals.getInpassSearch().getInpassBooleanQuery());
        ipPillar.setUsptoSection101Guidance(portals.getUsptoGuidance().getSection101EligibilityVerdict() + " " + portals.getUsptoGuidance().getRecommendedClaimStrategy());

        // Enhanced Trademark Guidance under Trade Marks Act 1999 & Nice Classification
        TrademarkGuidance tmGuidance = new TrademarkGuidance(
                "Class 5 (Ayurvedic Pharmaceuticals & Herbal Formulations), Class 30 (Ayurveda Aahar & Herbal Infusions), Class 3 (Herbal Cosmetics)",
                "Register distinctive coined house prefix as brand trademark (e.g. 'BrandName " + plantKey + "'). Classical names from First Schedule texts cannot be monopolized under Section 9/11 (Dabur India v. Baidyanath).",
                "Generic classical Ayurvedic formulation names are publici juris and strictly barred from exclusive trademark monopolization under Sections 9(1)(b) and 11.",
                "Verify geographical origin under GI Act 1999 if raw botanical cultivars originate from registered GI clusters (e.g. Navara rice, Malabar pepper, Nilambur teak)."
        );
        ipPillar.setTrademarkGuidance(tmGuidance);
        ipPillar.setWipoGratkDisclosure("Article 3 WIPO GRATK Treaty 2024: Mandatory patent applicant disclosure of genetic resources country of origin (India) and associated traditional knowledge.");
        ipPillar.setDesignProtectionRelevance("Designs Act 2000: Novel ergonomic bottle geometry, dropper mechanism, or topical applicator shapes can be registered independently in Class 09-01.");

        // Pillar 2: Regulatory Analysis
        FivePillarsResponse.RegulatoryPillar regPillar = new FivePillarsResponse.RegulatoryPillar();
        regPillar.setProductCategory(classRes.getCategoryDisplayName());
        regPillar.setLicensingAuthority(classRes.getLicensingAuthority());
        regPillar.setLicensingForm(classRes.getLicensingProcedure());
        regPillar.setClinicalTrialObligation(classRes.getClinicalTrialRequirement());
        regPillar.setGoverningActAndRules(classRes.getGoverningAct());
        regPillar.setAyushEvidenceChecklist(portals.getAyushResearchEvidence().getRule158BEvidenceChecklist());
        regPillar.setFssaiOrCosmeticGuidance(
                "If marketed as Ayurveda Aahar: Central FSSAI License with mandatory Ayurveda Aahar logo required under FSSAI Regulations 2022. Disease treatment/cure claims strictly barred under Drugs & Magic Remedies Act 1954."
        );

        // Pillar 3: ABS / Biodiversity Check
        FivePillarsResponse.AbsPillar absPillar = new FivePillarsResponse.AbsPillar();
        absPillar.setComplianceStatus(classRes.getNbaComplianceStatus());
        absPillar.setRequiredForm(classRes.getRequiredNbaForm());
        absPillar.setActiveIndianPermitsInCbd(portals.getAbschCompliance().getTotalIndianPermitsInRegistry());
        absPillar.setLiveCbdLink(portals.getAbschCompliance().getOfficialPortalUrl());
        absPillar.setGoverningSection("Biological Diversity Act 2002, Section 3, Section 6 & Section 7");

        // Pillar 4: TKDL / Prior-Art Check
        FivePillarsResponse.TkdlPillar tkdlPillar = new FivePillarsResponse.TkdlPillar();
        tkdlPillar.setBotanicalBinomial(portals.getInpassSearch().getBotanicalOrFormulationName());
        tkdlPillar.setSanskritName(plantKey);
        tkdlPillar.setTkrcIpcClass(portals.getInpassSearch().getMatchedIpcClass());
        tkdlPillar.setPriorArtRiskWarning(
                "High prior art density in TKDL. Under Section 3(p), any patent claim asserting known properties " +
                "or raw extracts of " + plantKey + " will face automatic refusal. Patent claims must be restricted " +
                "strictly to novel delivery kinetics, excipient complexes, or synergistic ratios."
        );
        tkdlPillar.setWipoPatentscopeDeepLink(portals.getWipoPatentscope().getWipoPatentscopeDeepLink());

        // Pillar 5: Official Sources & Citations
        FivePillarsResponse fivePillars = new FivePillarsResponse(
                ipPillar,
                regPillar,
                absPillar,
                tkdlPillar,
                citations
        );

        // 5. Construct Action Roadmap (Sequential Filing Checklist)
        List<ActionRoadmapItem> actionRoadmap = new ArrayList<>();
        actionRoadmap.add(new ActionRoadmapItem(
                1,
                "REGULATORY_COMPLIANCE",
                "Apply for AYUSH Manufacturing License (" + classRes.getLicensingProcedure() + ")",
                classRes.getLicensingAuthority(),
                classRes.getGoverningAct(),
                "e-Aushadhi / State AYUSH Licensing Portal",
                "https://e-aushadhi.gov.in",
                true,
                "60-90 days"
        ));
        actionRoadmap.add(new ActionRoadmapItem(
                2,
                "BIODIVERSITY_APPROVAL",
                "Submit " + classRes.getRequiredNbaForm() + " for Commercial Utilization & IPR Prior Approval",
                "National Biodiversity Authority (Chennai) / State Biodiversity Board",
                "Biological Diversity Act 2002, Section 3, 6(1) & 7",
                "ABS e-Filing Portal",
                "https://absefiling.nic.in",
                true,
                "90-180 days"
        ));
        actionRoadmap.add(new ActionRoadmapItem(
                3,
                "IPR_PATENT_PROTECTION",
                classRes.isFormulationPatentableInIndia()
                        ? "File Process / Drug Delivery Patent Application with Mandatory Origin Declaration (Form 1 & 2)"
                        : "Defensive IP Strategy: Publish Formulation in TKDL/Prior Art to Bar Competitor Monopolies",
                "Indian Patent Office (IPO / DPIIT)",
                "Patents Act 1970 §2(1)(j), §3(p), §10(4)(d)(ii)",
                "InPASS e-Filing Portal",
                "https://ipindiaonline.gov.in",
                classRes.isFormulationPatentableInIndia(),
                "1-3 days for provisional filing"
        ));
        actionRoadmap.add(new ActionRoadmapItem(
                4,
                "TRADEMARK_BRAND_PROTECTION",
                "Register Coined House Mark & Product Logo in Class 5 (Pharma) and Class 30 (Aahar)",
                "Trade Marks Registry (TMR)",
                "Trade Marks Act 1999, Section 18",
                "IP India Trademark Portal",
                "https://ipindiaonline.gov.in",
                true,
                "7-15 days for formal filing receipt"
        ));

        // 6. Retrieve Session-Isolated Conversation History (Last 5 dialogue turns)
        String conversationHistory = chatSessionMemoryService.getFormattedHistory(sessionId, 5);

        // 7. Construct Generative LLM Deliverables via Gemini Flash (with resilient fallback)
        ExecutiveLegalDeliverables deliverables = geminiGenerativeService.generateDeliverables(
                plantKey,
                classRes,
                portals,
                citations,
                targetLang,
                conversationHistory
        );

        // 8. Construct Final Response with Confidence Score
        ChatMessageResponse response = new ChatMessageResponse(
                sessionId,
                ChatMessageResponse.DialogueStatus.ASSESSMENT_COMPLETE,
                "Assessment complete. Here is the verified 5-pillar IPR, Regulatory, and Biodiversity analysis " +
                "for your " + plantKey + " formulation under Indian and International Law."
        );

        response.setJurisdiction(jurisdiction);
        response.setPillars(fivePillars);
        response.setActionRoadmap(actionRoadmap);
        response.setLlmDeliverables(deliverables);
        // Calculate statutory confidence metrics
        int retrievalScore = citations.isEmpty() ? 50 : 92;
        int authorityScore = 95;
        int citationCoverage = Math.min(100, citations.size() * 25);
        int overallScore = (int) Math.round(0.5 * retrievalScore + 0.3 * authorityScore + 0.2 * citationCoverage);
        String level = overallScore >= 80 ? "HIGH" : (overallScore >= 60 ? "MEDIUM" : "LOW");

        response.setConfidenceScore(new ConfidenceScore(level, overallScore, retrievalScore, authorityScore, citationCoverage));

        // SAFE ABSTENTION CHECK 2: Confidence threshold (< 60%)
        AbstentionEvaluation confEval = safeAbstentionEngine.evaluateConfidence(overallScore);
        if (confEval.isShouldAbstain()) {
            response.setStatus(ChatMessageResponse.DialogueStatus.SAFE_ABSTENTION);
            response.setBotMessage(confEval.getPublicAdvisoryMessage());
            response.setCitationPills(confEval.getCitationPills());
            response.setDisclaimer("Statutory Safe Abstention: Composite legal confidence is below safety thresholds (< 60%). Escalate to a registered patent attorney.");
        }

        // Persist sovereign audit log into PostgreSQL (Neon)
        auditLogRepository.save(new AuditLog(
                sessionId,
                userMsg,
                jurisdiction,
                response.getStatus().name(),
                (double) overallScore,
                String.join(",", response.getCitationPills()),
                piiRedacted
        ));

        // Record AI response in Session Memory
        chatSessionMemoryService.addAiMessage(sessionId, response.getBotMessage());

        return response;
    }

    private String extractPlantOrProductName(String query) {
        if (query == null || query.isBlank()) return "Ashwagandha";
        String q = query.toLowerCase().trim();

        // If the query contains coined names or technical indicators, preserve the actual name
        String cleaned = query.replaceAll("(?i)(can I patent|how to protect|evaluate|provide|comprehensive|5-pillar|statutory|advisory|report|for|evaluation|the|a|an|in india|under indian law|under rule 158-b)", "").trim();
        if (!cleaned.isBlank() && cleaned.length() < 60 && cleaned.split("\\s+").length <= 4) {
            return cleaned;
        }

        if (q.matches(".*\\b(triphala|त्रिफळा|त्रिफला)\\b.*")) return "Triphala";
        if (q.matches(".*\\b(haritaki|हरीतकी|chebula)\\b.*")) return "Haritaki";
        if (q.matches(".*\\b(bibhitaki|बिभीतक|बहेड़ा|bellirica)\\b.*")) return "Bibhitaki";
        if (q.matches(".*\\b(chyawanprash|च्यवनप्राश)\\b.*") && !q.contains("cyber")) return "Chyawanprash";
        if (q.matches(".*\\b(trikatu|त्रिकटु)\\b.*")) return "Trikatu";
        if (q.matches(".*\\b(sitopaladi|सितोपलादि)\\b.*")) return "Sitopaladi";
        if (q.matches(".*\\b(ashwagandha|withania|अश्वगंधा)\\b.*")) return "Ashwagandha";
        if (q.matches(".*\\b(turmeric|haldi|curcuma|हळद|हल्दी|हरिद्रा)\\b.*")) return "Haridra (Turmeric)";
        if (q.matches(".*\\b(tulsi|ocimum|तुळस|तुलसी)\\b.*")) return "Tulsi";
        if (q.matches(".*\\b(neem|azadirachta|कडुनिंब|नीम|निम्ब)\\b.*")) return "Neem";
        if (q.matches(".*\\b(guggul|commiphora|गुग्गुळ|गुग्गुल|गुग्गुलु)\\b.*")) return "Guggulu";
        if (q.matches(".*\\b(giloy|tinospora|गुळवेल|गिलोय|गुडूची)\\b.*")) return "Guduchi (Giloy)";
        if (q.matches(".*\\b(shatavari|शतावरी)\\b.*")) return "Shatavari";
        if (q.matches(".*\\b(brahmi|ब्राह्मी)\\b.*")) return "Brahmi";
        if (q.matches(".*\\b(amla|amalaki|आवळा|आंवला|आमलकी)\\b.*")) return "Amalaki";
        if (q.matches(".*\\b(arjuna|अर्जुन)\\b.*")) return "Arjuna";
        if (q.matches(".*\\b(ginger|zingiber|सुंठ|सोंठ)\\b.*")) return "Shunthi (Dry Ginger)";
        if (q.matches(".*\\b(licorice|glycyrrhiza|ज्येष्ठमध|मुलेठी|यष्टिमधु)\\b.*")) return "Yashtimadhu";
        if (q.matches(".*\\b(aloe|कोरफड|घृतकुमारी|कुमारी)\\b.*")) return "Kumari (Aloe Vera)";
        if (q.matches(".*\\b(shilajit|जीत)\\b.*")) return "Shilajit";
        if (q.matches(".*\\b(kalmegh|कालमेघ)\\b.*")) return "Kalmegh";
        if (q.matches(".*\\b(kutki|कुटकी)\\b.*")) return "Kutki";
        if (q.matches(".*\\b(pippali|पिप्पली)\\b.*")) return "Pippali";
        if (q.matches(".*\\b(bhringraj|भृंगराज)\\b.*")) return "Bhringraj";

        if (!cleaned.isBlank() && cleaned.length() < 80) {
            return cleaned;
        }

        return "Ayurvedic Formulation";
    }
}
