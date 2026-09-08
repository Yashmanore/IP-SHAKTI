package com.ayurveda.ipr.portal.model;

/**
 * Composite DTO aggregating live results from all 5 dynamic portals:
 * 1. CBD ABS Clearing-House (Live REST)
 * 2. InPASS (Indian Patent Office Boolean Syntax)
 * 3. WIPO PATENTSCOPE (International 1-Click Deep-Link)
 * 4. USPTO (35 U.S.C. 101/102 Query & Product of Nature Guidance)
 * 5. AYUSH Research Portal (Clinical Evidence & Rule 158-B Dossier Link)
 */
public class ExternalPortalsPayload {

    private String queryTerm;
    private AbschResponse abschCompliance;
    private InpassQueryResponse inpassSearch;
    private WipoQueryResponse wipoPatentscope;
    private UsptoQueryResponse usptoGuidance;
    private AyushEvidenceResponse ayushResearchEvidence;

    public ExternalPortalsPayload() {
    }

    public ExternalPortalsPayload(String queryTerm, AbschResponse abschCompliance, 
                                  InpassQueryResponse inpassSearch, WipoQueryResponse wipoPatentscope, 
                                  UsptoQueryResponse usptoGuidance, AyushEvidenceResponse ayushResearchEvidence) {
        this.queryTerm = queryTerm;
        this.abschCompliance = abschCompliance;
        this.inpassSearch = inpassSearch;
        this.wipoPatentscope = wipoPatentscope;
        this.usptoGuidance = usptoGuidance;
        this.ayushResearchEvidence = ayushResearchEvidence;
    }

    // Getters and Setters
    public String getQueryTerm() {
        return queryTerm;
    }

    public void setQueryTerm(String queryTerm) {
        this.queryTerm = queryTerm;
    }

    public AbschResponse getAbschCompliance() {
        return abschCompliance;
    }

    public void setAbschCompliance(AbschResponse abschCompliance) {
        this.abschCompliance = abschCompliance;
    }

    public InpassQueryResponse getInpassSearch() {
        return inpassSearch;
    }

    public void setInpassSearch(InpassQueryResponse inpassSearch) {
        this.inpassSearch = inpassSearch;
    }

    public WipoQueryResponse getWipoPatentscope() {
        return wipoPatentscope;
    }

    public void setWipoPatentscope(WipoQueryResponse wipoPatentscope) {
        this.wipoPatentscope = wipoPatentscope;
    }

    public UsptoQueryResponse getUsptoGuidance() {
        return usptoGuidance;
    }

    public void setUsptoGuidance(UsptoQueryResponse usptoGuidance) {
        this.usptoGuidance = usptoGuidance;
    }

    public AyushEvidenceResponse getAyushResearchEvidence() {
        return ayushResearchEvidence;
    }

    public void setAyushResearchEvidence(AyushEvidenceResponse ayushResearchEvidence) {
        this.ayushResearchEvidence = ayushResearchEvidence;
    }
}
