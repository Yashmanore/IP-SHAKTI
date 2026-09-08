package com.ayurveda.ipr.chat.model;

import java.util.HashMap;
import java.util.Map;

/**
 * Incoming user message to the conversational orchestrator.
 */
public class ChatMessageRequest {

    private String sessionId;
    private String message;
    private String jurisdiction = "INDIA"; // "INDIA" or "INTERNATIONAL"
    private Map<String, String> clarificationAnswers = new HashMap<>();

    public ChatMessageRequest() {
    }

    public ChatMessageRequest(String sessionId, String message, String jurisdiction, Map<String, String> clarificationAnswers) {
        this.sessionId = sessionId;
        this.message = message;
        this.jurisdiction = jurisdiction;
        this.clarificationAnswers = clarificationAnswers != null ? clarificationAnswers : new HashMap<>();
    }

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public Map<String, String> getClarificationAnswers() {
        return clarificationAnswers;
    }

    public void setClarificationAnswers(Map<String, String> clarificationAnswers) {
        this.clarificationAnswers = clarificationAnswers;
    }
}
