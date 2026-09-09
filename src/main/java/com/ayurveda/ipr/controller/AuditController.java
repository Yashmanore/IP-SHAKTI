package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.audit.model.AuditLog;
import com.ayurveda.ipr.audit.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit & Compliance", description = "DPDP Act 2023 compliant sovereign audit logs")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent audit logs", description = "Returns the 20 most recent sovereign audit logs with redacted PII")
    public ResponseEntity<List<AuditLog>> getRecentAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findTop20ByOrderByCreatedAtDesc());
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get audit logs for a session", description = "Retrieves all audit events associated with a given session ID")
    public ResponseEntity<List<AuditLog>> getLogsBySession(@PathVariable String sessionId) {
        return ResponseEntity.ok(auditLogRepository.findBySessionIdOrderByCreatedAtDesc(sessionId));
    }
}
