package com.ayurveda.ipr.audit.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Audit Log Entity storing sanitized user queries, confidence metrics, and verdicts in PostgreSQL.
 * Complies with Section 6 of SPEC.md and DPDP Act 2023.
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    private String sessionId;

    @Column(name = "sanitized_query", columnDefinition = "TEXT", nullable = false)
    private String sanitizedQuery;

    @Column(name = "jurisdiction", length = 32)
    private String jurisdiction;

    @Column(name = "verdict_status", length = 64, nullable = false)
    private String verdictStatus;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "retrieved_citation_ids", columnDefinition = "TEXT")
    private String retrievedCitationIds;

    @Column(name = "has_pii_redacted", nullable = false)
    private Boolean hasPiiRedacted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuditLog() {}

    public AuditLog(
            String sessionId,
            String sanitizedQuery,
            String jurisdiction,
            String verdictStatus,
            Double confidenceScore,
            String retrievedCitationIds,
            Boolean hasPiiRedacted) {
        this.sessionId = sessionId;
        this.sanitizedQuery = sanitizedQuery;
        this.jurisdiction = jurisdiction;
        this.verdictStatus = verdictStatus;
        this.confidenceScore = confidenceScore;
        this.retrievedCitationIds = retrievedCitationIds;
        this.hasPiiRedacted = hasPiiRedacted != null ? hasPiiRedacted : false;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getSanitizedQuery() {
        return sanitizedQuery;
    }

    public void setSanitizedQuery(String sanitizedQuery) {
        this.sanitizedQuery = sanitizedQuery;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }

    public String getVerdictStatus() {
        return verdictStatus;
    }

    public void setVerdictStatus(String verdictStatus) {
        this.verdictStatus = verdictStatus;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getRetrievedCitationIds() {
        return retrievedCitationIds;
    }

    public void setRetrievedCitationIds(String retrievedCitationIds) {
        this.retrievedCitationIds = retrievedCitationIds;
    }

    public Boolean getHasPiiRedacted() {
        return hasPiiRedacted;
    }

    public void setHasPiiRedacted(Boolean hasPiiRedacted) {
        this.hasPiiRedacted = hasPiiRedacted;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
