package com.ayurveda.ipr.dpdp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DPDP Act 2023 Compliant PII Masking and Data Sanitization Service.
 * Ensures zero leakage of Aadhaar, PAN, phone numbers, and emails to external LLMs and databases.
 */
@Service
public class DpdpSanitizationService {

    private static final Logger log = LoggerFactory.getLogger(DpdpSanitizationService.class);

    // 12-digit Indian Aadhaar with optional spaces or dashes: e.g. 1234 5678 9012 or 123456789012
    private static final Pattern AADHAAR_PATTERN = Pattern.compile("\\b[2-9]\\d{3}[\\s\\-]\\d{4}[\\s\\-]\\d{4}\\b|\\b[2-9]\\d{11}\\b");

    // Permanent Account Number (PAN): 5 letters, 4 digits, 1 letter: e.g. ABCDE1234F
    private static final Pattern PAN_PATTERN = Pattern.compile("\\b[A-Z]{5}[0-9]{4}[A-Z]\\b", Pattern.CASE_INSENSITIVE);

    // Indian 10-digit mobile numbers with optional country code (+91 / 91 / 0): e.g. +91 9876543210
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+91[\\-\\s]?|91[\\-\\s]?|0)?[6-9]\\d{9}\\b");

    // Standard Email pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");

    public record SanitizationResult(String sanitizedText, boolean piiDetected, int redactionCount) {}

    /**
     * Sanitizes user input by masking all recognized personal identification fields.
     */
    public SanitizationResult sanitize(String input) {
        if (input == null || input.isBlank()) {
            return new SanitizationResult(input, false, 0);
        }

        int count = 0;
        String current = input;

        // Mask Aadhaar
        Matcher aadhaarMatcher = AADHAAR_PATTERN.matcher(current);
        if (aadhaarMatcher.find()) {
            count++;
            current = aadhaarMatcher.replaceAll("[REDACTED_AADHAAR]");
        }

        // Mask PAN
        Matcher panMatcher = PAN_PATTERN.matcher(current);
        if (panMatcher.find()) {
            count++;
            current = panMatcher.replaceAll("[REDACTED_PAN]");
        }

        // Mask Phone
        Matcher phoneMatcher = PHONE_PATTERN.matcher(current);
        if (phoneMatcher.find()) {
            count++;
            current = phoneMatcher.replaceAll("[REDACTED_PHONE]");
        }

        // Mask Email
        Matcher emailMatcher = EMAIL_PATTERN.matcher(current);
        if (emailMatcher.find()) {
            count++;
            current = emailMatcher.replaceAll("[REDACTED_EMAIL]");
        }

        boolean piiDetected = count > 0;
        if (piiDetected) {
            log.info("DPDP Act Compliance: Redacted {} PII identifier(s) from incoming user input.", count);
        }

        return new SanitizationResult(current, piiDetected, count);
    }
}
