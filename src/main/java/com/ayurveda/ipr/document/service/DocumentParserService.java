package com.ayurveda.ipr.document.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Multi-Format Document Parser supporting PDF, Microsoft Word (.docx), and plain text documents.
 */
@Service
public class DocumentParserService {

    private static final Logger log = LoggerFactory.getLogger(DocumentParserService.class);

    public record ParsedDocument(String fileName, String fileType, long fileSizeBytes, String rawText) {}

    /**
     * Parses an uploaded file into clean text.
     */
    public ParsedDocument parse(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is null or empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String lowerName = originalFilename.toLowerCase();
        long size = file.getSize();

        try (InputStream is = file.getInputStream()) {
            if (lowerName.endsWith(".pdf")) {
                return parsePdf(originalFilename, size, is);
            } else if (lowerName.endsWith(".docx")) {
                return parseDocx(originalFilename, size, is);
            } else if (lowerName.endsWith(".doc")) {
                // Word 97-2004 or docx with .doc extension
                try {
                    return parseDocx(originalFilename, size, is);
                } catch (Exception e) {
                    throw new UnsupportedOperationException("Legacy .doc format detected. Please save as modern .docx or .pdf.");
                }
            } else {
                // Default to UTF-8 text parser (txt, md, json, csv)
                return parsePlainText(originalFilename, size, is);
            }
        } catch (Exception e) {
            log.error("Failed to parse document '{}': {}", originalFilename, e.getMessage(), e);
            throw new RuntimeException("Could not extract text from document '" + originalFilename + "': " + e.getMessage(), e);
        }
    }

    private ParsedDocument parsePdf(String fileName, long size, InputStream is) throws Exception {
        try (PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            log.info("Parsed PDF '{}' with {} pages ({} chars extracted)", fileName, document.getNumberOfPages(), text.length());
            return new ParsedDocument(fileName, "PDF", size, text.trim());
        }
    }

    private ParsedDocument parseDocx(String fileName, long size, InputStream is) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
            String text = extractor.getText();
            log.info("Parsed DOCX '{}' ({} chars extracted)", fileName, text.length());
            return new ParsedDocument(fileName, "DOCX", size, text.trim());
        }
    }

    private ParsedDocument parsePlainText(String fileName, long size, InputStream is) throws Exception {
        byte[] bytes = is.readAllBytes();
        String text = new String(bytes, StandardCharsets.UTF_8);
        log.info("Parsed Plain Text document '{}' ({} chars extracted)", fileName, text.length());
        return new ParsedDocument(fileName, "TEXT", size, text.trim());
    }

    /**
     * Parses an inline text query or formulation description into a ParsedDocument.
     */
    public ParsedDocument parseTextQuery(String queryText) {
        String text = queryText != null ? queryText.trim() : "";
        return new ParsedDocument("text_query", "TEXT_QUERY", text.getBytes(StandardCharsets.UTF_8).length, text);
    }
}

