package com.ayurveda.ipr.portal.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates clinical, pharmacological, toxicological, and pharmacopoeial evidence
 * mapping for the Ministry of AYUSH Research Portal (ayushportal.nic.in) and
 * Ayurvedic Pharmacopoeia of India (API) to satisfy Rule 158-B and Section 3(e).
 */
public class AyushEvidenceResponse {

    private String targetFormulationOrPlant;
    private String ayushSystem = "Ayurveda";
    private String officialPortalUrl = "https://ayushportal.nic.in/";
    private String preconfiguredSearchUrl;
    private List<String> evidenceCategoriesAvailable;
    private String rule158BEvidenceChecklist;
    private String patentSynergySubmissionAdvice; // Section 3(e) defense

    // Curated empirical evidence fields
    private boolean hasCuratedEvidence = false;
    private String botanicalBinomial;
    private String sanskritName;
    private List<String> commonNames = new ArrayList<>();
    private String family;
    private String partUsed;
    private String apiMonographRef;
    private String activeChemicalMarkers;
    private List<String> therapeuticUses = new ArrayList<>();
    private ToxicologyData toxicologyProfile;
    private List<ClinicalTrial> publishedClinicalTrials = new ArrayList<>();

    public AyushEvidenceResponse() {
    }

    public AyushEvidenceResponse(String targetFormulationOrPlant, String preconfiguredSearchUrl, 
                                 List<String> evidenceCategoriesAvailable, String rule158BEvidenceChecklist, 
                                 String patentSynergySubmissionAdvice) {
        this.targetFormulationOrPlant = targetFormulationOrPlant;
        this.preconfiguredSearchUrl = preconfiguredSearchUrl;
        this.evidenceCategoriesAvailable = evidenceCategoriesAvailable;
        this.rule158BEvidenceChecklist = rule158BEvidenceChecklist;
        this.patentSynergySubmissionAdvice = patentSynergySubmissionAdvice;
    }

    // Inner class for verified toxicology benchmarks
    public static class ToxicologyData {
        private String oecdGuideline;
        private String ld50Value;
        private String noael;
        private String heavyMetalCompliance;
        private String safetyAssessment;

        public ToxicologyData() {}

        public ToxicologyData(String oecdGuideline, String ld50Value, String noael, String heavyMetalCompliance, String safetyAssessment) {
            this.oecdGuideline = oecdGuideline;
            this.ld50Value = ld50Value;
            this.noael = noael;
            this.heavyMetalCompliance = heavyMetalCompliance;
            this.safetyAssessment = safetyAssessment;
        }

        public String getOecdGuideline() { return oecdGuideline; }
        public void setOecdGuideline(String oecdGuideline) { this.oecdGuideline = oecdGuideline; }
        public String getLd50Value() { return ld50Value; }
        public void setLd50Value(String ld50Value) { this.ld50Value = ld50Value; }
        public String getNoael() { return noael; }
        public void setNoael(String noael) { this.noael = noael; }
        public String getHeavyMetalCompliance() { return heavyMetalCompliance; }
        public void setHeavyMetalCompliance(String heavyMetalCompliance) { this.heavyMetalCompliance = heavyMetalCompliance; }
        public String getSafetyAssessment() { return safetyAssessment; }
        public void setSafetyAssessment(String safetyAssessment) { this.safetyAssessment = safetyAssessment; }
    }

    // Inner class for published human clinical trials
    public static class ClinicalTrial {
        private String pmid;
        private String ctriId;
        private String title;
        private String authors;
        private String journal;
        private int year;
        private int sampleSize;
        private String studyDesign;
        private String dosageRegimen;
        private String primaryOutcomes;
        private String pubmedUrl;
        private String rule158bApplicability;
        private String patentSection3eSynergism;

        public ClinicalTrial() {}

        public String getPmid() { return pmid; }
        public void setPmid(String pmid) { this.pmid = pmid; }
        public String getCtriId() { return ctriId; }
        public void setCtriId(String ctriId) { this.ctriId = ctriId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthors() { return authors; }
        public void setAuthors(String authors) { this.authors = authors; }
        public String getJournal() { return journal; }
        public void setJournal(String journal) { this.journal = journal; }
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        public int getSampleSize() { return sampleSize; }
        public void setSampleSize(int sampleSize) { this.sampleSize = sampleSize; }
        public String getStudyDesign() { return studyDesign; }
        public void setStudyDesign(String studyDesign) { this.studyDesign = studyDesign; }
        public String getDosageRegimen() { return dosageRegimen; }
        public void setDosageRegimen(String dosageRegimen) { this.dosageRegimen = dosageRegimen; }
        public String getPrimaryOutcomes() { return primaryOutcomes; }
        public void setPrimaryOutcomes(String primaryOutcomes) { this.primaryOutcomes = primaryOutcomes; }
        public String getPubmedUrl() { return pubmedUrl; }
        public void setPubmedUrl(String pubmedUrl) { this.pubmedUrl = pubmedUrl; }
        public String getRule158bApplicability() { return rule158bApplicability; }
        public void setRule158bApplicability(String rule158bApplicability) { this.rule158bApplicability = rule158bApplicability; }
        public String getPatentSection3eSynergism() { return patentSection3eSynergism; }
        public void setPatentSection3eSynergism(String patentSection3eSynergism) { this.patentSection3eSynergism = patentSection3eSynergism; }
    }

    // Getters and Setters
    public String getTargetFormulationOrPlant() { return targetFormulationOrPlant; }
    public void setTargetFormulationOrPlant(String targetFormulationOrPlant) { this.targetFormulationOrPlant = targetFormulationOrPlant; }
    public String getAyushSystem() { return ayushSystem; }
    public void setAyushSystem(String ayushSystem) { this.ayushSystem = ayushSystem; }
    public String getOfficialPortalUrl() { return officialPortalUrl; }
    public void setOfficialPortalUrl(String officialPortalUrl) { this.officialPortalUrl = officialPortalUrl; }
    public String getPreconfiguredSearchUrl() { return preconfiguredSearchUrl; }
    public void setPreconfiguredSearchUrl(String preconfiguredSearchUrl) { this.preconfiguredSearchUrl = preconfiguredSearchUrl; }
    public List<String> getEvidenceCategoriesAvailable() { return evidenceCategoriesAvailable; }
    public void setEvidenceCategoriesAvailable(List<String> evidenceCategoriesAvailable) { this.evidenceCategoriesAvailable = evidenceCategoriesAvailable; }
    public String getRule158BEvidenceChecklist() { return rule158BEvidenceChecklist; }
    public void setRule158BEvidenceChecklist(String rule158BEvidenceChecklist) { this.rule158BEvidenceChecklist = rule158BEvidenceChecklist; }
    public String getPatentSynergySubmissionAdvice() { return patentSynergySubmissionAdvice; }
    public void setPatentSynergySubmissionAdvice(String patentSynergySubmissionAdvice) { this.patentSynergySubmissionAdvice = patentSynergySubmissionAdvice; }
    public boolean isHasCuratedEvidence() { return hasCuratedEvidence; }
    public void setHasCuratedEvidence(boolean hasCuratedEvidence) { this.hasCuratedEvidence = hasCuratedEvidence; }
    public String getBotanicalBinomial() { return botanicalBinomial; }
    public void setBotanicalBinomial(String botanicalBinomial) { this.botanicalBinomial = botanicalBinomial; }
    public String getSanskritName() { return sanskritName; }
    public void setSanskritName(String sanskritName) { this.sanskritName = sanskritName; }
    public List<String> getCommonNames() { return commonNames; }
    public void setCommonNames(List<String> commonNames) { this.commonNames = commonNames; }
    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }
    public String getPartUsed() { return partUsed; }
    public void setPartUsed(String partUsed) { this.partUsed = partUsed; }
    public String getApiMonographRef() { return apiMonographRef; }
    public void setApiMonographRef(String apiMonographRef) { this.apiMonographRef = apiMonographRef; }
    public String getActiveChemicalMarkers() { return activeChemicalMarkers; }
    public void setActiveChemicalMarkers(String activeChemicalMarkers) { this.activeChemicalMarkers = activeChemicalMarkers; }
    public List<String> getTherapeuticUses() { return therapeuticUses; }
    public void setTherapeuticUses(List<String> therapeuticUses) { this.therapeuticUses = therapeuticUses; }
    public ToxicologyData getToxicologyProfile() { return toxicologyProfile; }
    public void setToxicologyProfile(ToxicologyData toxicologyProfile) { this.toxicologyProfile = toxicologyProfile; }
    public List<ClinicalTrial> getPublishedClinicalTrials() { return publishedClinicalTrials; }
    public void setPublishedClinicalTrials(List<ClinicalTrial> publishedClinicalTrials) { this.publishedClinicalTrials = publishedClinicalTrials; }
}
