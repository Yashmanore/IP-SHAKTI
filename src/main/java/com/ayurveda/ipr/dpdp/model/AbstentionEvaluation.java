package com.ayurveda.ipr.dpdp.model;

import java.util.List;

/**
 * Result of Safe Abstention evaluation under Drugs & Magic Remedies Act 1954 and confidence thresholds.
 */
public class AbstentionEvaluation {

    private final boolean shouldAbstain;
    private final String reasonCode;
    private final String statutoryCitation;
    private final String publicAdvisoryMessage;
    private final List<String> citationPills;

    public AbstentionEvaluation(
            boolean shouldAbstain,
            String reasonCode,
            String statutoryCitation,
            String publicAdvisoryMessage,
            List<String> citationPills) {
        this.shouldAbstain = shouldAbstain;
        this.reasonCode = reasonCode;
        this.statutoryCitation = statutoryCitation;
        this.publicAdvisoryMessage = publicAdvisoryMessage;
        this.citationPills = citationPills;
    }

    public static AbstentionEvaluation allowed() {
        return new AbstentionEvaluation(false, "NONE", null, null, List.of());
    }

    public static AbstentionEvaluation prohibitedClaim(String condition, String statutoryCitation, String advisoryMessage) {
        return new AbstentionEvaluation(
                true,
                "PROHIBITED_CLAIM_DMRA_1954",
                statutoryCitation,
                advisoryMessage,
                List.of(
                        "Drugs & Magic Remedies Act 1954 §3",
                        "Patents Act 1970 §3(b) (Morality & Public Order)",
                        "Rule 158-B D&C Rules 1945"
                )
        );
    }

    public static AbstentionEvaluation lowConfidence(double score, String advisoryMessage) {
        return new AbstentionEvaluation(
                true,
                "LOW_CONFIDENCE_ESCALATION",
                "Patents Act 1970 & Biological Diversity Act 2002",
                advisoryMessage,
                List.of(
                        "Confidence Score: " + Math.round(score) + "% (< 60% threshold)",
                        "Escalation to Patent Attorney Required",
                        "TKDL Prior-Art Verification Recommended"
                )
        );
    }

    public boolean isShouldAbstain() {
        return shouldAbstain;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public String getStatutoryCitation() {
        return statutoryCitation;
    }

    public String getPublicAdvisoryMessage() {
        return publicAdvisoryMessage;
    }

    public List<String> getCitationPills() {
        return citationPills;
    }
}
