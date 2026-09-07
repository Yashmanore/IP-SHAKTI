package com.ayurveda.ipr.classifier.model;

import java.util.List;

public class ClassificationRequest {

    private String productName;
    private List<String> botanicalIngredients;
    
    // 1. Authoritative Text Alignment
    private boolean matchesScheduleIBook; // True if from Charaka, Sushruta, Sharangadhara, etc.
    private String scheduleIBookName;     // e.g. "Bhavaprakasha Samhita"
    private boolean formulaOrRatioModified; // Altered composition or new excipients?

    // 2. Primary Use & Claims
    private IntendedUse intendedUse;       // THERAPEUTIC, DIETARY_SUPPLEMENT, COSMETIC
    private String claimedIndication;      // e.g. "Arthritis relief" or "Hair shine"

    // 3. Innovation Factors
    private boolean newIndicationOrDosageRoute; // e.g. oral churna converted to sublingual nano-spray
    private boolean purifiedPhytochemicalExtract; // Standardized single bioactive molecule vs whole plant extract
    private boolean synergisticDataAvailable;   // Lab data showing non-additive synergy

    // 4. Entity Profile (For NBA / Patent check)
    private EntityType applicantType;     // INDIAN_INDIVIDUAL, INDIAN_COMPANY, FOREIGN_ENTITY_OR_NRI
    private boolean commercialUtilization;

    public enum IntendedUse {
        THERAPEUTIC_TREATMENT,
        DIETARY_NUTRITION,
        COSMETIC_BEAUTY
    }

    public enum EntityType {
        INDIAN_INDIVIDUAL,
        INDIAN_COMPANY,
        FOREIGN_ENTITY_OR_NRI
    }

    // Getters and Setters
    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public List<String> getBotanicalIngredients() {
        return botanicalIngredients;
    }

    public void setBotanicalIngredients(List<String> botanicalIngredients) {
        this.botanicalIngredients = botanicalIngredients;
    }

    public boolean isMatchesScheduleIBook() {
        return matchesScheduleIBook;
    }

    public void setMatchesScheduleIBook(boolean matchesScheduleIBook) {
        this.matchesScheduleIBook = matchesScheduleIBook;
    }

    public String getScheduleIBookName() {
        return scheduleIBookName;
    }

    public void setScheduleIBookName(String scheduleIBookName) {
        this.scheduleIBookName = scheduleIBookName;
    }

    public boolean isFormulaOrRatioModified() {
        return formulaOrRatioModified;
    }

    public void setFormulaOrRatioModified(boolean formulaOrRatioModified) {
        this.formulaOrRatioModified = formulaOrRatioModified;
    }

    public IntendedUse getIntendedUse() {
        return intendedUse;
    }

    public void setIntendedUse(IntendedUse intendedUse) {
        this.intendedUse = intendedUse;
    }

    public String getClaimedIndication() {
        return claimedIndication;
    }

    public void setClaimedIndication(String claimedIndication) {
        this.claimedIndication = claimedIndication;
    }

    public boolean isNewIndicationOrDosageRoute() {
        return newIndicationOrDosageRoute;
    }

    public void setNewIndicationOrDosageRoute(boolean newIndicationOrDosageRoute) {
        this.newIndicationOrDosageRoute = newIndicationOrDosageRoute;
    }

    public boolean isPurifiedPhytochemicalExtract() {
        return purifiedPhytochemicalExtract;
    }

    public void setPurifiedPhytochemicalExtract(boolean purifiedPhytochemicalExtract) {
        this.purifiedPhytochemicalExtract = purifiedPhytochemicalExtract;
    }

    public boolean isSynergisticDataAvailable() {
        return synergisticDataAvailable;
    }

    public void setSynergisticDataAvailable(boolean synergisticDataAvailable) {
        this.synergisticDataAvailable = synergisticDataAvailable;
    }

    public EntityType getApplicantType() {
        return applicantType;
    }

    public void setApplicantType(EntityType applicantType) {
        this.applicantType = applicantType;
    }

    public boolean isCommercialUtilization() {
        return commercialUtilization;
    }

    public void setCommercialUtilization(boolean commercialUtilization) {
        this.commercialUtilization = commercialUtilization;
    }
}
