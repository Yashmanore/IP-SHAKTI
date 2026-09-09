package com.ayurveda.ipr.audit.repository;

import com.ayurveda.ipr.audit.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findBySessionIdOrderByCreatedAtDesc(String sessionId);

    List<AuditLog> findTop20ByOrderByCreatedAtDesc();
}
