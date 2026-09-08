package com.ayurveda.ipr.portal.model;

/**
 * Encapsulates pre-configured international patent search deep-links
 * and WIPO GRATK Treaty 2024 disclosure guidance for WIPO PATENTSCOPE.
 */
public class WipoQueryResponse {

    private String botanicalOrQueryTerm;
    private String matchedIpcSubclass;    // e.g. A61K 36/00
    private String wipoPatentscopeDeepLink; // 1-click executable URL
    private String booleanQueryExpression;  // IC:A61K36/81 AND (TITLE:"Withania" OR ABSTRACT:"Ashwagandha")
    private String gratkDisclosureGuidance;  // WIPO GRATK Treaty 2024 mandatory disclosure rule
    private int totalEstimatedGlobalDocuments = 129000000;

    public WipoQueryResponse() {
    }

    public WipoQueryResponse(String botanicalOrQueryTerm, String matchedIpcSubclass, 
                             String wipoPatentscopeDeepLink, String booleanQueryExpression, 
                             String gratkDisclosureGuidance) {
        this.botanicalOrQueryTerm = botanicalOrQueryTerm;
        this.matchedIpcSubclass = matchedIpcSubclass;
        this.wipoPatentscopeDeepLink = wipoPatentscopeDeepLink;
        this.booleanQueryExpression = booleanQueryExpression;
        this.gratkDisclosureGuidance = gratkDisclosureGuidance;
    }

    // Getters and Setters
    public String getBotanicalOrQueryTerm() {
        return botanicalOrQueryTerm;
    }

    public void setBotanicalOrQueryTerm(String botanicalOrQueryTerm) {
        this.botanicalOrQueryTerm = botanicalOrQueryTerm;
    }

    public String getMatchedIpcSubclass() {
        return matchedIpcSubclass;
    }

    public void setMatchedIpcSubclass(String matchedIpcSubclass) {
        this.matchedIpcSubclass = matchedIpcSubclass;
    }

    public String getWipoPatentscopeDeepLink() {
        return wipoPatentscopeDeepLink;
    }

    public void setWipoPatentscopeDeepLink(String wipoPatentscopeDeepLink) {
        this.wipoPatentscopeDeepLink = wipoPatentscopeDeepLink;
    }

    public String getBooleanQueryExpression() {
        return booleanQueryExpression;
    }

    public void setBooleanQueryExpression(String booleanQueryExpression) {
        this.booleanQueryExpression = booleanQueryExpression;
    }

    public String getGratkDisclosureGuidance() {
        return gratkDisclosureGuidance;
    }

    public void setGratkDisclosureGuidance(String gratkDisclosureGuidance) {
        this.gratkDisclosureGuidance = gratkDisclosureGuidance;
    }

    public int getTotalEstimatedGlobalDocuments() {
        return totalEstimatedGlobalDocuments;
    }

    public void setTotalEstimatedGlobalDocuments(int totalEstimatedGlobalDocuments) {
        this.totalEstimatedGlobalDocuments = totalEstimatedGlobalDocuments;
    }
}
