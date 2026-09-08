package com.ayurveda.ipr.portal.model;

/**
 * Represents an Internationally Recognized Certificate of Compliance (IRCC)
 * published by the National Biodiversity Authority (NBA) of India on the UN ABS Clearing-House.
 */
public class AbschPermit {

    private String irccNumber;           // e.g. ABSCH-IRCC-IN-256843-1
    private String title;                // Title of permit
    private String issuingAuthority;     // National Biodiversity Authority, India
    private String issuanceDate;         // Publication date
    private String subjectMatter;        // Biological resource or TK covered
    private String usageType;            // Commercial vs Non-Commercial Research
    private String directUrl;            // Link to official UN CBD portal

    public AbschPermit() {
    }

    public AbschPermit(String irccNumber, String title, String issuingAuthority, 
                       String issuanceDate, String subjectMatter, String usageType, String directUrl) {
        this.irccNumber = irccNumber;
        this.title = title;
        this.issuingAuthority = issuingAuthority;
        this.issuanceDate = issuanceDate;
        this.subjectMatter = subjectMatter;
        this.usageType = usageType;
        this.directUrl = directUrl;
    }

    // Getters and Setters
    public String getIrccNumber() {
        return irccNumber;
    }

    public void setIrccNumber(String irccNumber) {
        this.irccNumber = irccNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIssuingAuthority() {
        return issuingAuthority;
    }

    public void setIssuingAuthority(String issuingAuthority) {
        this.issuingAuthority = issuingAuthority;
    }

    public String getIssuanceDate() {
        return issuanceDate;
    }

    public void setIssuanceDate(String issuanceDate) {
        this.issuanceDate = issuanceDate;
    }

    public String getSubjectMatter() {
        return subjectMatter;
    }

    public void setSubjectMatter(String subjectMatter) {
        this.subjectMatter = subjectMatter;
    }

    public String getUsageType() {
        return usageType;
    }

    public void setUsageType(String usageType) {
        this.usageType = usageType;
    }

    public String getDirectUrl() {
        return directUrl;
    }

    public void setDirectUrl(String directUrl) {
        this.directUrl = directUrl;
    }
}
