package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.WipoQueryResponse;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Portal 3 Connector: WIPO PATENTSCOPE (Geneva).
 * Generates international prior-art search queries and 1-click deep-links
 * targeting IPC Class A61K 36/00 (Medicinal plant preparations) across 129M+ patent files.
 */
@Service
public class WipoPatentscopeService {

    private static final String WIPO_BASE_URL = "https://patentscope.wipo.int/search/en/result.jsf";

    public WipoQueryResponse generateWipoDeepLink(String botanicalOrKeyword, String ipcSubclass) {
        String cleanKeyword = botanicalOrKeyword != null ? botanicalOrKeyword.trim() : "Withania";
        String cleanIpc = (ipcSubclass != null && !ipcSubclass.trim().isEmpty()) ? ipcSubclass.trim() : "A61K 36/00";

        // WIPO PATENTSCOPE Boolean query syntax
        // e.g. IC:A61K36/81 AND (TITLE:"Withania somnifera" OR ABSTRACT:"Ashwagandha")
        String booleanQuery = String.format("IC:%s AND (TITLE:\"%s\" OR ABSTRACT:\"%s\")",
                cleanIpc.replace(" ", ""), cleanKeyword, cleanKeyword);

        String deepLink;
        try {
            deepLink = WIPO_BASE_URL + "?query=" + URLEncoder.encode(booleanQuery, StandardCharsets.UTF_8);
        } catch (Exception e) {
            deepLink = WIPO_BASE_URL + "?query=" + booleanQuery.replace(" ", "%20");
        }

        String gratkAdvice = "WIPO GRATK Treaty 2024 Compliance Alert: " +
                "Under Article 3 of the newly adopted WIPO Treaty on Intellectual Property, Genetic Resources and " +
                "Associated Traditional Knowledge (Geneva, May 2024), any international patent application (PCT) " +
                "where the claimed invention is based on Indian genetic resources (medicinal plants) or traditional knowledge " +
                "MUST include a mandatory disclosure of the country of origin (India) and indigenous/community source. " +
                "Failure to disclose or fraudulent concealment provides grounds for patent invalidation in national phases.";

        return new WipoQueryResponse(
                cleanKeyword,
                cleanIpc,
                deepLink,
                booleanQuery,
                gratkAdvice
        );
    }
}
