package com.ayurveda.ipr.portal.model;

import java.util.List;

/**
 * Encapsulates pre-formulated Boolean search queries and legal search parameters
 * for the Indian Patent Advanced Search System (InPASS / IP India).
 */
public class InpassQueryResponse {

    private String botanicalOrFormulationName;
    private String matchedIpcClass;       // e.g. A61K 36/81 (Withania), A61K 36/9066 (Curcuma)
    private String inpassBooleanQuery;     // Formatted query: ((IPC: A61K 36/81) AND (Abstract: "Withania somnifera" OR "Ashwagandha"))
    private String alternativeTitleQuery; // (Title: "Ashwagandha" OR "Withania")
    private String officialPortalUrl = "https://ipindiaservices.gov.in/publicsearch";
    private List<String> searchTabsToUse;
    private String preGrantOppositionGuidance; // Section 25(1) Patents Act

    public InpassQueryResponse() {
    }

    public InpassQueryResponse(String botanicalOrFormulationName, String matchedIpcClass, 
                               String inpassBooleanQuery, String alternativeTitleQuery, 
                               List<String> searchTabsToUse, String preGrantOppositionGuidance) {
        this.botanicalOrFormulationName = botanicalOrFormulationName;
        this.matchedIpcClass = matchedIpcClass;
        this.inpassBooleanQuery = inpassBooleanQuery;
        this.alternativeTitleQuery = alternativeTitleQuery;
        this.searchTabsToUse = searchTabsToUse;
        this.preGrantOppositionGuidance = preGrantOppositionGuidance;
    }

    // Getters and Setters
    public String getBotanicalOrFormulationName() {
        return botanicalOrFormulationName;
    }

    public void setBotanicalOrFormulationName(String botanicalOrFormulationName) {
        this.botanicalOrFormulationName = botanicalOrFormulationName;
    }

    public String getMatchedIpcClass() {
        return matchedIpcClass;
    }

    public void setMatchedIpcClass(String matchedIpcClass) {
        this.matchedIpcClass = matchedIpcClass;
    }

    public String getInpassBooleanQuery() {
        return inpassBooleanQuery;
    }

    public void setInpassBooleanQuery(String inpassBooleanQuery) {
        this.inpassBooleanQuery = inpassBooleanQuery;
    }

    public String getAlternativeTitleQuery() {
        return alternativeTitleQuery;
    }

    public void setAlternativeTitleQuery(String alternativeTitleQuery) {
        this.alternativeTitleQuery = alternativeTitleQuery;
    }

    public String getOfficialPortalUrl() {
        return officialPortalUrl;
    }

    public void setOfficialPortalUrl(String officialPortalUrl) {
        this.officialPortalUrl = officialPortalUrl;
    }

    public List<String> getSearchTabsToUse() {
        return searchTabsToUse;
    }

    public void setSearchTabsToUse(List<String> searchTabsToUse) {
        this.searchTabsToUse = searchTabsToUse;
    }

    public String getPreGrantOppositionGuidance() {
        return preGrantOppositionGuidance;
    }

    public void setPreGrantOppositionGuidance(String preGrantOppositionGuidance) {
        this.preGrantOppositionGuidance = preGrantOppositionGuidance;
    }
}
