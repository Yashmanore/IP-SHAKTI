package com.ayurveda.ipr.chat.model;

/**
 * Sequential governmental action roadmap item for AYUSH innovators:
 * e.g., AYUSH Form 25-D -> NBA Form 1/3 -> InPASS Patent Application -> Trade Marks Registry.
 */
public class ActionRoadmapItem {

    private int stepNumber;
    private String phase; // e.g., "REGULATORY_COMPLIANCE", "BIODIVERSITY_APPROVAL", "IPR_FILING"
    private String action;
    private String authority;
    private String governingAct;
    private String portalName;
    private String portalUrl;
    private boolean mandatory;
    private String estimatedTimeline;

    public ActionRoadmapItem() {
    }

    public ActionRoadmapItem(int stepNumber, String phase, String action, String authority, 
                             String governingAct, String portalName, String portalUrl, 
                             boolean mandatory, String estimatedTimeline) {
        this.stepNumber = stepNumber;
        this.phase = phase;
        this.action = action;
        this.authority = authority;
        this.governingAct = governingAct;
        this.portalName = portalName;
        this.portalUrl = portalUrl;
        this.mandatory = mandatory;
        this.estimatedTimeline = estimatedTimeline;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }

    public String getGoverningAct() {
        return governingAct;
    }

    public void setGoverningAct(String governingAct) {
        this.governingAct = governingAct;
    }

    public String getPortalName() {
        return portalName;
    }

    public void setPortalName(String portalName) {
        this.portalName = portalName;
    }

    public String getPortalUrl() {
        return portalUrl;
    }

    public void setPortalUrl(String portalUrl) {
        this.portalUrl = portalUrl;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }

    public String getEstimatedTimeline() {
        return estimatedTimeline;
    }

    public void setEstimatedTimeline(String estimatedTimeline) {
        this.estimatedTimeline = estimatedTimeline;
    }
}
