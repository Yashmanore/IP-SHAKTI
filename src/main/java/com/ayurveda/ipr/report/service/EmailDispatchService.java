package com.ayurveda.ipr.report.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Sovereign Email Dispatch Service delivering the compiled PDF Legal Dossier
 * directly to the innovator's registered email inbox.
 */
@Service
public class EmailDispatchService {

    private static final Logger log = LoggerFactory.getLogger(EmailDispatchService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:support@ip-shakti.gov.in}")
    private String senderEmail;

    @Autowired
    public EmailDispatchService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
        if (mailSender == null) {
            log.info("JavaMailSender is not configured. EmailDispatchService will operate in Simulation / Audit Logging mode.");
        } else {
            log.info("JavaMailSender successfully initialized for live registered email dispatch.");
        }
    }

    public record EmailDispatchResult(boolean success, String recipient, String message, String attachmentName) {}

    /**
     * Dispatches the generated PDF Legal Dossier to the registered recipient email address.
     */
    public EmailDispatchResult sendDossierEmail(
            String recipientEmail,
            String applicantName,
            String productName,
            String sessionId,
            byte[] pdfBytes) {

        if (recipientEmail == null || recipientEmail.isBlank() || recipientEmail.contains("[REDACTED")) {
            recipientEmail = "innovator@registered.ayush.gov.in";
        }

        String safeApplicant = (applicantName != null && !applicantName.isBlank()) ? applicantName : "Ayurvedic Innovator";
        String safeProduct = (productName != null && !productName.isBlank()) ? productName : "Ayurvedic Botanical Formulation";
        String timestamp = new SimpleDateFormat("dd-MMM-yyyy HH:mm").format(new Date());
        String attachmentFileName = "IP_SHAKTI_Legal_Dossier_" + sessionId.substring(0, Math.min(8, sessionId.length())) + ".pdf";

        // If JavaMailSender is not configured in environment, simulate and log
        if (mailSender == null) {
            log.info("[SIMULATED EMAIL DISPATCH] To: '{}' | Attachment: '{}' ({} bytes) | Session: '{}'",
                    recipientEmail, attachmentFileName, pdfBytes.length, sessionId);
            return new EmailDispatchResult(
                    true,
                    recipientEmail,
                    "Simulation Mode (SMTP Not Configured): Dossier generated and stored in audit log. To deliver live emails to your real Gmail inbox, set SPRING_MAIL_HOST, SPRING_MAIL_USERNAME, and SPRING_MAIL_PASSWORD (Gmail App Password).",
                    attachmentFileName
            );
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail, "IP-SHAKTI Sahayak");
            helper.setTo(recipientEmail);
            helper.setSubject("[IP-SHAKTI Sahayak] Statutory Legal Dossier & Patentability Advisory - " + safeProduct);

            String htmlBody = buildHtmlEmailContent(safeApplicant, safeProduct, sessionId, timestamp);
            helper.setText(htmlBody, true);

            // Attach PDF
            ByteArrayResource byteArrayResource = new ByteArrayResource(pdfBytes);
            helper.addAttachment(attachmentFileName, byteArrayResource, "application/pdf");

            mailSender.send(mimeMessage);
            log.info("Successfully dispatched Legal Dossier PDF via email to '{}' for Session '{}'", recipientEmail, sessionId);

            return new EmailDispatchResult(
                    true,
                    recipientEmail,
                    "Legal Dossier PDF successfully delivered to registered email: " + recipientEmail,
                    attachmentFileName
            );

        } catch (Exception e) {
            log.error("Failed to deliver Legal Dossier email to '{}': {}", recipientEmail, e.getMessage(), e);
            return new EmailDispatchResult(
                    false,
                    recipientEmail,
                    "Failed to send email: " + e.getMessage() + " (PDF download remains available)",
                    attachmentFileName
            );
        }
    }

    private String buildHtmlEmailContent(String applicantName, String productName, String sessionId, String timestamp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
                        .header { background-color: #0f2537; color: #ffffff; padding: 24px; text-align: center; }
                        .content { padding: 24px; background-color: #ffffff; }
                        .badge { display: inline-block; background-color: #1b5e20; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                        .card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0; }
                        .footer { background-color: #f3f4f6; color: #6b7280; padding: 16px; text-align: center; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin: 0;">IP-SHAKTI SAHAYAK 🇮🇳</h2>
                            <p style="margin: 4px 0 0 0; font-size: 13px; color: #f59e0b;">Official Ayurvedic IPR & Regulatory Advisory Report</p>
                        </div>
                        <div class="content">
                            <p>Dear <strong>%s</strong>,</p>
                            <p>Your comprehensive statutory assessment and patentability analysis for <strong>%s</strong> has been completed successfully.</p>
                            
                            <div class="card">
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;"><strong>Dossier Reference ID:</strong> <code>%s</code></p>
                                <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;"><strong>Generated At:</strong> %s</p>
                                <span class="badge">DPDP Act 2023 Compliant</span>
                            </div>

                            <p>Your official multi-page <strong>Advisory Dossier (PDF)</strong> is attached to this email. It contains exhaustive evaluations covering:</p>
                            <ul>
                                <li><strong>Executive Patentability Scorecard</strong> (0–100 risk rating)</li>
                                <li><strong>Rule 158-B Regulatory Classification</strong> (AYUSH / CDSCO / FSSAI licensing roadmap)</li>
                                <li><strong>Section 3(p) TKDL Clearance Analysis</strong> (Novelty & Synergism evidence)</li>
                                <li><strong>Biological Diversity Act Requirements</strong> (NBA Form I/III & State SBB intimation)</li>
                                <li><strong>Synthesized Draft Patent Claims</strong> (Product & Process claims formatted for the Indian Patent Office)</li>
                                <li><strong>Statutory Source Citations & Next Actions</strong></li>
                            </ul>

                            <p>If you have any questions, you may reply to this email or re-open your session in the IP-SHAKTI Sahayak portal.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated statutory report generated by IP-SHAKTI Sahayak (SIH Problem Statement 26045).</p>
                            <p>Confidential • Prepared in compliance with Digital Personal Data Protection Act, 2023.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(applicantName, productName, sessionId, timestamp);
    }
}
