package com.ayurveda.ipr.chat.model;

/**
 * Composite confidence rating calculated according to SPEC.md:
 * Confidence = 0.5 * retrievalScore + 0.3 * authorityScore + 0.2 * citationCoverage
 */
public class ConfidenceScore {

    private String level;         // "HIGH", "MEDIUM", "LOW"
    private int overallScore;     // 0 to 100
    private int retrievalScore;   // pgvector cosine match quality
    private int authorityScore;   // Statute / Gazette authority weight (100 for core Acts)
    private int citationCoverage; // Citation presence score

    public ConfidenceScore() {
    }

    public ConfidenceScore(String level, int overallScore, int retrievalScore, int authorityScore, int citationCoverage) {
        this.level = level;
        this.overallScore = overallScore;
        this.retrievalScore = retrievalScore;
        this.authorityScore = authorityScore;
        this.citationCoverage = citationCoverage;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public int getRetrievalScore() {
        return retrievalScore;
    }

    public void setRetrievalScore(int retrievalScore) {
        this.retrievalScore = retrievalScore;
    }

    public int getAuthorityScore() {
        return authorityScore;
    }

    public void setAuthorityScore(int authorityScore) {
        this.authorityScore = authorityScore;
    }

    public int getCitationCoverage() {
        return citationCoverage;
    }

    public void setCitationCoverage(int citationCoverage) {
        this.citationCoverage = citationCoverage;
    }
}
