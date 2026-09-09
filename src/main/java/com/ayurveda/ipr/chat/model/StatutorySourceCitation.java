package com.ayurveda.ipr.chat.model;

/**
 * Clickable statutory source citation referencing exact sections in the legal PDFs / JSON datasets.
 */
public class StatutorySourceCitation {

    private String documentTitle;   // e.g. "The Patents Act, 1970"
    private String sectionReference; // e.g. "Section 3(p)"
    private String jurisdiction;    // "INDIA" or "INTERNATIONAL"
    private String snippetText;     // Text clause
    private String sourceFilePath;  // data/raw/national/statutes/Patents_Act_1970.pdf
    private double relevanceScore;
    private String officialUrl;     // e.g. https://indiacode.gov.in/act/a49ad42b-f2dc-4ee2-9884-11ef0839798d
    private String governingBody;   // e.g. "Indian Patent Office / DPIIT"
    private Integer actYear;

    public StatutorySourceCitation() {
    }

    public StatutorySourceCitation(String documentTitle, String sectionReference, String jurisdiction, 
                                    String snippetText, String sourceFilePath, double relevanceScore) {
        this.documentTitle = documentTitle;
        this.sectionReference = sectionReference;
        this.jurisdiction = jurisdiction;
        this.snippetText = snippetText;
        this.sourceFilePath = sourceFilePath;
        this.relevanceScore = relevanceScore;
    }

    public StatutorySourceCitation(String documentTitle, String sectionReference, String jurisdiction, 
                                    String snippetText, String sourceFilePath, double relevanceScore,
                                    String officialUrl, String governingBody, Integer actYear) {
        this.documentTitle = documentTitle;
        this.sectionReference = sectionReference;
        this.jurisdiction = jurisdiction;
        this.snippetText = snippetText;
        this.sourceFilePath = sourceFilePath;
        this.relevanceScore = relevanceScore;
        this.officialUrl = officialUrl;
        this.governingBody = governingBody;
        this.actYear = actYear;
    }

    public String getDocumentTitle() {
        return documentTitle;
    }

    public void setDocumentTitle(String documentTitle) {
        this.documentTitle = documentTitle;
    }

    public String getSectionReference() {
        return sectionReference;
    }

    public void setSectionReference(String sectionReference) {
        this.sectionReference = sectionReference;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public String getSnippetText() {
        return snippetText;
    }

    public void setSnippetText(String snippetText) {
        this.snippetText = snippetText;
    }

    public String getSourceFilePath() {
        return sourceFilePath;
    }

    public void setSourceFilePath(String sourceFilePath) {
        this.sourceFilePath = sourceFilePath;
    }

    public double getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getOfficialUrl() {
        return officialUrl;
    }

    public void setOfficialUrl(String officialUrl) {
        this.officialUrl = officialUrl;
    }

    public String getGoverningBody() {
        return governingBody;
    }

    public void setGoverningBody(String governingBody) {
        this.governingBody = governingBody;
    }

    public Integer getActYear() {
        return actYear;
    }

    public void setActYear(Integer actYear) {
        this.actYear = actYear;
    }
}
