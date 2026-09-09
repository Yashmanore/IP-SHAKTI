package com.ayurveda.ipr.document.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;
import java.util.List;

/**
 * Complete structured document & query profile extracted by the unified Gemini LLM engine.
 * Contains applicant credentials, product details, and full statutory IPR assessment.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExtractedDocumentProfile {

    // Metadata
    private String fileName;
    private String fileType;
    private long fileSizeBytes;
    private String sourceMode;

    // Core Structured Sections
    private ApplicantCredentials applicantCredentials = new ApplicantCredentials();
    private ProductDetails productDetails = new ProductDetails();
    private PatentabilityAndStatutoryAnalysis patentabilityAndStatutoryAnalysis = new PatentabilityAndStatutoryAnalysis();

    public ExtractedDocumentProfile() {
    }

    public ExtractedDocumentProfile(String fileName, String fileType, long fileSizeBytes) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSizeBytes = fileSizeBytes;
    }

    // --- Backward Compatibility Helper Getters & Setters ---
    public String getDocumentTitle() {
        return productDetails != null ? productDetails.getDocumentTitle() : null;
    }

    public void setDocumentTitle(String documentTitle) {
        if (this.productDetails == null) this.productDetails = new ProductDetails();
        this.productDetails.setDocumentTitle(documentTitle);
    }

    public String getProductName() {
        return productDetails != null ? productDetails.getProductName() : null;
    }

    public void setProductName(String productName) {
        if (this.productDetails == null) this.productDetails = new ProductDetails();
        this.productDetails.setProductName(productName);
    }

    public List<String> getBotanicalBinomials() {
        return productDetails != null ? productDetails.getBotanicalBinomials() : new ArrayList<>();
    }

    public void setBotanicalBinomials(List<String> botanicalBinomials) {
        if (this.productDetails == null) this.productDetails = new ProductDetails();
        this.productDetails.setBotanicalBinomials(botanicalBinomials);
    }

    public String getTechnicalNovelty() {
        return patentabilityAndStatutoryAnalysis != null ? patentabilityAndStatutoryAnalysis.getTechnicalNovelty() : null;
    }

    public void setTechnicalNovelty(String technicalNovelty) {
        if (this.patentabilityAndStatutoryAnalysis == null) this.patentabilityAndStatutoryAnalysis = new PatentabilityAndStatutoryAnalysis();
        this.patentabilityAndStatutoryAnalysis.setTechnicalNovelty(technicalNovelty);
    }

    public String getIsClassical() {
        if (patentabilityAndStatutoryAnalysis == null) return "NO";
        return Boolean.TRUE.equals(patentabilityAndStatutoryAnalysis.getIsClassicalScriptureRecipe()) ? "YES" : "NO";
    }

    public void setIsClassical(String isClassical) {
        if (this.patentabilityAndStatutoryAnalysis == null) this.patentabilityAndStatutoryAnalysis = new PatentabilityAndStatutoryAnalysis();
        this.patentabilityAndStatutoryAnalysis.setIsClassicalScriptureRecipe("YES".equalsIgnoreCase(isClassical));
    }

    public String getIntendedUse() {
        return productDetails != null ? productDetails.getRegulatoryCategory() : null;
    }

    public void setIntendedUse(String intendedUse) {
        if (this.productDetails == null) this.productDetails = new ProductDetails();
        this.productDetails.setRegulatoryCategory(intendedUse);
    }

    public String getSummarySynopsis() {
        if (patentabilityAndStatutoryAnalysis != null && patentabilityAndStatutoryAnalysis.getTechnicalNovelty() != null) {
            return patentabilityAndStatutoryAnalysis.getTechnicalNovelty();
        }
        return getProductName();
    }

    public void setSummarySynopsis(String summarySynopsis) {
        if (this.patentabilityAndStatutoryAnalysis == null) this.patentabilityAndStatutoryAnalysis = new PatentabilityAndStatutoryAnalysis();
        if (this.patentabilityAndStatutoryAnalysis.getTechnicalNovelty() == null) {
            this.patentabilityAndStatutoryAnalysis.setTechnicalNovelty(summarySynopsis);
        }
    }

    public String getKeyClaimsExtracted() {
        if (patentabilityAndStatutoryAnalysis != null && patentabilityAndStatutoryAnalysis.getClaimsSummary() != null) {
            return patentabilityAndStatutoryAnalysis.getClaimsSummary().toString();
        }
        return null;
    }

    public void setKeyClaimsExtracted(String keyClaimsExtracted) {
        // no-op for backward compatibility
    }

    // --- Standard Getters & Setters ---
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getSourceMode() {
        return sourceMode;
    }

    public void setSourceMode(String sourceMode) {
        this.sourceMode = sourceMode;
    }

    public ApplicantCredentials getApplicantCredentials() {
        return applicantCredentials;
    }

    public void setApplicantCredentials(ApplicantCredentials applicantCredentials) {
        this.applicantCredentials = applicantCredentials;
    }

    public ProductDetails getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(ProductDetails productDetails) {
        this.productDetails = productDetails;
    }

    public PatentabilityAndStatutoryAnalysis getPatentabilityAndStatutoryAnalysis() {
        return patentabilityAndStatutoryAnalysis;
    }

    public void setPatentabilityAndStatutoryAnalysis(PatentabilityAndStatutoryAnalysis patentabilityAndStatutoryAnalysis) {
        this.patentabilityAndStatutoryAnalysis = patentabilityAndStatutoryAnalysis;
    }

    // =========================================================================
    // INNER CLASSES (MATCHING UNIFIED SCHEMA)
    // =========================================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ApplicantCredentials {
        private String applicantName;
        private String aadhaarNumber;
        private String panNumber;
        private String phoneNumber;
        private String emailAddress;
        private String locationOrAddress;

        public ApplicantCredentials() {}

        public String getApplicantName() { return applicantName; }
        public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

        public String getAadhaarNumber() { return aadhaarNumber; }
        public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

        public String getPanNumber() { return panNumber; }
        public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getEmailAddress() { return emailAddress; }
        public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }

        public String getLocationOrAddress() { return locationOrAddress; }
        public void setLocationOrAddress(String locationOrAddress) { this.locationOrAddress = locationOrAddress; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProductDetails {
        private String documentTitle;
        private String productName;
        private List<String> botanicalBinomials = new ArrayList<>();
        private String regulatoryCategory;
        private String governingActAndRules;
        private String licensingAuthority;

        public ProductDetails() {}

        public String getDocumentTitle() { return documentTitle; }
        public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public List<String> getBotanicalBinomials() { return botanicalBinomials; }
        public void setBotanicalBinomials(List<String> botanicalBinomials) { this.botanicalBinomials = botanicalBinomials; }

        public String getRegulatoryCategory() { return regulatoryCategory; }
        public void setRegulatoryCategory(String regulatoryCategory) { this.regulatoryCategory = regulatoryCategory; }

        public String getGoverningActAndRules() { return governingActAndRules; }
        public void setGoverningActAndRules(String governingActAndRules) { this.governingActAndRules = governingActAndRules; }

        public String getLicensingAuthority() { return licensingAuthority; }
        public void setLicensingAuthority(String licensingAuthority) { this.licensingAuthority = licensingAuthority; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PatentabilityAndStatutoryAnalysis {
        private String technicalNovelty;
        private Boolean isClassicalScriptureRecipe;
        private Section3pAnalysis section3pTraditionalKnowledgeBar = new Section3pAnalysis();
        private SynergismAnalysis synergismOrEfficacy = new SynergismAnalysis();
        private String biodiversityActRequirement;
        private String clinicalTrialObligations;
        private List<ClaimSummaryItem> claimsSummary = new ArrayList<>();
        private List<String> immediateNextSteps = new ArrayList<>();

        public PatentabilityAndStatutoryAnalysis() {}

        public String getTechnicalNovelty() { return technicalNovelty; }
        public void setTechnicalNovelty(String technicalNovelty) { this.technicalNovelty = technicalNovelty; }

        public Boolean getIsClassicalScriptureRecipe() { return isClassicalScriptureRecipe; }
        public void setIsClassicalScriptureRecipe(Boolean isClassicalScriptureRecipe) { this.isClassicalScriptureRecipe = isClassicalScriptureRecipe; }

        public Section3pAnalysis getSection3pTraditionalKnowledgeBar() { return section3pTraditionalKnowledgeBar; }
        public void setSection3pTraditionalKnowledgeBar(Section3pAnalysis section3pTraditionalKnowledgeBar) { this.section3pTraditionalKnowledgeBar = section3pTraditionalKnowledgeBar; }

        public SynergismAnalysis getSynergismOrEfficacy() { return synergismOrEfficacy; }
        public void setSynergismOrEfficacy(SynergismAnalysis synergismOrEfficacy) { this.synergismOrEfficacy = synergismOrEfficacy; }

        public String getBiodiversityActRequirement() { return biodiversityActRequirement; }
        public void setBiodiversityActRequirement(String biodiversityActRequirement) { this.biodiversityActRequirement = biodiversityActRequirement; }

        public String getClinicalTrialObligations() { return clinicalTrialObligations; }
        public void setClinicalTrialObligations(String clinicalTrialObligations) { this.clinicalTrialObligations = clinicalTrialObligations; }

        public List<ClaimSummaryItem> getClaimsSummary() { return claimsSummary; }
        public void setClaimsSummary(List<ClaimSummaryItem> claimsSummary) { this.claimsSummary = claimsSummary; }

        public List<String> getImmediateNextSteps() { return immediateNextSteps; }
        public void setImmediateNextSteps(List<String> immediateNextSteps) { this.immediateNextSteps = immediateNextSteps; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Section3pAnalysis {
        private Boolean isBarred;
        private String rationale;

        public Section3pAnalysis() {}

        public Boolean getIsBarred() { return isBarred; }
        public void setIsBarred(Boolean isBarred) { this.isBarred = isBarred; }

        public String getRationale() { return rationale; }
        public void setRationale(String rationale) { this.rationale = rationale; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SynergismAnalysis {
        private Boolean proven;
        private String evidence;

        public SynergismAnalysis() {}

        public Boolean getProven() { return proven; }
        public void setProven(Boolean proven) { this.proven = proven; }

        public String getEvidence() { return evidence; }
        public void setEvidence(String evidence) { this.evidence = evidence; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ClaimSummaryItem {
        private Integer claimNumber;
        private String type;
        private String summary;

        public ClaimSummaryItem() {}

        public Integer getClaimNumber() { return claimNumber; }
        public void setClaimNumber(Integer claimNumber) { this.claimNumber = claimNumber; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }
}
