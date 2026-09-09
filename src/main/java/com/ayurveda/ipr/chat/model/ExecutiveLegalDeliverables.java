package com.ayurveda.ipr.chat.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Generative LLM Deliverables generated via Gemini Flash & LangChain4j:
 * 1. Executive Legal Brief for IP attorneys & regulatory affairs.
 * 2. Plain-Language Summary for local Ayurvedic vaidyas, MSMEs, and cultivators.
 * 3. Draft Patent Claims structured to bypass Section 3(p) and Section 3(e).
 */
public class ExecutiveLegalDeliverables {

    private ExecutiveSummary executiveSummary;
    private PlainLanguageSummary plainLanguageSummary;
    private DraftClaimsPackage draftPatentClaims;

    public ExecutiveLegalDeliverables() {
    }

    public ExecutiveLegalDeliverables(ExecutiveSummary executiveSummary, 
                                      PlainLanguageSummary plainLanguageSummary, 
                                      DraftClaimsPackage draftPatentClaims) {
        this.executiveSummary = executiveSummary;
        this.plainLanguageSummary = plainLanguageSummary;
        this.draftPatentClaims = draftPatentClaims;
    }

    public ExecutiveSummary getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(ExecutiveSummary executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public PlainLanguageSummary getPlainLanguageSummary() {
        return plainLanguageSummary;
    }

    public void setPlainLanguageSummary(PlainLanguageSummary plainLanguageSummary) {
        this.plainLanguageSummary = plainLanguageSummary;
    }

    public DraftClaimsPackage getDraftPatentClaims() {
        return draftPatentClaims;
    }

    public void setDraftPatentClaims(DraftClaimsPackage draftPatentClaims) {
        this.draftPatentClaims = draftPatentClaims;
    }

    // --- Inner DTOs ---

    public static class ExecutiveSummary {
        private String caseTitle;
        private int overallPatentabilityScore; // 0-100
        private String riskLevel;               // "LOW", "MEDIUM", "HIGH"
        private String primaryStatutoryHurdle;
        private String primaryDefensiveStrategy;

        public ExecutiveSummary() {}

        public ExecutiveSummary(String caseTitle, int overallPatentabilityScore, String riskLevel, 
                                String primaryStatutoryHurdle, String primaryDefensiveStrategy) {
            this.caseTitle = caseTitle;
            this.overallPatentabilityScore = overallPatentabilityScore;
            this.riskLevel = riskLevel;
            this.primaryStatutoryHurdle = primaryStatutoryHurdle;
            this.primaryDefensiveStrategy = primaryDefensiveStrategy;
        }

        public String getCaseTitle() { return caseTitle; }
        public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }

        public int getOverallPatentabilityScore() { return overallPatentabilityScore; }
        public void setOverallPatentabilityScore(int overallPatentabilityScore) { this.overallPatentabilityScore = overallPatentabilityScore; }

        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

        public String getPrimaryStatutoryHurdle() { return primaryStatutoryHurdle; }
        public void setPrimaryStatutoryHurdle(String primaryStatutoryHurdle) { this.primaryStatutoryHurdle = primaryStatutoryHurdle; }

        public String getPrimaryDefensiveStrategy() { return primaryDefensiveStrategy; }
        public void setPrimaryDefensiveStrategy(String primaryDefensiveStrategy) { this.primaryDefensiveStrategy = primaryDefensiveStrategy; }
    }

    public static class PlainLanguageSummary {
        private String targetLanguage;
        private String headline;
        private String canISellToday;
        private String patentGuidance;
        private List<String> immediateNextSteps = new ArrayList<>();

        public PlainLanguageSummary() {}

        public PlainLanguageSummary(String targetLanguage, String headline, String canISellToday, 
                                    String patentGuidance, List<String> immediateNextSteps) {
            this.targetLanguage = targetLanguage;
            this.headline = headline;
            this.canISellToday = canISellToday;
            this.patentGuidance = patentGuidance;
            this.immediateNextSteps = immediateNextSteps;
        }

        public String getTargetLanguage() { return targetLanguage; }
        public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }

        public String getHeadline() { return headline; }
        public void setHeadline(String headline) { this.headline = headline; }

        public String getCanISellToday() { return canISellToday; }
        public void setCanISellToday(String canISellToday) { this.canISellToday = canISellToday; }

        public String getPatentGuidance() { return patentGuidance; }
        public void setPatentGuidance(String patentGuidance) { this.patentGuidance = patentGuidance; }

        public List<String> getImmediateNextSteps() { return immediateNextSteps; }
        public void setImmediateNextSteps(List<String> immediateNextSteps) { this.immediateNextSteps = immediateNextSteps; }
    }

    public static class DraftClaimsPackage {
        private String claimStrategySummary;
        private String section3pDefense;
        private List<PatentClaimItem> claims = new ArrayList<>();

        public DraftClaimsPackage() {}

        public DraftClaimsPackage(String claimStrategySummary, String section3pDefense, List<PatentClaimItem> claims) {
            this.claimStrategySummary = claimStrategySummary;
            this.section3pDefense = section3pDefense;
            this.claims = claims;
        }

        public String getClaimStrategySummary() { return claimStrategySummary; }
        public void setClaimStrategySummary(String claimStrategySummary) { this.claimStrategySummary = claimStrategySummary; }

        public String getSection3pDefense() { return section3pDefense; }
        public void setSection3pDefense(String section3pDefense) { this.section3pDefense = section3pDefense; }

        public List<PatentClaimItem> getClaims() { return claims; }
        public void setClaims(List<PatentClaimItem> claims) { this.claims = claims; }
    }
}
