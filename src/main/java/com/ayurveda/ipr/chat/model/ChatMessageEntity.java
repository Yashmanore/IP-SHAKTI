package com.ayurveda.ipr.chat.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Persisted Chat Message Entity for Session-Isolated Conversation History in PostgreSQL.
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_session_id", columnList = "session_id"),
        @Index(name = "idx_chat_created_at", columnList = "created_at")
})
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    private String sessionId;

    @Column(name = "sender_role", length = 16, nullable = false) // "USER" or "ASSISTANT"
    private String senderRole;

    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ChatMessageEntity() {}

    public ChatMessageEntity(String sessionId, String senderRole, String messageText) {
        this.sessionId = sessionId;
        this.senderRole = senderRole;
        this.messageText = messageText;
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

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
