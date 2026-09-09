package com.ayurveda.ipr.chat.model;

/**
 * Trademark & Brand Protection Guidance under Trade Marks Act 1999 and Nice Classification:
 * - Class 5: Ayurvedic pharmaceuticals, herbal extracts, and medicinal preparations.
 * - Class 3: Ayurvedic cosmetics, herbal soaps, and skincare.
 * - Class 30: Ayurveda Aahar, herbal infusions, and food supplements.
 * - Class 44: Ayurvedic healthcare, panchakarma clinics, and traditional wellness services.
 */
public class TrademarkGuidance {

    private String recommendedNiceClass;
    private String houseMarkStrategy;
    private String classicalNameBarWarning;
    private String giRelevance;

    public TrademarkGuidance() {
    }

    public TrademarkGuidance(String recommendedNiceClass, String houseMarkStrategy, 
                             String classicalNameBarWarning, String giRelevance) {
        this.recommendedNiceClass = recommendedNiceClass;
        this.houseMarkStrategy = houseMarkStrategy;
        this.classicalNameBarWarning = classicalNameBarWarning;
        this.giRelevance = giRelevance;
    }

    public String getRecommendedNiceClass() {
        return recommendedNiceClass;
    }

    public void setRecommendedNiceClass(String recommendedNiceClass) {
        this.recommendedNiceClass = recommendedNiceClass;
    }

    public String getHouseMarkStrategy() {
        return houseMarkStrategy;
    }

    public void setHouseMarkStrategy(String houseMarkStrategy) {
        this.houseMarkStrategy = houseMarkStrategy;
    }

    public String getClassicalNameBarWarning() {
        return classicalNameBarWarning;
    }

    public void setClassicalNameBarWarning(String classicalNameBarWarning) {
        this.classicalNameBarWarning = classicalNameBarWarning;
    }

    public String getGiRelevance() {
        return giRelevance;
    }

    public void setGiRelevance(String giRelevance) {
        this.giRelevance = giRelevance;
    }
}
