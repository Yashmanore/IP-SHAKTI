package com.ayurveda.ipr.portal.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Encapsulates the live response from the UN Convention on Biological Diversity (CBD)
 * ABS Clearing-House for Indian Access and Benefit Sharing records.
 */
public class AbschResponse {

    private boolean success;
    private String queryTerm;
    private int totalPermitsFoundForTerm;
    private int totalIndianPermitsInRegistry; // Official total in CBD index (3,560+)
    private List<AbschPermit> permits = new ArrayList<>();
    private String statutoryComplianceGuidance;
    private String officialPortalUrl = "https://absch.cbd.int/en/countries/IN";

    public AbschResponse() {
    }

    public AbschResponse(boolean success, String queryTerm) {
        this.success = success;
        this.queryTerm = queryTerm;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getQueryTerm() {
        return queryTerm;
    }

    public void setQueryTerm(String queryTerm) {
        this.queryTerm = queryTerm;
    }

    public int getTotalPermitsFoundForTerm() {
        return totalPermitsFoundForTerm;
    }

    public void setTotalPermitsFoundForTerm(int totalPermitsFoundForTerm) {
        this.totalPermitsFoundForTerm = totalPermitsFoundForTerm;
    }

    public int getTotalIndianPermitsInRegistry() {
        return totalIndianPermitsInRegistry;
    }

    public void setTotalIndianPermitsInRegistry(int totalIndianPermitsInRegistry) {
        this.totalIndianPermitsInRegistry = totalIndianPermitsInRegistry;
    }

    public List<AbschPermit> getPermits() {
        return permits;
    }

    public void setPermits(List<AbschPermit> permits) {
        this.permits = permits;
    }

    public String getStatutoryComplianceGuidance() {
        return statutoryComplianceGuidance;
    }

    public void setStatutoryComplianceGuidance(String statutoryComplianceGuidance) {
        this.statutoryComplianceGuidance = statutoryComplianceGuidance;
    }

    public String getOfficialPortalUrl() {
        return officialPortalUrl;
    }

    public void setOfficialPortalUrl(String officialPortalUrl) {
        this.officialPortalUrl = officialPortalUrl;
    }
}
