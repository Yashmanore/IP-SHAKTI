package com.ayurveda.ipr.dpdp;

import com.ayurveda.ipr.dpdp.model.AbstentionEvaluation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Safe Abstention Engine for IP-SHAKTI Sahayak.
 * Enforces legal safeguards against prohibited disease cure claims under the
 * Drugs and Magic Remedies (Objectionable Advertisements) Act 1954 and low-confidence statutory queries.
 */
@Service
public class SafeAbstentionEngine {

    private static final Logger log = LoggerFactory.getLogger(SafeAbstentionEngine.class);

    // List of conditions strictly prohibited from advertising 'cures' under the Schedule of DMRA 1954
    private static final List<String> PROHIBITED_CONDITIONS = List.of(
            "cancer", "arbuda",
            "diabetes", "prameha", "madhumeha",
            "paralysis", "pakshaghata",
            "blindness", "cataract", "timira",
            "aids", "hiv",
            "leprosy", "kushtha",
            "epilepsy", "apasmara",
            "tuberculosis", "rajayakshma",
            "kidney failure", "renal failure",
            "sexual impotence", "erectile dysfunction", "klaibya"
    );

    private static final Pattern CURE_ASSERTION_PATTERN = Pattern.compile(
            "\\b(guaranteed cure|complete cure|100% cure|100 % cure|magic remedy|miracle cure|permanently cure|cures permanently)\\b",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Evaluates whether a query makes illegal claims under DMRA 1954.
     */
    public AbstentionEvaluation evaluateQuery(String userQuery) {
        if (userQuery == null || userQuery.isBlank()) {
            return AbstentionEvaluation.allowed();
        }

        String lower = userQuery.toLowerCase(Locale.ROOT);

        // Check 1: Guaranteed cure / magic remedy assertion
        boolean assertsCure = CURE_ASSERTION_PATTERN.matcher(lower).find() ||
                (lower.contains("cure") && (lower.contains("guarantee") || lower.contains("miracle")));

        for (String condition : PROHIBITED_CONDITIONS) {
            if (lower.contains(condition) && assertsCure) {
                log.warn("Safe Abstention Triggered: Query asserts prohibited cure for scheduled condition '{}' under DMRA 1954.", condition);

                String statutoryCitation = "Drugs & Magic Remedies (Objectionable Advertisements) Act 1954, Section 3 & Section 4";
                String advisoryMessage = String.format(
                        "SAFE ABSTENTION NOTICE: Your inquiry asserts a guaranteed or complete cure for '%s'. " +
                        "Under Section 3 of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954, and the Drugs and Cosmetics Act 1940, " +
                        "no person or commercial establishment may claim a definitive cure for conditions specified in the statutory schedule. " +
                        "Furthermore, patent claims directed to treatment methods are barred under Section 3(i) of the Indian Patents Act 1970. " +
                        "IP-SHAKTI Sahayak cannot assist with drafting patent specifications or marketing claims that violate statutory prohibitions. " +
                        "Please consult the State AYUSH Licensing Authority or CDSCO for clinical trial protocols.",
                        condition.toUpperCase()
                );

                return AbstentionEvaluation.prohibitedClaim(condition, statutoryCitation, advisoryMessage);
            }
        }

        return AbstentionEvaluation.allowed();
    }

    /**
     * Evaluates confidence score threshold (must be >= 60.0 for authoritative legal guidance).
     */
    public AbstentionEvaluation evaluateConfidence(double overallScore) {
        if (overallScore < 60.0) {
            log.warn("Safe Abstention Triggered: Overall confidence score {}% is below safe statutory threshold (60%).", overallScore);
            String advisoryMessage = String.format(
                    "SAFE ABSTENTION / ESCALATION NOTICE: The composite confidence score for this inquiry is %d%%, " +
                    "which is below our statutory certainty threshold of 60%%. To prevent legal misguidance, IP-SHAKTI Sahayak has abstained " +
                    "from generating automated legal deliverables. We recommend: (1) Conducting a formal manual search in CSIR-TKDL and InPASS, " +
                    "(2) Submitting Form 1 to the National Biodiversity Authority (NBA) if biological resources from India are involved, and " +
                    "(3) Engaging a registered Indian Patent Agent / AYUSH Regulatory Counsel for bespoke legal opinion.",
                    Math.round(overallScore)
            );
            return AbstentionEvaluation.lowConfidence(overallScore, advisoryMessage);
        }

        return AbstentionEvaluation.allowed();
    }
}
