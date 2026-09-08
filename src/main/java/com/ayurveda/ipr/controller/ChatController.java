package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.chat.model.ChatMessageRequest;
import com.ayurveda.ipr.chat.model.ChatMessageResponse;
import com.ayurveda.ipr.chat.service.ChatOrchestratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing the multi-turn conversational orchestrator
 * for IP-SHAKTI Sahayak.
 */
@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "*")
@Tag(name = "Conversational Assistant", description = "Endpoints for the multi-turn IPR & Regulatory conversational assistant with interactive clarifying chips and 5-Pillar synthesis")
public class ChatController {

    private final ChatOrchestratorService orchestratorService;

    public ChatController(ChatOrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    /**
     * POST /api/v1/chat/message
     * Main conversational entrypoint. Handles:
     * - Initial inquiries
     * - Interactive clarifying question chips ([Yes] [No] [Not sure])
     * - Full 5-Pillar synthesis (IP, Regulatory, ABS, TKDL, and Statutory Sources)
     */
    @PostMapping("/message")
    @Operation(
            summary = "Send chat message & receive guidance",
            description = "Main conversational entrypoint. If key legal parameters (e.g. classical text match, technical novelty) are missing, returns 'CLARIFICATION_REQUIRED' with interactive button choices. Once answers are provided, executes Rule 158-B, Neon pgvector search, and external portals to return the full 5-Pillar structured analysis.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successful response (either clarification prompt or full 5-Pillar assessment)",
                            content = @Content(schema = @Schema(implementation = ChatMessageResponse.class))
                    )
            }
    )
    public ResponseEntity<ChatMessageResponse> handleMessage(@RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = orchestratorService.processMessage(request);
        return ResponseEntity.ok(response);
    }
}
