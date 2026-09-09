package com.ayurveda.ipr.report;

import com.ayurveda.ipr.chat.model.*;
import com.ayurveda.ipr.document.model.ExtractedDocumentProfile;
import com.ayurveda.ipr.report.service.PdfDossierGenerationService;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class PdfDossierGenerationTest {

    @Test
    public void testGenerateComprehensiveDossierPdf() throws Exception {
        PdfDossierGenerationService service = new PdfDossierGenerationService();

        // 1. Prepare Mock ChatMessageResponse
        ChatMessageResponse chatResponse = new ChatMessageResponse();
        chatResponse.setSessionId("test-session-uuid-9842145");
        chatResponse.setStatus(ChatMessageResponse.DialogueStatus.ASSESSMENT_COMPLETE);
        chatResponse.setJurisdiction("INDIA");

        ConfidenceScore score = new ConfidenceScore();
        score.setOverallScore(88);
        score.setLevel("HIGH");
        chatResponse.setConfidenceScore(score);

        // 2. Prepare Mock Extracted Profile
        ExtractedDocumentProfile profile = new ExtractedDocumentProfile("patent.pdf", "PDF", 5738);
        profile.getApplicantCredentials().setApplicantName("Dr. Sunita Deshmukh / AyurCosmeceuticals Pvt Ltd");
        profile.getApplicantCredentials().setAadhaarNumber("9876 5432 1098");
        profile.getApplicantCredentials().setPanNumber("ABCDE1234F");
        profile.getApplicantCredentials().setPhoneNumber("+91 9822012345");
        profile.getApplicantCredentials().setEmailAddress("dr.deshmukh@ayurcosmeceuticals.in");

        profile.getProductDetails().setDocumentTitle("A SYNERGISTIC PHYTO-LIPOSOMAL TOPICAL COSMETIC COMPOSITION");
        profile.getProductDetails().setProductName("Haridra & Kumkumadi Phyto-Liposomal Radiance Cream");
        profile.getProductDetails().setBotanicalBinomials(List.of("Curcuma longa", "Crocus sativus", "Pterocarpus santalinus"));
        profile.getProductDetails().setRegulatoryCategory("AYURVEDIC_COSMETIC");
        profile.getProductDetails().setGoverningActAndRules("Drugs and Cosmetics Act 1940 Section 3(aaa), Rule 158-B");
        profile.getProductDetails().setLicensingAuthority("FDA Maharashtra / State AYUSH Licensing Authority");

        // 3. Prepare Pillars
        FivePillarsResponse pillars = new FivePillarsResponse();
        var ip = new FivePillarsResponse.IpPillar();
        ip.setPatentableInIndia(true);
        ip.setVerdict("Patentable under Section 2(1)(j). Overcomes Section 3(p) via sub-micron lipid bilayer encapsulation (110-140 nm).");
        ip.setFilingStrategy("File Indian Provisional with data proving non-staining kinetics and Combination Index CI = 0.62.");
        ip.setWipoGratkDisclosure("Mandatory geographical origin disclosure: Curcuma longa (Maharashtra) and Crocus sativus (Jammu & Kashmir).");
        pillars.setIpAnalysis(ip);

        var reg = new FivePillarsResponse.RegulatoryPillar();
        reg.setProductCategory("Ayurvedic Cosmetic (Form 32-A)");
        reg.setGoverningActAndRules("Drugs and Cosmetics Act Section 3(aaa) & Rule 158-B");
        reg.setLicensingAuthority("FDA Maharashtra (State Licensing Authority)");
        reg.setClinicalTrialObligation("Clinical trials exempt; BIS IS 4707 Part 1 & 2 safety tests mandatory.");
        pillars.setRegulatoryAnalysis(reg);

        var abs = new FivePillarsResponse.AbsPillar();
        abs.setComplianceStatus("Prior intimation to Maharashtra State Biodiversity Board (MSBB) required under Section 7.");
        abs.setRequiredForm("MSBB Section 7 Intimation Form (Commercial Utilization)");
        pillars.setAbsCheck(abs);

        var tkdl = new FivePillarsResponse.TkdlPillar();
        tkdl.setPriorArtRiskWarning("High prior art density for Haridra and Kumkumadi Tailam in classical texts and TKDL.");
        pillars.setTkdlCheck(tkdl);

        StatutorySourceCitation c1 = new StatutorySourceCitation();
        c1.setDocumentTitle("The Patents Act, 1970");
        c1.setSectionReference("Section 3(p)");
        c1.setGoverningBody("Indian Patent Office");

        StatutorySourceCitation c2 = new StatutorySourceCitation();
        c2.setDocumentTitle("Drugs & Cosmetics Rules, 1945");
        c2.setSectionReference("Rule 158-B");
        c2.setGoverningBody("AYUSH / CDSCO");

        StatutorySourceCitation c3 = new StatutorySourceCitation();
        c3.setDocumentTitle("Biological Diversity Act, 2002");
        c3.setSectionReference("Section 7");
        c3.setGoverningBody("Maharashtra SBB");

        pillars.setSources(List.of(c1, c2, c3));
        chatResponse.setPillars(pillars);


        // 4. Prepare LLM Deliverables & Claims
        ExecutiveLegalDeliverables deliverables = new ExecutiveLegalDeliverables();
        deliverables.setExecutiveSummary(new ExecutiveLegalDeliverables.ExecutiveSummary(
                "Phyto-Liposomal Haridra Formulation",
                88,
                "HIGH",
                "Section 3(p) TKDL Traditional Knowledge Bar",
                "Novel Sub-micron Phospholipid Carrier Encapsulation"
        ));

        ExecutiveLegalDeliverables.DraftClaimsPackage claimsPkg = new ExecutiveLegalDeliverables.DraftClaimsPackage();
        claimsPkg.setClaims(List.of(
                new PatentClaimItem(1, "INDEPENDENT_PRODUCT",
                        "A synergistic topical phyto-liposomal cosmetic composition comprising Curcuma longa and Crocus sativus extracts encapsulated within sub-micron vesicles (110-140 nm) with hydrogenated phosphatidylcholine.",
                        "Overcomes Section 3(p) by providing an engineered lipid matrix not documented in traditional texts."),
                new PatentClaimItem(2, "DEPENDENT_PROCESS",
                        "A process for preparing the cosmetic composition of Claim 1, comprising rotary thin-film hydration at 45 deg C and high-pressure microfluidization at 800 bar.",
                        "Patentable manufacturing method under Section 2(1)(j).")
        ));
        deliverables.setDraftPatentClaims(claimsPkg);
        chatResponse.setLlmDeliverables(deliverables);

        // 5. Prepare Action Roadmap
        chatResponse.setActionRoadmap(List.of(
                new ActionRoadmapItem(1, "REGULATORY_COMPLIANCE", "Apply for Form 32-A Cosmetic License from FDA Maharashtra", "FDA Maharashtra", "D&C Act Sec 3(aaa)", "FDA Portal", "https://fda.maharashtra.gov.in", true, "30-60 days"),
                new ActionRoadmapItem(2, "BIODIVERSITY_APPROVAL", "Submit Section 7 Intimation to Maharashtra State Biodiversity Board", "MSBB", "BD Act 2002 Sec 7", "MSBB Portal", "https://msbb.gov.in", true, "30 days"),
                new ActionRoadmapItem(3, "IPR_PATENT_FILING", "File Provisional Patent Application with Form 1 & 2 at Indian Patent Office (Mumbai)", "Indian Patent Office", "Patents Act §2(1)(j)", "InPASS", "https://ipindiaonline.gov.in", true, "1-3 days")
        ));

        // Generate PDF
        byte[] pdfBytes = service.generateDossierPdf(chatResponse, profile);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 5000, "PDF size must be substantial (> 5KB)");

        // Save generated artifact for inspection
        File outputDir = new File("sample_data_for_test");
        if (!outputDir.exists()) outputDir.mkdirs();
        File outputFile = new File(outputDir, "generated_dossier_sample.pdf");
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            fos.write(pdfBytes);
        }

        System.out.println("SUCCESS: Generated comprehensive PDF Dossier at: " + outputFile.getAbsolutePath() + " (" + pdfBytes.length + " bytes)");
    }
}
