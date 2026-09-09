package com.ayurveda.ipr.document.model;

import com.ayurveda.ipr.chat.model.ChatMessageResponse;

/**
 * Complete response returning both the extracted document profile and the full 5-Pillar statutory assessment.
 */
public class DocumentAnalysisResponse {

    private ExtractedDocumentProfile extractedProfile;
    private ChatMessageResponse assessment;

    public DocumentAnalysisResponse() {
    }

    public DocumentAnalysisResponse(ExtractedDocumentProfile extractedProfile, ChatMessageResponse assessment) {
        this.extractedProfile = extractedProfile;
        this.assessment = assessment;
    }

    public ExtractedDocumentProfile getExtractedProfile() {
        return extractedProfile;
    }

    public void setExtractedProfile(ExtractedDocumentProfile extractedProfile) {
        this.extractedProfile = extractedProfile;
    }

    public ChatMessageResponse getAssessment() {
        return assessment;
    }

    public void setAssessment(ChatMessageResponse assessment) {
        this.assessment = assessment;
    }
}
