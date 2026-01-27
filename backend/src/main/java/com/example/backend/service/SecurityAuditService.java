package com.example.backend.service;

import com.example.backend.entity.SecurityAuditLog;
import com.example.backend.enums.AuditEventType;
import com.example.backend.repo.SecurityAuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityAuditService {

    private final SecurityAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Async("auditExecutor")
    public void logSecurityEvent(String userId, AuditEventType eventType,
                                 String description, boolean success) {
        logSecurityEvent(userId, eventType, description, success, null);
    }

    @Async("auditExecutor")
    public void logSecurityEvent(String userId, AuditEventType eventType,
                                 String description, boolean success,
                                 Map<String, Object> additionalData) {
        try {
            HttpServletRequest request = getCurrentRequest();

            SecurityAuditLog auditLog = SecurityAuditLog.builder()
                    .userId(userId)
                    .eventType(eventType)
                    .description(description)
                    .ipAddress(getClientIpAddress(request))
                    .userAgent(request != null ? request.getHeader("User-Agent") : "Unknown")
                    .success(success)
                    .metadata(additionalData != null ? objectMapper.writeValueAsString(additionalData) : null)
                    .build();

            auditLogRepository.save(auditLog);

            log.info("Security event logged: {} for user: {} - Success: {}",
                    eventType, userId, success);

            // Alert on suspicious activity
            if (eventType == AuditEventType.SUSPICIOUS_ACTIVITY || !success) {
                detectAnomalies(userId, eventType);
            }

        } catch (Exception e) {
            log.error("Failed to log security event: {}", e.getMessage());
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (request == null) return "Unknown";

        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED",
                "HTTP_X_CLUSTER_CLIENT_IP",
                "HTTP_CLIENT_IP",
                "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED",
                "HTTP_VIA",
                "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }

    private void detectAnomalies(String userId, AuditEventType eventType) {
        // Check for multiple failed login attempts
        long failedLogins = auditLogRepository.countByUserIdAndEventTypeAndSuccessFalseAndCreatedAtAfter(
                userId,
                AuditEventType.LOGIN_FAILED,
                java.time.LocalDateTime.now().minusMinutes(15)
        );

        if (failedLogins >= 3) {
            log.warn("SECURITY ALERT: Multiple failed login attempts detected for user: {}", userId);
            // Could trigger email notification or additional security measures
        }

        // Check for login from new location/device
        // This would require storing device fingerprints and comparing
    }

    public Map<String, Object> getSecuritySummaryForUser(String userId) {
        Map<String, Object> summary = new HashMap<>();

        summary.put("totalEvents", auditLogRepository.countByUserId(userId));
        summary.put("failedLogins", auditLogRepository.countByUserIdAndEventTypeAndSuccessFalse(
                userId, AuditEventType.LOGIN_FAILED));
        summary.put("lastLogin", auditLogRepository.findFirstByUserIdAndEventTypeOrderByCreatedAtDesc(
                userId, AuditEventType.LOGIN_SUCCESS));

        return summary;
    }
}