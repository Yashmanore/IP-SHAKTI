package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.AyushEvidenceResponse;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Portal 5 Connector: Ministry of AYUSH Research Portal (ayushportal.nic.in).
 * Maps formulations and medicinal plants to published clinical trials and
 * pharmacological evidence required for Rule 158-B licensing and Section 3(e) patent defense.
 */
@Service
public class AyushResearchPortalService {

    private static final String AYUSH_PORTAL_BASE = "https://ayushportal.nic.in/";

    public AyushEvidenceResponse mapEvidenceForFormulation(String plantOrFormulation) {
        String cleanTerm = plantOrFormulation != null ? plantOrFormulation.trim() : "Ayurveda";

        String searchUrl;
        try {
            searchUrl = AYUSH_PORTAL_BASE + "?search=" + URLEncoder.encode(cleanTerm, StandardCharsets.UTF_8);
        } catch (Exception e) {
            searchUrl = AYUSH_PORTAL_BASE;
        }

        List<String> categories = Arrays.asList(
                "1. Clinical Research: Double-blind RCTs and open-label human clinical trials on " + cleanTerm,
                "2. Drug Research: In-vivo animal toxicity, pharmacokinetic studies, and TLC/HPLC standardization",
                "3. Fundamental & Literary Research: Textual references across Charaka, Sushruta, and Vagbhata",
                "4. Systematic Reviews & Meta-Analyses: Published by CCRAS (Central Council for Research in Ayurvedic Sciences)"
        );

        String checklist = "Rule 158-B(1)(A) Regulatory Submission Dossier: " +
                "To exempt your proprietary formulation from conducting fresh clinical trials, compile the following from the AYUSH Research Portal: " +
                "(a) At least 2 published peer-reviewed human clinical trial papers proving safety and indication efficacy; " +
                "(b) Published acute oral toxicity studies (OECD 423) proving safety at 2000 mg/kg; " +
                "(c) Official Pharmacopoeial Laboratory for Indian Medicine (PLIM) monograph specifications.";

        String patentAdvice = "Indian Patent Office Section 3(e) Synergism Defense: " +
                "When the patent examiner objects that combining " + cleanTerm + " with other herbs is an unpatentable 'mere admixture', " +
                "submit comparative clinical or in-vitro trial data from the AYUSH Research Portal demonstrating statistically " +
                "significant synergistic enhancement exceeding the sum of the individual herbs.";

        return new AyushEvidenceResponse(
                cleanTerm,
                searchUrl,
                categories,
                checklist,
                patentAdvice
        );
    }
}
