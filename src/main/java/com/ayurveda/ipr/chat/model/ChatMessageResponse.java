package com.ayurveda.ipr.chat.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Outgoing response from the conversational orchestrator.
 */
public class ChatMessageResponse {

    public enum DialogueStatus {
        CLARIFICATION_REQUIRED,
        ASSESSMENT_COMPLETE,
        SAFE_ABSTENTION
    }

    private String sessionId;
    private DialogueStatus status;
    private String botMessage;
    private ClarificationPrompt clarificationPrompt; // Populated if CLARIFICATION_REQUIRED
    private List<String> citationPills = new ArrayList<>();
    private ConfidenceScore confidenceScore;         // Populated if ASSESSMENT_COMPLETE
    private FivePillarsResponse pillars;             // Populated if ASSESSMENT_COMPLETE
    private String jurisdiction = "INDIA";
    private String language = "en";
    private String detectedLanguage = "en";
    private ExecutiveLegalDeliverables llmDeliverables; // Populated if ASSESSMENT_COMPLETE
    private List<ActionRoadmapItem> actionRoadmap = new ArrayList<>(); // Populated if ASSESSMENT_COMPLETE
    private String disclaimer = "Information provided is for educational and guidance purposes under Indian law and does not constitute formal legal counsel.";

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(String sessionId, DialogueStatus status, String botMessage) {
        this.sessionId = sessionId;
        this.status = status;
        this.botMessage = botMessage;
    }

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public DialogueStatus getStatus() {
        return status;
    }

    public void setStatus(DialogueStatus status) {
        this.status = status;
    }

    public String getBotMessage() {
        return botMessage;
    }

    public void setBotMessage(String botMessage) {
        this.botMessage = botMessage;
    }

    public ClarificationPrompt getClarificationPrompt() {
        return clarificationPrompt;
    }

    public void setClarificationPrompt(ClarificationPrompt clarificationPrompt) {
        this.clarificationPrompt = clarificationPrompt;
    }

    public List<String> getCitationPills() {
        return citationPills;
    }

    public void setCitationPills(List<String> citationPills) {
        this.citationPills = citationPills;
    }

    public ConfidenceScore getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(ConfidenceScore confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public FivePillarsResponse getPillars() {
        return pillars;
    }

    public void setPillars(FivePillarsResponse pillars) {
        this.pillars = pillars;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDetectedLanguage() {
        return detectedLanguage;
    }

    public void setDetectedLanguage(String detectedLanguage) {
        this.detectedLanguage = detectedLanguage;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public ExecutiveLegalDeliverables getLlmDeliverables() {
        return llmDeliverables;
    }

    public void setLlmDeliverables(ExecutiveLegalDeliverables llmDeliverables) {
        this.llmDeliverables = llmDeliverables;
    }

    public List<ActionRoadmapItem> getActionRoadmap() {
        return actionRoadmap;
    }

    public void setActionRoadmap(List<ActionRoadmapItem> actionRoadmap) {
        this.actionRoadmap = actionRoadmap;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }
}
