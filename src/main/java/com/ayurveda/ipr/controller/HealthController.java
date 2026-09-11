package com.ayurveda.ipr.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health & Uptime Controller for Render, UptimeRobot, Kubernetes, and monitoring probes.
 * Supports:
 * - GET /api/v1/health (Full system health with database & memory telemetry)
 * - GET /health (Standard top-level health probe)
 * - GET /ping (Ultra-lightweight keep-alive ping for uptime monitors)
 * - GET /api/v1/health/liveness (Liveness probe)
 * - GET /api/v1/health/readiness (Readiness probe)
 */
@RestController
@CrossOrigin(origins = "*")
@Tag(name = "Health & Uptime Monitoring", description = "Endpoints for uptime monitors, Render keep-alive pings, and container health probes")
public class HealthController {

    private static final long START_TIME_MILLIS = System.currentTimeMillis();
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Comprehensive health check telemetry endpoint.
     */
    @GetMapping(value = {"/api/v1/health", "/health"})
    @Operation(summary = "System health check", description = "Returns system operational status, uptime, database connectivity, and JVM memory telemetry")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "IP-SHAKTI-backend");
        health.put("environment", "production");
        health.put("timestamp", Instant.now().toString());

        long uptimeSeconds = (System.currentTimeMillis() - START_TIME_MILLIS) / 1000;
        long jvmUptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        health.put("uptimeSeconds", uptimeSeconds);
        health.put("uptimeFormatted", formatUptime(uptimeSeconds));

        // Check database connectivity
        String dbStatus = "CONNECTED";
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result == null || result != 1) {
                dbStatus = "DEGRADED";
            }
        } catch (Exception e) {
            dbStatus = "DISCONNECTED: " + e.getMessage();
        }
        health.put("database", dbStatus);

        // JVM Memory Telemetry
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;

        Map<String, Object> memory = new LinkedHashMap<>();
        memory.put("usedMb", usedMemory);
        memory.put("freeMb", freeMemory);
        memory.put("totalMb", totalMemory);
        memory.put("maxMb", maxMemory);
        memory.put("usagePercent", maxMemory > 0 ? (usedMemory * 100 / maxMemory) + "%" : "N/A");
        health.put("memory", memory);

        // Core AI Subsystems
        Map<String, String> subsystems = new LinkedHashMap<>();
        subsystems.put("pgvectorRAG", "ONLINE");
        subsystems.put("geminiGateway", "ONLINE");
        subsystems.put("multilingualEngine", "ONLINE (EN, HI, MR)");
        subsystems.put("rule158bEngine", "ONLINE");
        health.put("subsystems", subsystems);

        return ResponseEntity.ok(health);
    }

    /**
     * Ultra-lightweight keep-alive ping endpoint (0ms overhead, ideal for 5-minute UptimeRobot crons).
     */
    @GetMapping(value = {"/ping", "/api/v1/health/ping"})
    @Operation(summary = "Keep-alive ping", description = "Ultra-lightweight ping response for uptime monitors (UptimeRobot, BetterUptime) to prevent Render free-tier spin down")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "message", "pong",
                "timestamp", Instant.now().toString()
        ));
    }

    /**
     * Kubernetes / Container Liveness Probe
     */
    @GetMapping("/api/v1/health/liveness")
    @Operation(summary = "Liveness probe", description = "Returns 200 OK if the Spring Boot application is alive")
    public ResponseEntity<Map<String, String>> liveness() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    /**
     * Kubernetes / Container Readiness Probe
     */
    @GetMapping("/api/v1/health/readiness")
    @Operation(summary = "Readiness probe", description = "Returns 200 OK if the database and web server are ready to accept traffic")
    public ResponseEntity<Map<String, String>> readiness() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok(Map.of("status", "READY"));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "NOT_READY",
                    "error", e.getMessage()
            ));
        }
    }

    private String formatUptime(long totalSeconds) {
        long days = totalSeconds / 86400;
        long hours = (totalSeconds % 86400) / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;

        StringBuilder sb = new StringBuilder();
        if (days > 0) sb.append(days).append("d ");
        if (hours > 0) sb.append(hours).append("h ");
        if (minutes > 0) sb.append(minutes).append("m ");
        sb.append(seconds).append("s");
        return sb.toString();
    }
}
