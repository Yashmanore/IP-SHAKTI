package com.ayurveda.ipr.classifier.model;

import java.util.List;

public class ClassificationResult {

    private ProductCategory category;
    private String categoryDisplayName;
    private String governingAct;
    private String licensingAuthority;

    // Regulatory & Clinical Requirements
    private String licensingProcedure;
    private String clinicalTrialRequirement;
    private List<String> mandatoryLabelDisclaimers;

    // IPR & Patentability Guidance
    private boolean formulationPatentableInIndia;
    private String patentabilityVerdict;
    private List<String> relevantPatentSections; // e.g. ["Section 3(p)", "Section 3(e)"]
    private String recommendedIprStrategy;

    // Biological Diversity Act (NBA / SBB) Guidance
    private String nbaComplianceStatus;
    private String requiredNbaForm; // e.g. "Form I (Prior Approval)" or "Section 7 Intimation"

    // Audit trail / Reasoning steps
    private List<String> decisionTrace;

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public String getGoverningAct() {
        return governingAct;
    }

    public void setGoverningAct(String governingAct) {
        this.governingAct = governingAct;
    }

    public String getLicensingAuthority() {
        return licensingAuthority;
    }

    public void setLicensingAuthority(String licensingAuthority) {
        this.licensingAuthority = licensingAuthority;
    }

    public String getLicensingProcedure() {
        return licensingProcedure;
    }

    public void setLicensingProcedure(String licensingProcedure) {
        this.licensingProcedure = licensingProcedure;
    }

    public String getClinicalTrialRequirement() {
        return clinicalTrialRequirement;
    }

    public void setClinicalTrialRequirement(String clinicalTrialRequirement) {
        this.clinicalTrialRequirement = clinicalTrialRequirement;
    }

    public List<String> getMandatoryLabelDisclaimers() {
        return mandatoryLabelDisclaimers;
    }

    public void setMandatoryLabelDisclaimers(List<String> mandatoryLabelDisclaimers) {
        this.mandatoryLabelDisclaimers = mandatoryLabelDisclaimers;
    }

    public boolean isFormulationPatentableInIndia() {
        return formulationPatentableInIndia;
    }

    public void setFormulationPatentableInIndia(boolean formulationPatentableInIndia) {
        this.formulationPatentableInIndia = formulationPatentableInIndia;
    }

    public String getPatentabilityVerdict() {
        return patentabilityVerdict;
    }

    public void setPatentabilityVerdict(String patentabilityVerdict) {
        this.patentabilityVerdict = patentabilityVerdict;
    }

    public List<String> getRelevantPatentSections() {
        return relevantPatentSections;
    }

    public void setRelevantPatentSections(List<String> relevantPatentSections) {
        this.relevantPatentSections = relevantPatentSections;
    }

    public String getRecommendedIprStrategy() {
        return recommendedIprStrategy;
    }

    public void setRecommendedIprStrategy(String recommendedIprStrategy) {
        this.recommendedIprStrategy = recommendedIprStrategy;
    }

    public String getNbaComplianceStatus() {
        return nbaComplianceStatus;
    }

    public void setNbaComplianceStatus(String nbaComplianceStatus) {
        this.nbaComplianceStatus = nbaComplianceStatus;
    }

    public String getRequiredNbaForm() {
        return requiredNbaForm;
    }

    public void setRequiredNbaForm(String requiredNbaForm) {
        this.requiredNbaForm = requiredNbaForm;
    }

    public List<String> getDecisionTrace() {
        return decisionTrace;
    }

    public void setDecisionTrace(List<String> decisionTrace) {
        this.decisionTrace = decisionTrace;
    }
}
