package com.ayurveda.ipr.report.service;

import com.ayurveda.ipr.chat.model.*;
import com.ayurveda.ipr.document.model.DocumentAnalysisResponse;
import com.ayurveda.ipr.document.model.ExtractedDocumentProfile;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * High-precision, publication-grade PDF Legal Dossier Generation Engine.
 * Generates an exhaustive statutory assessment covering:
 * 1. Executive Summary & Patentability Score (0-100 gauge)
 * 2. Rule 158-B & Regulatory Classification
 * 3. Section 3(p) TKDL Bar & Synergism Analysis
 * 4. Biological Diversity Act (NBA / SBB) Checklist
 * 5. Synthesized Draft Patent Claims (Claim 1 & 2)
 * 6. Statutory Source Citations & Immediate Action Roadmap
 * 7. DPDP Act 2023 Masking Stamp & Sovereign Disclaimer
 */
@Service
public class PdfDossierGenerationService {

    private static final Logger log = LoggerFactory.getLogger(PdfDossierGenerationService.class);

    // Sovereign Color Palette
    private static final Color PRIMARY_NAVY = new Color(15, 37, 55);       // #0F2537
    private static final Color AYURVEDA_GREEN = new Color(27, 94, 32);     // #1B5E20
    private static final Color SAFFRON_GOLD = new Color(198, 81, 2);       // #C65102
    private static final Color BG_LIGHT_GRAY = new Color(245, 247, 250);   // #F5F7FA
    private static final Color BORDER_GRAY = new Color(218, 224, 233);     // #DAE0E9
    private static final Color TEXT_MUTED = new Color(90, 107, 124);       // #5A6B7C

    // Typography
    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_NAVY);
    private static final Font FONT_SUBTITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, SAFFRON_GOLD);
    private static final Font FONT_SECTION_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, PRIMARY_NAVY);
    private static final Font FONT_BODY = FontFactory.getFont(FontFactory.HELVETICA, 9.5f, Color.DARK_GRAY);
    private static final Font FONT_BODY_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, Color.BLACK);
    private static final Font FONT_CLAIM = FontFactory.getFont(FontFactory.COURIER, 9.0f, new Color(20, 20, 20));
    private static final Font FONT_FOOTER = FontFactory.getFont(FontFactory.HELVETICA, 8.0f, TEXT_MUTED);

    /**
     * Generates a comprehensive PDF legal dossier from a ChatMessageResponse.
     */
    public byte[] generateDossierPdf(ChatMessageResponse chatResponse) {
        return generateDossierPdf(chatResponse, null);
    }

    /**
     * Generates a comprehensive PDF legal dossier combining both ChatMessageResponse and ExtractedDocumentProfile.
     */
    public byte[] generateDossierPdf(ChatMessageResponse chatResponse, ExtractedDocumentProfile profile) {
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            writer.setPageEvent(new HeaderFooterPageEvent());
            document.open();

            // 1. Header & Title Block
            buildHeaderBlock(document, chatResponse, profile);

            // 2. Applicant & Document Identification Registry
            buildApplicantRegistryTable(document, chatResponse, profile);

            // 3. 🏛️ Executive Summary & Patentability Score
            buildExecutiveSummarySection(document, chatResponse);

            // 4. 📋 Rule 158-B & Regulatory Classification
            buildRegulatoryClassificationSection(document, chatResponse, profile);

            // 5. 🛡️ Section 3(p) TKDL Bar & Synergism Analysis
            buildTraditionalKnowledgeSection(document, chatResponse, profile);

            // 6. 🌿 Biological Diversity Act (NBA / SBB) Checklist
            buildBiodiversitySection(document, chatResponse, profile);

            // 7. ⚖️ Synthesized Draft Patent Claims
            buildDraftClaimsSection(document, chatResponse);

            // 8. 📜 Statutory Source Citations & Immediate Action Roadmap
            buildCitationsAndRoadmapSection(document, chatResponse);

            // 9. 🔒 DPDP Act 2023 Masking Stamp & Official Disclaimer
            buildDpdpAndDisclaimerSection(document, chatResponse);

            document.close();
            log.info("Generated detailed PDF Dossier for Session '{}' ({} bytes)", chatResponse.getSessionId(), baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF Dossier: {}", e.getMessage(), e);
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Helper to generate PDF from DocumentAnalysisResponse.
     */
    public byte[] generateDossierPdf(DocumentAnalysisResponse docResponse) {
        if (docResponse == null) {
            throw new IllegalArgumentException("DocumentAnalysisResponse cannot be null");
        }
        return generateDossierPdf(docResponse.getAssessment(), docResponse.getExtractedProfile());
    }

    // =========================================================================
    // SECTION BUILDERS
    // =========================================================================

    private void buildHeaderBlock(Document doc, ChatMessageResponse chat, ExtractedDocumentProfile profile) throws DocumentException {
        Paragraph title = new Paragraph("IP-SHAKTI SAHAYAK 🇮🇳", FONT_TITLE);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);

        Paragraph subtitle = new Paragraph("OFFICIAL AYURVEDIC IPR & REGULATORY ADVISORY DOSSIER", FONT_SUBTITLE);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(4);
        doc.add(subtitle);

        Paragraph refLine = new Paragraph("Statutory Reference ID: " + chat.getSessionId() +
                "  |  Issued: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z").format(new Date()), FONT_FOOTER);
        refLine.setAlignment(Element.ALIGN_CENTER);
        refLine.setSpacingAfter(10);
        doc.add(refLine);

        LineSeparator ls = new LineSeparator(1.5f, 100, PRIMARY_NAVY, Element.ALIGN_CENTER, -2);
        doc.add(ls);
        doc.add(new Paragraph(" ", FontFactory.getFont(FontFactory.HELVETICA, 4)));
    }

    private void buildApplicantRegistryTable(Document doc, ChatMessageResponse chat, ExtractedDocumentProfile profile) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{22, 28, 22, 28});
        table.setSpacingBefore(6);
        table.setSpacingAfter(10);

        String applicantName = "Registered Ayurvedic Innovator";
        String aadhaar = "[REDACTED_AADHAAR]";
        String pan = "[REDACTED_PAN]";
        String contact = "+91 [VERIFIED_PHONE]";
        String email = "registered.user@domain.in";
        String productName = "Ayurvedic Botanical Complex";
        String category = "PROPRIETARY_AYURVEDIC_MEDICINE";

        if (profile != null) {
            if (profile.getApplicantCredentials() != null) {
                if (profile.getApplicantCredentials().getApplicantName() != null) applicantName = profile.getApplicantCredentials().getApplicantName();
                if (profile.getApplicantCredentials().getAadhaarNumber() != null) aadhaar = profile.getApplicantCredentials().getAadhaarNumber();
                if (profile.getApplicantCredentials().getPanNumber() != null) pan = profile.getApplicantCredentials().getPanNumber();
                if (profile.getApplicantCredentials().getPhoneNumber() != null) contact = profile.getApplicantCredentials().getPhoneNumber();
                if (profile.getApplicantCredentials().getEmailAddress() != null) email = profile.getApplicantCredentials().getEmailAddress();
            }
            if (profile.getProductDetails() != null) {
                if (profile.getProductDetails().getProductName() != null) productName = profile.getProductDetails().getProductName();
                if (profile.getProductDetails().getRegulatoryCategory() != null) category = profile.getProductDetails().getRegulatoryCategory();
            }
        }

        addHeaderCell(table, "APPLICANT & DOSSIER REGISTRY", 4, PRIMARY_NAVY);
        addCell(table, "Applicant Name:", true);
        addCell(table, applicantName, false);
        addCell(table, "Aadhaar Number:", true);
        addCell(table, aadhaar, false);

        addCell(table, "PAN Identification:", true);
        addCell(table, pan, false);
        addCell(table, "Contact Number:", true);
        addCell(table, contact, false);

        addCell(table, "Registered Email:", true);
        addCell(table, email, false);
        addCell(table, "Jurisdiction:", true);
        addCell(table, chat.getJurisdiction() != null ? chat.getJurisdiction() : "INDIA", false);

        addCell(table, "Target Product:", true);
        addCell(table, productName, false);
        addCell(table, "Regulatory Class:", true);
        addCell(table, category, false);

        doc.add(table);
    }

    private void buildExecutiveSummarySection(Document doc, ChatMessageResponse chat) throws DocumentException {
        addSectionHeader(doc, "1. 🏛️ Executive Summary & Patentability Scorecard");

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 35, 35});
        table.setSpacingBefore(4);
        table.setSpacingAfter(10);

        int score = 85;
        String level = "HIGH";
        String hurdle = "Section 3(p) Traditional Knowledge Bar";
        String strategy = "Demonstrate Synergistic Efficacy (CI < 0.7) or Novel Delivery System (NDDS)";

        if (chat.getConfidenceScore() != null) {
            score = (int) chat.getConfidenceScore().getOverallScore();
            level = chat.getConfidenceScore().getLevel();
        }
        if (chat.getLlmDeliverables() != null && chat.getLlmDeliverables().getExecutiveSummary() != null) {
            hurdle = chat.getLlmDeliverables().getExecutiveSummary().getPrimaryStatutoryHurdle();
            strategy = chat.getLlmDeliverables().getExecutiveSummary().getPrimaryDefensiveStrategy();
        }

        Color scoreColor = score >= 75 ? AYURVEDA_GREEN : (score >= 50 ? SAFFRON_GOLD : Color.RED);
        PdfPCell scoreCell = new PdfPCell();
        scoreCell.setBackgroundColor(BG_LIGHT_GRAY);
        scoreCell.setPadding(8);
        scoreCell.addElement(new Paragraph("PATENTABILITY SCORE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
        Paragraph scoreP = new Paragraph(score + " / 100", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, scoreColor));
        scoreCell.addElement(scoreP);
        scoreCell.addElement(new Paragraph("Confidence: " + level, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, scoreColor)));
        table.addCell(scoreCell);

        PdfPCell hurdleCell = new PdfPCell();
        hurdleCell.setBackgroundColor(BG_LIGHT_GRAY);
        hurdleCell.setPadding(8);
        hurdleCell.addElement(new Paragraph("PRIMARY STATUTORY HURDLE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
        hurdleCell.addElement(new Paragraph(hurdle, FONT_BODY_BOLD));
        table.addCell(hurdleCell);

        PdfPCell stratCell = new PdfPCell();
        stratCell.setBackgroundColor(BG_LIGHT_GRAY);
        stratCell.setPadding(8);
        stratCell.addElement(new Paragraph("DEFENSIVE PROSECUTION STRATEGY", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_MUTED)));
        stratCell.addElement(new Paragraph(strategy, FONT_BODY));
        table.addCell(stratCell);

        doc.add(table);
    }

    private void buildRegulatoryClassificationSection(Document doc, ChatMessageResponse chat, ExtractedDocumentProfile profile) throws DocumentException {
        addSectionHeader(doc, "2. 📋 Rule 158-B & Regulatory Classification Matrix");

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 70});
        table.setSpacingBefore(4);
        table.setSpacingAfter(10);

        String categoryName = "Proprietary Ayurvedic Medicine (Rule 158-B)";
        String act = "Drugs and Cosmetics Act 1940 & Rules 1945, Rule 158-B";
        String authority = "State AYUSH Licensing Authority (SLA)";
        String clinical = "Published safety data, acute toxicity test reports, and pilot clinical trial evidence under Rule 158-B(1)(B).";

        if (chat.getPillars() != null && chat.getPillars().getRegulatoryAnalysis() != null) {
            var reg = chat.getPillars().getRegulatoryAnalysis();
            if (reg.getProductCategory() != null) categoryName = reg.getProductCategory();
            if (reg.getGoverningActAndRules() != null) act = reg.getGoverningActAndRules();
            if (reg.getLicensingAuthority() != null) authority = reg.getLicensingAuthority();
            if (reg.getClinicalTrialObligation() != null) clinical = reg.getClinicalTrialObligation();
        }


        addCell(table, "Regulatory Verdict:", true);
        addCell(table, categoryName, false);
        addCell(table, "Governing Statutory Regime:", true);
        addCell(table, act, false);
        addCell(table, "Competent Licensing Authority:", true);
        addCell(table, authority, false);
        addCell(table, "Clinical & Safety Obligations:", true);
        addCell(table, clinical, false);

        doc.add(table);
    }

    private void buildTraditionalKnowledgeSection(Document doc, ChatMessageResponse chat, ExtractedDocumentProfile profile) throws DocumentException {
        addSectionHeader(doc, "3. 🛡️ Section 3(p) TKDL Bar & Synergism Defense");

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 70});
        table.setSpacingBefore(4);
        table.setSpacingAfter(10);

        String botanicals = "Curcuma longa, Withania somnifera";
        String tkdlRisk = "High prior art density indexed in TKDL. Raw extracts or traditional recipes face automatic rejection under Section 3(p).";
        String defense = "The formulation overcomes Section 3(p) by demonstrating synergistic bio-enhancement (Combination Index < 0.7) and novel micro-encapsulation not disclosed in classical Samhitas.";

        if (profile != null && profile.getProductDetails() != null && !profile.getProductDetails().getBotanicalBinomials().isEmpty()) {
            botanicals = String.join(", ", profile.getProductDetails().getBotanicalBinomials());
        }
        if (chat.getPillars() != null && chat.getPillars().getTkdlCheck() != null) {
            if (chat.getPillars().getTkdlCheck().getPriorArtRiskWarning() != null) {
                tkdlRisk = chat.getPillars().getTkdlCheck().getPriorArtRiskWarning();
            }
        }
        if (chat.getPillars() != null && chat.getPillars().getIpAnalysis() != null) {
            if (chat.getPillars().getIpAnalysis().getFilingStrategy() != null) {
                defense = chat.getPillars().getIpAnalysis().getFilingStrategy();
            }
        }

        addCell(table, "Active Botanical Binomials:", true);
        addCell(table, botanicals, false);
        addCell(table, "TKDL Prior-Art Risk Density:", true);
        addCell(table, tkdlRisk, false);
        addCell(table, "Section 3(p) & 3(e) Defense:", true);
        addCell(table, defense, false);

        doc.add(table);
    }

    private void buildBiodiversitySection(Document doc, ChatMessageResponse chat, ExtractedDocumentProfile profile) throws DocumentException {
        addSectionHeader(doc, "4. 🌿 Biological Diversity Act (NBA / SBB) Statutory Checklist");

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 70});
        table.setSpacingBefore(4);
        table.setSpacingAfter(10);

        String nbaStatus = "Prior intimation to State Biodiversity Board (SBB) required under Section 7 for Indian commercial entities.";
        String nbaForm = "SBB Form (Prior Intimation under Section 7) or Form III (NBA Chennai under Section 6(1) for patent grant).";
        String wipo = "Mandatory origin disclosure required under Article 3 of WIPO GRATK Treaty, 2024 and Patents Act Section 10(4)(d)(ii).";

        if (chat.getPillars() != null && chat.getPillars().getAbsCheck() != null) {
            var abs = chat.getPillars().getAbsCheck();
            if (abs.getComplianceStatus() != null) nbaStatus = abs.getComplianceStatus();
            if (abs.getRequiredForm() != null) nbaForm = abs.getRequiredForm();
        }
        if (chat.getPillars() != null && chat.getPillars().getIpAnalysis() != null) {
            if (chat.getPillars().getIpAnalysis().getWipoGratkDisclosure() != null) {
                wipo = chat.getPillars().getIpAnalysis().getWipoGratkDisclosure();
            }
        }

        addCell(table, "National Biodiversity Authority:", true);
        addCell(table, nbaStatus, false);
        addCell(table, "Required Statutory ABS Form:", true);
        addCell(table, nbaForm, false);
        addCell(table, "WIPO GRATK Treaty (2024):", true);
        addCell(table, wipo, false);

        doc.add(table);
    }

    private void buildDraftClaimsSection(Document doc, ChatMessageResponse chat) throws DocumentException {
        addSectionHeader(doc, "5. ⚖️ Synthesized Draft Patent Claims (IPO Specification Format)");

        String claim1 = "Claim 1 (Independent Product Claim):\n" +
                "A synergistic topical or oral botanical composition comprising active fractions of Curcuma longa and Withania somnifera " +
                "formulated in a synergistic ratio exhibiting a Combination Index (CI) < 0.7, encapsulated within sub-micron lipid nano-vesicles (110-140 nm).";

        String claim2 = "Claim 2 (Dependent Process Claim):\n" +
                "A process for preparing the synergistic botanical composition of Claim 1, comprising rotary thin-film hydration, " +
                "high-pressure microfluidization at 800 bar, and stabilization with plant-derived phospholipids, devoid of synthetic chemical surfactants.";

        if (chat.getLlmDeliverables() != null && chat.getLlmDeliverables().getDraftPatentClaims() != null) {
            List<PatentClaimItem> items = chat.getLlmDeliverables().getDraftPatentClaims().getClaims();
            if (items != null && !items.isEmpty()) {
                if (items.size() > 0) claim1 = "Claim 1 (" + items.get(0).getType() + "):\n" + items.get(0).getClaimText();
                if (items.size() > 1) claim2 = "Claim 2 (" + items.get(1).getType() + "):\n" + items.get(1).getClaimText();
            }
        }

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(4);
        table.setSpacingAfter(10);

        PdfPCell c1 = new PdfPCell(new Phrase(claim1, FONT_CLAIM));
        c1.setBackgroundColor(new Color(250, 250, 250));
        c1.setPadding(8);
        c1.setBorderColor(BORDER_GRAY);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(claim2, FONT_CLAIM));
        c2.setBackgroundColor(new Color(250, 250, 250));
        c2.setPadding(8);
        c2.setBorderColor(BORDER_GRAY);
        table.addCell(c2);

        doc.add(table);
    }

    private void buildCitationsAndRoadmapSection(Document doc, ChatMessageResponse chat) throws DocumentException {
        addSectionHeader(doc, "6. 📜 Official Statutory Citations & Immediate Action Roadmap");

        // Citations Sub-table
        PdfPTable citeTable = new PdfPTable(3);
        citeTable.setWidthPercentage(100);
        citeTable.setWidths(new float[]{35, 25, 40});
        citeTable.setSpacingBefore(4);
        citeTable.setSpacingAfter(8);

        addHeaderCell(citeTable, "STATUTE / REGULATION", 1, PRIMARY_NAVY);
        addHeaderCell(citeTable, "SECTION / RULE", 1, PRIMARY_NAVY);
        addHeaderCell(citeTable, "GOVERNING BODY", 1, PRIMARY_NAVY);

        if (chat.getPillars() != null && chat.getPillars().getSources() != null && !chat.getPillars().getSources().isEmpty()) {
            for (StatutorySourceCitation c : chat.getPillars().getSources()) {
                addCell(citeTable, c.getDocumentTitle(), false);
                addCell(citeTable, c.getSectionReference(), false);
                addCell(citeTable, c.getGoverningBody() != null ? c.getGoverningBody() : "Indian Patent Office / AYUSH", false);
            }
        } else {
            addCell(citeTable, "The Patents Act, 1970", false);
            addCell(citeTable, "Section 3(p) & Section 3(e)", false);
            addCell(citeTable, "Indian Patent Office (IPO / DPIIT)", false);

            addCell(citeTable, "Drugs and Cosmetics Rules, 1945", false);
            addCell(citeTable, "Rule 158-B", false);
            addCell(citeTable, "State AYUSH Licensing Authority", false);

            addCell(citeTable, "Biological Diversity Act, 2002", false);
            addCell(citeTable, "Section 3, 6 & 7", false);
            addCell(citeTable, "National Biodiversity Authority (NBA)", false);
        }
        doc.add(citeTable);

        // Roadmap Sub-table
        PdfPTable roadTable = new PdfPTable(4);
        roadTable.setWidthPercentage(100);
        roadTable.setWidths(new float[]{10, 30, 35, 25});
        roadTable.setSpacingBefore(4);
        roadTable.setSpacingAfter(10);

        addHeaderCell(roadTable, "STEP", 1, AYURVEDA_GREEN);
        addHeaderCell(roadTable, "PHASE", 1, AYURVEDA_GREEN);
        addHeaderCell(roadTable, "ACTION ITEM", 1, AYURVEDA_GREEN);
        addHeaderCell(roadTable, "ESTIMATED TIMELINE", 1, AYURVEDA_GREEN);

        if (chat.getActionRoadmap() != null && !chat.getActionRoadmap().isEmpty()) {
            for (ActionRoadmapItem item : chat.getActionRoadmap()) {
                addCell(roadTable, String.valueOf(item.getStepNumber()), false);
                addCell(roadTable, item.getPhase(), true);
                addCell(roadTable, item.getAction(), false);
                addCell(roadTable, item.getEstimatedTimeline(), false);
            }
        } else {
            addCell(roadTable, "1", false);
            addCell(roadTable, "REGULATORY_COMPLIANCE", true);
            addCell(roadTable, "Apply for State AYUSH Manufacturing License under Rule 158-B", false);
            addCell(roadTable, "60-90 days", false);

            addCell(roadTable, "2", false);
            addCell(roadTable, "BIODIVERSITY_APPROVAL", true);
            addCell(roadTable, "File Section 7 intimation to State Biodiversity Board", false);
            addCell(roadTable, "30-60 days", false);

            addCell(roadTable, "3", false);
            addCell(roadTable, "IPR_FILING", true);
            addCell(roadTable, "File Provisional Process Patent Application at Indian Patent Office", false);
            addCell(roadTable, "1-3 days", false);
        }
        doc.add(roadTable);
    }

    private void buildDpdpAndDisclaimerSection(Document doc, ChatMessageResponse chat) throws DocumentException {
        addSectionHeader(doc, "7. 🔒 DPDP Act 2023 Masking Stamp & Sovereign Legal Disclaimer");

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(4);
        table.setSpacingAfter(6);

        String dpdpText = "DPDP ACT 2023 SOVEREIGN SANITIZATION CERTIFICATE:\n" +
                "In strict compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India, all direct citizen " +
                "identifiers (including 12-digit Aadhaar UIDAI numbers, Income Tax PAN numbers, and private phone coordinates) have been " +
                "cryptographically masked into deterministic sovereign tokens prior to AI reasoning and persistent audit logging.\n\n" +
                "STATUTORY DISCLAIMER:\n" +
                "This document is an automated preliminary IPR and statutory triage report generated by the IP-SHAKTI Sahayak AI platform " +
                "(SIH PS 26045). It is issued for guidance and informational purposes only and does not substitute for formal legal " +
                "representation by an enrolled Indian Patent Agent, Advocate, or accredited AYUSH Regulatory Consultant.";

        PdfPCell cell = new PdfPCell(new Phrase(dpdpText, FontFactory.getFont(FontFactory.HELVETICA, 8.0f, TEXT_MUTED)));
        cell.setBackgroundColor(BG_LIGHT_GRAY);
        cell.setPadding(8);
        cell.setBorderColor(BORDER_GRAY);
        table.addCell(cell);

        doc.add(table);
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private void addSectionHeader(Document doc, String title) throws DocumentException {
        Paragraph p = new Paragraph(title, FONT_SECTION_HEADER);
        p.setSpacingBefore(6);
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void addHeaderCell(PdfPTable table, String text, int colspan, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8.5f, Color.WHITE)));
        cell.setColspan(colspan);
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        cell.setBorderColor(bgColor);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, boolean isBold) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "N/A", isBold ? FONT_BODY_BOLD : FONT_BODY));
        cell.setPadding(4.5f);
        cell.setBorderColor(BORDER_GRAY);
        table.addCell(cell);
    }

    /**
     * Header and Footer event handler stamping page numbers and confidentiality notice.
     */
    private static class HeaderFooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Phrase footer = new Phrase("IP-SHAKTI Sahayak (SIH 26045)  |  Page " + writer.getPageNumber() +
                    "  |  Confidential Statutory Advisory Dossier", FONT_FOOTER);
            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                    (document.right() - document.left()) / 2 + document.leftMargin(),
                    document.bottom() - 20, 0);
        }
    }
}
