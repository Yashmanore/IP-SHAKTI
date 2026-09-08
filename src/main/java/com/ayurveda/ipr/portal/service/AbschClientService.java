package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.AbschPermit;
import com.ayurveda.ipr.portal.model.AbschResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Portal 1 Connector: UN Convention on Biological Diversity (CBD) ABS Clearing-House.
 * Fetches live Internationally Recognized Certificates of Compliance (IRCC) granted
 * by the National Biodiversity Authority (NBA) under the Nagoya Protocol and BD Act 2002.
 */
@Service
public class AbschClientService {

    private static final Logger log = LoggerFactory.getLogger(AbschClientService.class);
    private static final String CBD_API_BASE = "https://api.cbd.int/api/v2013/index/select";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AbschClientService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Queries the live CBD ABS Clearing-House for Indian IRCC permits.
     * @param plantOrBotanicalKey e.g. "Ashwagandha" or "Withania somnifera" or "Curcuma"
     */
    public AbschResponse searchIndianAbsPermits(String plantOrBotanicalKey) {
        AbschResponse response = new AbschResponse();
        response.setQueryTerm(plantOrBotanicalKey);
        response.setTotalIndianPermitsInRegistry(3561); // Baseline certified Indian permits

        try {
            String solrQuery;
            if (plantOrBotanicalKey != null && !plantOrBotanicalKey.trim().isEmpty()) {
                solrQuery = "schema_s:absPermit AND government_s:in AND (" + plantOrBotanicalKey.trim() + ")";
            } else {
                solrQuery = "schema_s:absPermit AND government_s:in";
            }

            String requestUrl = CBD_API_BASE + "?q=" + URLEncoder.encode(solrQuery, StandardCharsets.UTF_8)
                    + "&rows=5&wt=json&sort=" + URLEncoder.encode("updatedDate_dt desc", StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(requestUrl))
                    .timeout(Duration.ofSeconds(5))
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(httpResponse.body());
                JsonNode responseNode = root.path("response");
                int numFound = responseNode.path("numFound").asInt(0);
                response.setTotalPermitsFoundForTerm(numFound);

                JsonNode docs = responseNode.path("docs");
                if (docs.isArray()) {
                    for (JsonNode doc : docs) {
                        AbschPermit permit = new AbschPermit();
                        String id = doc.path("uniqueIdentifier_s").asText(doc.path("id").asText(""));
                        permit.setIrccNumber(id);
                        permit.setTitle(doc.path("title_s").asText("NBA Approval for Access to Biological Resources"));
                        permit.setIssuingAuthority("National Biodiversity Authority (NBA), Chennai, India");
                        permit.setIssuanceDate(doc.path("updatedDate_dt").asText(doc.path("indexedDate_s").asText("")));
                        permit.setDirectUrl("https://absch.cbd.int/en/database/" + id);
                        permit.setUsageType(doc.path("keywords_EN_ss").toString().contains("Commercial") ? "Commercial Utilization" : "Research / Export");
                        permit.setSubjectMatter("Indian Biological Resource accessed under Section 3 / Section 6");

                        response.getPermits().add(permit);
                    }
                }
                response.setSuccess(true);
            } else {
                log.warn("CBD API responded with HTTP {}", httpResponse.statusCode());
                response.setSuccess(false);
            }

        } catch (Exception e) {
            log.error("Failed to connect to CBD ABSCH API: {}", e.getMessage());
            response.setSuccess(false);
        }

        // Attach statutory guidance based on Biological Diversity Act 2002
        response.setStatutoryComplianceGuidance(
                "Compliance Mandate: Under Section 3 of the Biological Diversity Act 2002, non-Indian entities, NRIs, " +
                "or foreign-controlled companies must obtain NBA Form I prior approval before accessing Indian bio-resources. " +
                "Furthermore, under Section 6, ANY applicant (Indian or Foreign) seeking a patent on an invention based on " +
                "Indian biological resources must obtain Form III approval from the National Biodiversity Authority prior to the grant of the patent. " +
                "Proof of IRCC registration is globally monitored by patent examiners under the Nagoya Protocol."
        );

        return response;
    }
}
