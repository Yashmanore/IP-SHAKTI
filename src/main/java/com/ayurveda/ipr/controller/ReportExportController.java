package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.chat.model.ChatMessageRequest;
import com.ayurveda.ipr.chat.model.ChatMessageResponse;
import com.ayurveda.ipr.chat.service.ChatOrchestratorService;
import com.ayurveda.ipr.document.model.DocumentAnalysisResponse;
import com.ayurveda.ipr.document.model.ExtractedDocumentProfile;
import com.ayurveda.ipr.report.service.EmailDispatchService;
import com.ayurveda.ipr.report.service.PdfDossierGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API for generating, downloading, and emailing exhaustive PDF Legal Dossiers.
 */
@RestController
@RequestMapping("/api/v1/report")
@Tag(name = "Report Generation & Email", description = "Multi-page legal PDF dossier generation and registered email dispatch")
@CrossOrigin(origins = "*")
public class ReportExportController {

    private static final Logger log = LoggerFactory.getLogger(ReportExportController.class);

    private final PdfDossierGenerationService pdfDossierGenerationService;
    private final EmailDispatchService emailDispatchService;
    private final ChatOrchestratorService chatOrchestratorService;

    public ReportExportController(
            PdfDossierGenerationService pdfDossierGenerationService,
            EmailDispatchService emailDispatchService,
            ChatOrchestratorService chatOrchestratorService) {
        this.pdfDossierGenerationService = pdfDossierGenerationService;
        this.emailDispatchService = emailDispatchService;
        this.chatOrchestratorService = chatOrchestratorService;
    }

    @GetMapping(value = "/download/{sessionId}", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(
            summary = "Download minute 7-Pillar PDF Legal Dossier",
            description = "Compiles executive summary, Rule 158-B classification, Section 3(p) defense, NBA checklist, synthesized patent claims, and statutory citations into a high-resolution PDF."
    )
    @ApiResponse(responseCode = "200", description = "PDF stream returned successfully")
    public ResponseEntity<byte[]> downloadDossierPdf(
            @Parameter(description = "Session UUID") @PathVariable("sessionId") String sessionId,
            @Parameter(description = "Optional product name") @RequestParam(value = "productName", required = false) String productName,
            @Parameter(description = "Optional applicant name") @RequestParam(value = "applicantName", required = false) String applicantName,
            @Parameter(description = "Optional recipient email") @RequestParam(value = "recipientEmail", required = false) String recipientEmail) {

        String targetProduct = (productName != null && !productName.isBlank()) ? productName.trim() : "Triphala";
        String targetApplicant = (applicantName != null && !applicantName.isBlank()) ? applicantName.trim() : "Registered Ayurvedic Innovator";
        String targetEmail = (recipientEmail != null && !recipientEmail.isBlank()) ? recipientEmail.trim() : "registered.user@domain.in";

        log.info("Request to generate & download PDF Dossier for Session '{}', Product '{}', Applicant '{}'", sessionId, targetProduct, targetApplicant);
        ChatMessageResponse response = buildOrFetchAssessment(sessionId, targetProduct);

        ExtractedDocumentProfile profile = buildSyntheticProfile(targetApplicant, targetEmail, targetProduct, response);
        byte[] pdfBytes = pdfDossierGenerationService.generateDossierPdf(response, profile);

        String filename = "IP_SHAKTI_Legal_Dossier_" + targetProduct.replaceAll("[^a-zA-Z0-9_-]", "_") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    public record EmailDossierRequest(String recipientEmail, String applicantName, String productName) {}

    @PostMapping(value = "/email/{sessionId}")
    @Operation(
            summary = "Email PDF Legal Dossier to registered applicant",
            description = "Generates the exhaustive PDF dossier and dispatches it as an email attachment to the registered email."
    )
    @ApiResponse(responseCode = "200", description = "Email dispatch status")
    public ResponseEntity<EmailDispatchService.EmailDispatchResult> emailDossierPdf(
            @Parameter(description = "Session UUID") @PathVariable("sessionId") String sessionId,
            @RequestBody(required = false) EmailDossierRequest request) {

        String email = (request != null && request.recipientEmail() != null && !request.recipientEmail().isBlank())
                ? request.recipientEmail().trim() : "innovator@registered.ayush.gov.in";
        String applicant = (request != null && request.applicantName() != null && !request.applicantName().isBlank())
                ? request.applicantName().trim() : "Registered Ayurvedic Innovator";
        String product = (request != null && request.productName() != null && !request.productName().isBlank())
                ? request.productName().trim() : "Triphala";

        ChatMessageResponse response = buildOrFetchAssessment(sessionId, product);
        ExtractedDocumentProfile profile = buildSyntheticProfile(applicant, email, product, response);
        byte[] pdfBytes = pdfDossierGenerationService.generateDossierPdf(response, profile);

        EmailDispatchService.EmailDispatchResult result = emailDispatchService.sendDossierEmail(
                email, applicant, product, sessionId, pdfBytes);

        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/generate-from-analysis", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(
            summary = "Generate PDF Dossier directly from Document Analysis result",
            description = "Receives a full DocumentAnalysisResponse payload and generates the multi-page legal PDF dossier."
    )
    @ApiResponse(responseCode = "200", description = "Binary PDF stream")
    public ResponseEntity<byte[]> generateFromDocumentAnalysis(@RequestBody DocumentAnalysisResponse docResponse) {
        byte[] pdfBytes = pdfDossierGenerationService.generateDossierPdf(docResponse);
        String sessionId = (docResponse.getAssessment() != null && docResponse.getAssessment().getSessionId() != null)
                ? docResponse.getAssessment().getSessionId() : "analysis";
        String filename = "IP_SHAKTI_Dossier_" + sessionId.substring(0, Math.min(8, sessionId.length())) + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping(value = "/email-analysis-dossier")
    @Operation(
            summary = "Generate & Email PDF Dossier from Document Analysis result",
            description = "Generates the PDF from DocumentAnalysisResponse and dispatches it directly to the applicant's email extracted from the document."
    )
    public ResponseEntity<EmailDispatchService.EmailDispatchResult> emailFromDocumentAnalysis(
            @RequestBody DocumentAnalysisResponse docResponse,
            @RequestParam(value = "recipientEmail", required = false) String overrideEmail) {

        byte[] pdfBytes = pdfDossierGenerationService.generateDossierPdf(docResponse);

        String email = overrideEmail;
        String applicantName = "Ayurvedic Innovator";
        String productName = "Ayurvedic Formulation";
        String sessionId = "analysis-session";

        if (docResponse.getExtractedProfile() != null) {
            if (docResponse.getExtractedProfile().getApplicantCredentials() != null) {
                if (email == null || email.isBlank()) {
                    email = docResponse.getExtractedProfile().getApplicantCredentials().getEmailAddress();
                }
                if (docResponse.getExtractedProfile().getApplicantCredentials().getApplicantName() != null) {
                    applicantName = docResponse.getExtractedProfile().getApplicantCredentials().getApplicantName();
                }
            }
            if (docResponse.getExtractedProfile().getProductDetails() != null) {
                if (docResponse.getExtractedProfile().getProductDetails().getProductName() != null) {
                    productName = docResponse.getExtractedProfile().getProductDetails().getProductName();
                }
            }
        }
        if (docResponse.getAssessment() != null && docResponse.getAssessment().getSessionId() != null) {
            sessionId = docResponse.getAssessment().getSessionId();
        }

        EmailDispatchService.EmailDispatchResult result = emailDispatchService.sendDossierEmail(
                email, applicantName, productName, sessionId, pdfBytes);

        return ResponseEntity.ok(result);
    }

    private ChatMessageResponse buildOrFetchAssessment(String sessionId, String productName) {
        String targetProduct = (productName != null && !productName.isBlank()) ? productName.trim() : "Triphala";
        ChatMessageRequest request = new ChatMessageRequest();
        request.setSessionId(sessionId);
        request.setMessage("Provide comprehensive 5-Pillar statutory advisory report for " + targetProduct);
        request.setProductName(targetProduct);
        request.setJurisdiction("INDIA");

        Map<String, String> answers = new HashMap<>();
        String lower = targetProduct.toLowerCase();
        boolean isClassicalText = lower.contains("triphala") || lower.contains("chyawanprash") || lower.contains("trikatu") || lower.contains("sitopaladi");
        answers.put("isClassical", isClassicalText ? "YES" : "NO");
        answers.put("technicalNovelty", "NANO_EXTRACT");
        request.setClarificationAnswers(answers);

        return chatOrchestratorService.processMessage(request);
    }

    private ExtractedDocumentProfile buildSyntheticProfile(String applicant, String email, String product, ChatMessageResponse chatResponse) {
        ExtractedDocumentProfile profile = new ExtractedDocumentProfile();
        ExtractedDocumentProfile.ApplicantCredentials creds = new ExtractedDocumentProfile.ApplicantCredentials();
        creds.setApplicantName(applicant);
        creds.setAadhaarNumber("[VERIFIED_AADHAAR]");
        creds.setPanNumber("[VERIFIED_PAN]");
        creds.setPhoneNumber("+91 98765 43210");
        creds.setEmailAddress(email);
        profile.setApplicantCredentials(creds);

        List<String> botanicals = new ArrayList<>();
        if (chatResponse != null && chatResponse.getPillars() != null && chatResponse.getPillars().getTkdlCheck() != null) {
            String bBinomial = chatResponse.getPillars().getTkdlCheck().getBotanicalBinomial();
            if (bBinomial != null && !bBinomial.isBlank()) {
                botanicals.add(bBinomial);
            }
        }
        if (botanicals.isEmpty()) {
            String lower = product.toLowerCase();
            if (lower.contains("triphala")) {
                botanicals.add("Terminalia chebula");
                botanicals.add("Terminalia bellirica");
                botanicals.add("Phyllanthus emblica (Emblica officinalis)");
            } else {
                botanicals.add(product);
            }
        }

        String regCategory = (chatResponse != null && chatResponse.getPillars() != null && chatResponse.getPillars().getRegulatoryAnalysis() != null && chatResponse.getPillars().getRegulatoryAnalysis().getProductCategory() != null)
                ? chatResponse.getPillars().getRegulatoryAnalysis().getProductCategory()
                : "PROPRIETARY_AYURVEDIC_MEDICINE";

        ExtractedDocumentProfile.ProductDetails details = new ExtractedDocumentProfile.ProductDetails();
        details.setProductName(product);
        details.setBotanicalBinomials(botanicals);
        details.setRegulatoryCategory(regCategory);
        details.setDocumentTitle("Classical Ayurvedic Scripture / Ayurvedic Formulary of India (AFI)");
        details.setGoverningActAndRules("Drugs and Cosmetics Rules 1945, Rule 158-B");
        details.setLicensingAuthority("State AYUSH Licensing Authority");
        profile.setProductDetails(details);
        return profile;
    }
}
