package com.ayurveda.ipr.portal.model;

import java.util.List;

/**
 * Encapsulates clinical and pharmacological evidence mapping for the
 * Ministry of AYUSH Research Portal (ayushportal.nic.in) to satisfy Rule 158-B.
 */
public class AyushEvidenceResponse {

    private String targetFormulationOrPlant;
    private String ayushSystem = "Ayurveda";
    private String officialPortalUrl = "https://ayushportal.nic.in/";
    private String preconfiguredSearchUrl;
    private List<String> evidenceCategoriesAvailable;
    private String rule158BEvidenceChecklist;
    private String patentSynergySubmissionAdvice; // Section 3(e) defense

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

    // Getters and Setters
    public String getTargetFormulationOrPlant() {
        return targetFormulationOrPlant;
    }

    public void setTargetFormulationOrPlant(String targetFormulationOrPlant) {
        this.targetFormulationOrPlant = targetFormulationOrPlant;
    }

    public String getAyushSystem() {
        return ayushSystem;
    }

    public void setAyushSystem(String ayushSystem) {
        this.ayushSystem = ayushSystem;
    }

    public String getOfficialPortalUrl() {
        return officialPortalUrl;
    }

    public void setOfficialPortalUrl(String officialPortalUrl) {
        this.officialPortalUrl = officialPortalUrl;
    }

    public String getPreconfiguredSearchUrl() {
        return preconfiguredSearchUrl;
    }

    public void setPreconfiguredSearchUrl(String preconfiguredSearchUrl) {
        this.preconfiguredSearchUrl = preconfiguredSearchUrl;
    }

    public List<String> getEvidenceCategoriesAvailable() {
        return evidenceCategoriesAvailable;
    }

    public void setEvidenceCategoriesAvailable(List<String> evidenceCategoriesAvailable) {
        this.evidenceCategoriesAvailable = evidenceCategoriesAvailable;
    }

    public String getRule158BEvidenceChecklist() {
        return rule158BEvidenceChecklist;
    }

    public void setRule158BEvidenceChecklist(String rule158BEvidenceChecklist) {
        this.rule158BEvidenceChecklist = rule158BEvidenceChecklist;
    }

    public String getPatentSynergySubmissionAdvice() {
        return patentSynergySubmissionAdvice;
    }

    public void setPatentSynergySubmissionAdvice(String patentSynergySubmissionAdvice) {
        this.patentSynergySubmissionAdvice = patentSynergySubmissionAdvice;
    }
}
