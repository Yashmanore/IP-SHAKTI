package com.ayurveda.ipr.llm.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Domain Relevance Evaluation produced by Google Gemini Flash or deterministic fallback.
 * Evaluates whether an incoming user inquiry, product, or formulation belongs to the
 * legitimate statutory scope of Ayurveda, AYUSH, biological resources, or life-sciences IP.
 */
public class RelevanceEvaluation {

    private boolean relevant;
    private double confidence;
    private String detectedDomain;
    private String reason;
    private String suggestedAction;
    private List<String> flaggedKeywords = new ArrayList<>();

    public RelevanceEvaluation() {
    }

    public RelevanceEvaluation(boolean relevant, double confidence, String detectedDomain, String reason, String suggestedAction) {
        this.relevant = relevant;
        this.confidence = confidence;
        this.detectedDomain = detectedDomain;
        this.reason = reason;
        this.suggestedAction = suggestedAction;
    }

    public boolean isRelevant() {
        return relevant;
    }

    public void setRelevant(boolean relevant) {
        this.relevant = relevant;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getDetectedDomain() {
        return detectedDomain;
    }

    public void setDetectedDomain(String detectedDomain) {
        this.detectedDomain = detectedDomain;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public List<String> getFlaggedKeywords() {
        return flaggedKeywords;
    }

    public void setFlaggedKeywords(List<String> flaggedKeywords) {
        this.flaggedKeywords = flaggedKeywords;
    }

    @Override
    public String toString() {
        return "RelevanceEvaluation{" +
                "relevant=" + relevant +
                ", confidence=" + confidence +
                ", detectedDomain='" + detectedDomain + '\'' +
                ", reason='" + reason + '\'' +
                ", suggestedAction='" + suggestedAction + '\'' +
                '}';
    }
}
