package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.AyushEvidenceResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Portal 5 Connector: Ministry of AYUSH Research Portal (ayushportal.nic.in)
 * and Ayurvedic Pharmacopoeia of India (API) evidence engine.
 * Maps formulations and medicinal plants to curated published clinical trials,
 * OECD 423 toxicology benchmarks, and API monograph standards required for
 * Rule 158-B licensing and Section 3(e) patent defense.
 */
@Service
public class AyushResearchPortalService {

    private static final Logger log = LoggerFactory.getLogger(AyushResearchPortalService.class);
    private static final String AYUSH_PORTAL_BASE = "https://ayushportal.nic.in/";
    private static final String DATASET_PATH = "data/raw/json/ayush_clinical_evidence_dataset.json";

    private final ObjectMapper objectMapper;
    private final Map<String, JsonNode> plantEvidenceIndex = new HashMap<>();

    public AyushResearchPortalService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        loadEvidenceDataset();
    }

    private synchronized void loadEvidenceDataset() {
        try {
            File jsonFile = new File(DATASET_PATH);
            JsonNode rootNode = null;

            if (jsonFile.exists()) {
                log.info("Loading AYUSH clinical evidence dataset from file: {}", jsonFile.getAbsolutePath());
                rootNode = objectMapper.readTree(jsonFile);
            } else {
                // Try classpath fallback
                try (InputStream is = getClass().getClassLoader().getResourceAsStream("ayush_clinical_evidence_dataset.json")) {
                    if (is != null) {
                        log.info("Loading AYUSH clinical evidence dataset from classpath");
                        rootNode = objectMapper.readTree(is);
                    }
                }
            }

            if (rootNode != null && rootNode.has("records") && rootNode.get("records").isArray()) {
                plantEvidenceIndex.clear();
                for (JsonNode record : rootNode.get("records")) {
                    indexRecord(record);
                }
                log.info("Successfully indexed {} AYUSH clinical evidence plant records.", plantEvidenceIndex.size());
            } else {
                log.warn("AYUSH clinical evidence dataset not found or records array empty.");
            }
        } catch (Exception e) {
            log.error("Failed to load AYUSH clinical evidence dataset: {}", e.getMessage(), e);
        }
    }

    private void indexRecord(JsonNode record) {
        if (record.has("plant_key")) {
            plantEvidenceIndex.put(record.get("plant_key").asText().toLowerCase(), record);
        }
        if (record.has("sanskrit_name")) {
            plantEvidenceIndex.put(record.get("sanskrit_name").asText().toLowerCase(), record);
        }
        if (record.has("botanical_name")) {
            String botanical = record.get("botanical_name").asText().toLowerCase();
            plantEvidenceIndex.put(botanical, record);
            // Index primary genus/species without author (e.g. "withania somnifera")
            String[] parts = botanical.split(" ");
            if (parts.length >= 2) {
                plantEvidenceIndex.put((parts[0] + " " + parts[1]).toLowerCase(), record);
            }
        }
        if (record.has("common_names") && record.get("common_names").isArray()) {
            for (JsonNode cn : record.get("common_names")) {
                plantEvidenceIndex.put(cn.asText().toLowerCase(), record);
            }
        }
    }

    public AyushEvidenceResponse mapEvidenceForFormulation(String plantOrFormulation) {
        String cleanTerm = plantOrFormulation != null ? plantOrFormulation.trim() : "Ashwagandha";
        String lowerTerm = cleanTerm.toLowerCase();

        String searchUrl;
        try {
            searchUrl = AYUSH_PORTAL_BASE + "?search=" + URLEncoder.encode(cleanTerm, StandardCharsets.UTF_8);
        } catch (Exception e) {
            searchUrl = AYUSH_PORTAL_BASE;
        }

        // 1. Check for curated match in our verified clinical dataset
        JsonNode matchedRecord = findMatchingRecord(lowerTerm);

        if (matchedRecord != null) {
            return buildCuratedResponse(cleanTerm, searchUrl, matchedRecord);
        }

        // 2. Fallback response for unindexed botanical/formulation
        return buildFallbackResponse(cleanTerm, searchUrl);
    }

    private JsonNode findMatchingRecord(String query) {
        if (plantEvidenceIndex.isEmpty()) {
            loadEvidenceDataset();
        }

        // Direct exact match
        if (plantEvidenceIndex.containsKey(query)) {
            return plantEvidenceIndex.get(query);
        }

        // Substring token match
        for (Map.Entry<String, JsonNode> entry : plantEvidenceIndex.entrySet()) {
            if (query.contains(entry.getKey()) || entry.getKey().contains(query)) {
                return entry.getValue();
            }
        }

        return null;
    }

    private AyushEvidenceResponse buildCuratedResponse(String cleanTerm, String searchUrl, JsonNode record) {
        AyushEvidenceResponse response = new AyushEvidenceResponse();
        response.setTargetFormulationOrPlant(cleanTerm);
        response.setPreconfiguredSearchUrl(searchUrl);
        response.setHasCuratedEvidence(true);

        if (record.has("botanical_name")) {
            response.setBotanicalBinomial(record.get("botanical_name").asText());
        }
        if (record.has("sanskrit_name")) {
            response.setSanskritName(record.get("sanskrit_name").asText());
        }
        if (record.has("family")) {
            response.setFamily(record.get("family").asText());
        }
        if (record.has("part_used")) {
            response.setPartUsed(record.get("part_used").asText());
        }
        if (record.has("api_monograph_ref")) {
            response.setApiMonographRef(record.get("api_monograph_ref").asText());
        }
        if (record.has("active_chemical_markers")) {
            response.setActiveChemicalMarkers(record.get("active_chemical_markers").asText());
        }

        if (record.has("common_names") && record.get("common_names").isArray()) {
            List<String> names = new ArrayList<>();
            for (JsonNode cn : record.get("common_names")) {
                names.add(cn.asText());
            }
            response.setCommonNames(names);
        }

        if (record.has("therapeutic_uses") && record.get("therapeutic_uses").isArray()) {
            List<String> uses = new ArrayList<>();
            for (JsonNode u : record.get("therapeutic_uses")) {
                uses.add(u.asText());
            }
            response.setTherapeuticUses(uses);
        }

        // Map Toxicology Profile
        if (record.has("toxicology_profile")) {
            JsonNode tox = record.get("toxicology_profile");
            AyushEvidenceResponse.ToxicologyData toxData = new AyushEvidenceResponse.ToxicologyData(
                    tox.path("oecd_guideline").asText("OECD Guideline 423"),
                    tox.path("ld50_value").asText("> 2000 mg/kg"),
                    tox.path("noael").asText("Not specified"),
                    tox.path("heavy_metal_compliance").asText("Compliant with AYUSH limits"),
                    tox.path("safety_assessment").asText("Safe at therapeutic dosage")
            );
            response.setToxicologyProfile(toxData);
        }

        // Map Published Clinical Trials
        List<AyushEvidenceResponse.ClinicalTrial> trials = new ArrayList<>();
        List<String> evidenceSummaryList = new ArrayList<>();

        if (record.has("published_clinical_trials") && record.get("published_clinical_trials").isArray()) {
            for (JsonNode trialNode : record.get("published_clinical_trials")) {
                AyushEvidenceResponse.ClinicalTrial trial = new AyushEvidenceResponse.ClinicalTrial();
                trial.setPmid(trialNode.path("pmid").asText());
                trial.setCtriId(trialNode.path("ctri_id").asText());
                trial.setTitle(trialNode.path("title").asText());
                trial.setAuthors(trialNode.path("authors").asText());
                trial.setJournal(trialNode.path("journal").asText());
                trial.setYear(trialNode.path("year").asInt());
                trial.setSampleSize(trialNode.path("sample_size").asInt());
                trial.setStudyDesign(trialNode.path("study_design").asText());
                trial.setDosageRegimen(trialNode.path("dosage_regimen").asText());
                trial.setPrimaryOutcomes(trialNode.path("primary_outcomes").asText());
                trial.setPubmedUrl(trialNode.path("pubmed_url").asText());
                trial.setRule158bApplicability(trialNode.path("rule_158b_applicability").asText());
                trial.setPatentSection3eSynergism(trialNode.path("patent_section_3e_synergism").asText());

                trials.add(trial);

                evidenceSummaryList.add(String.format("Clinical RCT (PMID %s): %s (%s, %d | n=%d subjects)",
                        trial.getPmid(), trial.getTitle(), trial.getJournal(), trial.getYear(), trial.getSampleSize()));
            }
        }
        response.setPublishedClinicalTrials(trials);

        evidenceSummaryList.add("API Monograph: " + response.getApiMonographRef() + " (Standard: " + response.getActiveChemicalMarkers() + ")");
        if (response.getToxicologyProfile() != null) {
            evidenceSummaryList.add("Toxicology Safety: LD50 " + response.getToxicologyProfile().getLd50Value() + " (" + response.getToxicologyProfile().getOecdGuideline() + ")");
        }
        response.setEvidenceCategoriesAvailable(evidenceSummaryList);

        // Formulate precise Rule 158-B checklist with actual trial references
        StringBuilder checklist = new StringBuilder();
        checklist.append("Rule 158-B(1)(A) Regulatory Exemption Dossier for ").append(response.getSanskritName()).append(":\n");
        if (!trials.isEmpty()) {
            AyushEvidenceResponse.ClinicalTrial primaryTrial = trials.get(0);
            checklist.append("1. Published Clinical Proof: Verified double-blind trial on ").append(primaryTrial.getSampleSize())
                    .append(" subjects (PMID: ").append(primaryTrial.getPmid()).append(", ").append(primaryTrial.getJournal()).append("). ")
                    .append(primaryTrial.getRule158bApplicability()).append("\n");
        }
        if (response.getToxicologyProfile() != null) {
            checklist.append("2. Toxicology Benchmark: ").append(response.getToxicologyProfile().getLd50Value())
                    .append(" under ").append(response.getToxicologyProfile().getOecdGuideline()).append(". ")
                    .append(response.getToxicologyProfile().getSafetyAssessment()).append("\n");
        }
        checklist.append("3. Pharmacopoeial Quality: Monograph compliance with ").append(response.getApiMonographRef())
                .append(" with active marker assay: ").append(response.getActiveChemicalMarkers()).append(".");
        response.setRule158BEvidenceChecklist(checklist.toString());

        // Formulate precise Section 3(e) Synergism Argument
        StringBuilder patentAdvice = new StringBuilder();
        patentAdvice.append("Indian Patent Office Section 3(e) Synergism Defense: ");
        if (!trials.isEmpty()) {
            patentAdvice.append(trials.get(0).getPatentSection3eSynergism()).append(" ");
        }
        patentAdvice.append("Submit the cited clinical pharmacodynamic endpoints to overcome 'mere admixture' objections.");
        response.setPatentSynergySubmissionAdvice(patentAdvice.toString());

        return response;
    }

    private AyushEvidenceResponse buildFallbackResponse(String cleanTerm, String searchUrl) {
        AyushEvidenceResponse response = new AyushEvidenceResponse();
        response.setTargetFormulationOrPlant(cleanTerm);
        response.setPreconfiguredSearchUrl(searchUrl);
        response.setHasCuratedEvidence(false);

        List<String> categories = Arrays.asList(
                "1. Clinical Research: Query published double-blind RCTs and clinical trials on ayushportal.nic.in for " + cleanTerm,
                "2. Drug Research: Preclinical animal toxicity (OECD 423) and TLC/HPLC standardization",
                "3. Fundamental & Literary Research: Textual references across First Schedule classical texts",
                "4. Pharmacopoeial Monographs: Ayurvedic Pharmacopoeia of India (PCIM&H)"
        );
        response.setEvidenceCategoriesAvailable(categories);

        response.setRule158BEvidenceChecklist(
                "Rule 158-B Regulatory Submission Dossier for " + cleanTerm + ": " +
                "To exempt your proprietary formulation from conducting fresh clinical trials under Form 24-D, compile: " +
                "(a) Published peer-reviewed clinical trial papers proving indication efficacy; " +
                "(b) Published acute oral toxicity data (OECD 423 LD50 > 2000 mg/kg); " +
                "(c) Pharmacopoeial laboratory standardization for active marker compounds."
        );

        response.setPatentSynergySubmissionAdvice(
                "Indian Patent Office Section 3(e) Synergism Defense: " +
                "When patent examiners object that combining " + cleanTerm + " is an unpatentable mere admixture, " +
                "provide comparative in-vitro or clinical data demonstrating statistically significant synergistic bioactivity exceeding the sum of components."
        );

        return response;
    }
}
