package com.ayurveda.ipr.portal.model;

/**
 * Encapsulates search queries and 35 U.S.C. 101 subject-matter eligibility guidance
 * for the USPTO Patent Public Search portal (ppubs.uspto.gov).
 */
public class UsptoQueryResponse {

    private String botanicalOrQueryTerm;
    private String cpcClassification;        // e.g. A61K36/81.cpc. (Cooperative Patent Classification)
    private String usptoSearchSyntax;        // ("Withania somnifera" OR "Ashwagandha").ab. AND A61K36/81.cpc.
    private String officialPortalUrl = "https://ppubs.uspto.gov/";
    private String section101EligibilityVerdict; // Product of Nature doctrine (Myriad / Alice)
    private String recommendedClaimStrategy;

    public UsptoQueryResponse() {
    }

    public UsptoQueryResponse(String botanicalOrQueryTerm, String cpcClassification, 
                              String usptoSearchSyntax, String section101EligibilityVerdict, 
                              String recommendedClaimStrategy) {
        this.botanicalOrQueryTerm = botanicalOrQueryTerm;
        this.cpcClassification = cpcClassification;
        this.usptoSearchSyntax = usptoSearchSyntax;
        this.section101EligibilityVerdict = section101EligibilityVerdict;
        this.recommendedClaimStrategy = recommendedClaimStrategy;
    }

    // Getters and Setters
    public String getBotanicalOrQueryTerm() {
        return botanicalOrQueryTerm;
    }

    public void setBotanicalOrQueryTerm(String botanicalOrQueryTerm) {
        this.botanicalOrQueryTerm = botanicalOrQueryTerm;
    }

    public String getCpcClassification() {
        return cpcClassification;
    }

    public void setCpcClassification(String cpcClassification) {
        this.cpcClassification = cpcClassification;
    }

    public String getUsptoSearchSyntax() {
        return usptoSearchSyntax;
    }

    public void setUsptoSearchSyntax(String usptoSearchSyntax) {
        this.usptoSearchSyntax = usptoSearchSyntax;
    }

    public String getOfficialPortalUrl() {
        return officialPortalUrl;
    }

    public void setOfficialPortalUrl(String officialPortalUrl) {
        this.officialPortalUrl = officialPortalUrl;
    }

    public String getSection101EligibilityVerdict() {
        return section101EligibilityVerdict;
    }

    public void setSection101EligibilityVerdict(String section101EligibilityVerdict) {
        this.section101EligibilityVerdict = section101EligibilityVerdict;
    }

    public String getRecommendedClaimStrategy() {
        return recommendedClaimStrategy;
    }

    public void setRecommendedClaimStrategy(String recommendedClaimStrategy) {
        this.recommendedClaimStrategy = recommendedClaimStrategy;
    }
}
