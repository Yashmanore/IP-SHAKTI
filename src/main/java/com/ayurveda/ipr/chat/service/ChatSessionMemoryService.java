package com.ayurveda.ipr.chat.service;

import com.ayurveda.ipr.chat.model.ChatMessageEntity;
import com.ayurveda.ipr.chat.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Session-Isolated Conversational Memory Service.
 * Ensures strict multi-tenant session isolation and sliding window conversation history.
 * Supported by fast in-memory LRU caching and persistent PostgreSQL storage.
 */
@Service
public class ChatSessionMemoryService {

    private static final Logger log = LoggerFactory.getLogger(ChatSessionMemoryService.class);
    private static final int DEFAULT_MAX_TURNS = 10;

    private final ChatMessageRepository chatMessageRepository;
    // In-memory fast cache keyed strictly by sessionId
    private final Map<String, List<ChatMessageEntity>> sessionMemoryCache = new ConcurrentHashMap<>();

    public ChatSessionMemoryService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    /**
     * Appends a user message to the session history.
     */
    @Transactional
    public void addUserMessage(String sessionId, String sanitizedText) {
        if (sessionId == null || sanitizedText == null || sanitizedText.isBlank()) return;
        saveMessage(sessionId, "USER", sanitizedText);
    }

    /**
     * Appends an AI message to the session history.
     */
    @Transactional
    public void addAiMessage(String sessionId, String messageText) {
        if (sessionId == null || messageText == null || messageText.isBlank()) return;
        saveMessage(sessionId, "ASSISTANT", messageText);
    }

    private void saveMessage(String sessionId, String role, String text) {
        ChatMessageEntity entity = new ChatMessageEntity(sessionId, role, text);
        try {
            chatMessageRepository.save(entity);
        } catch (Exception e) {
            log.warn("Could not persist message to PostgreSQL chat_messages: {}", e.getMessage());
        }

        sessionMemoryCache.compute(sessionId, (k, list) -> {
            if (list == null) {
                list = new ArrayList<>();
            }
            list.add(entity);
            // Sliding window cap
            if (list.size() > DEFAULT_MAX_TURNS * 2) {
                list.remove(0);
            }
            return list;
        });
        log.debug("Recorded [{}] message for isolated session: {}", role, sessionId);
    }

    /**
     * Retrieves the formatted conversation history for this session for injection into LLM prompts.
     */
    public String getFormattedHistory(String sessionId, int maxTurns) {
        if (sessionId == null || sessionId.isBlank()) return "";

        List<ChatMessageEntity> messages = sessionMemoryCache.computeIfAbsent(sessionId, k -> {
            try {
                return new ArrayList<>(chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId));
            } catch (Exception e) {
                log.warn("Could not load chat messages for session {}: {}", sessionId, e.getMessage());
                return new ArrayList<>();
            }
        });

        if (messages.isEmpty()) {
            return "";
        }

        // Take last N messages
        int startIndex = Math.max(0, messages.size() - (maxTurns * 2));
        List<ChatMessageEntity> window = messages.subList(startIndex, messages.size());

        StringBuilder sb = new StringBuilder();
        for (ChatMessageEntity msg : window) {
            String role = "USER".equalsIgnoreCase(msg.getSenderRole()) ? "Innovator" : "IP-SHAKTI Sahayak";
            sb.append(role).append(": ").append(msg.getMessageText()).append("\n\n");
        }
        return sb.toString().trim();
    }

    /**
     * Returns true when a session already has at least one recorded message.
     * Used by the Context-Aware Gatekeeper to bypass relevance checks for
     * ongoing clarification conversations.
     */
    public boolean hasActiveSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) return false;
        List<ChatMessageEntity> messages = sessionMemoryCache.get(sessionId);
        if (messages != null && !messages.isEmpty()) return true;
        // Fall back to DB if not in cache
        try {
            return !chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).isEmpty();
        } catch (Exception e) {
            log.warn("Could not check active session status for {}: {}", sessionId, e.getMessage());
            return false;
        }
    }

    /**
     * Clears all memory for a specific session.
     */
    @Transactional
    public void clearSession(String sessionId) {
        if (sessionId == null) return;
        sessionMemoryCache.remove(sessionId);
        try {
            chatMessageRepository.deleteBySessionId(sessionId);
            log.info("Cleared conversation history for session: {}", sessionId);
        } catch (Exception e) {
            log.warn("Error deleting chat_messages for session {}: {}", sessionId, e.getMessage());
        }
    }
}
