package com.ayurveda.ipr.chat.model;

/**
 * Represents an individual draft patent claim crafted to navigate Section 3(p) and Section 3(e) of Patents Act 1970.
 */
public class PatentClaimItem {

    private int claimNumber;
    private String type; // e.g. "INDEPENDENT_PRODUCT", "DEPENDENT_METHOD", "DEPENDENT_RATIO"
    private String claimText;
    private String statutoryRationale;

    public PatentClaimItem() {
    }

    public PatentClaimItem(int claimNumber, String type, String claimText, String statutoryRationale) {
        this.claimNumber = claimNumber;
        this.type = type;
        this.claimText = claimText;
        this.statutoryRationale = statutoryRationale;
    }

    public int getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(int claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getClaimText() {
        return claimText;
    }

    public void setClaimText(String claimText) {
        this.claimText = claimText;
    }

    public String getStatutoryRationale() {
        return statutoryRationale;
    }

    public void setStatutoryRationale(String statutoryRationale) {
        this.statutoryRationale = statutoryRationale;
    }
}
