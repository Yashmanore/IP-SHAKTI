package com.ayurveda.ipr.rag;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentSplitter;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class CorpusIngestionService {

    private static final Logger log = LoggerFactory.getLogger(CorpusIngestionService.class);

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    @Value("${rag.corpus.path:data/raw}")
    private String defaultCorpusPath;

    public CorpusIngestionService(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    /**
     * Ingest all 27 legal PDFs from data/raw into PostgreSQL pgvector
     */
    public Map<String, Object> ingestAll(String customPath) {
        String basePath = (customPath != null && !customPath.isBlank()) ? customPath : defaultCorpusPath;
        Path root = Paths.get(basePath).toAbsolutePath().normalize();

        log.info("Starting ingestion of legal corpus from: {}", root);
        Map<String, Object> report = new HashMap<>();

        if (!root.toFile().exists()) {
            log.error("Corpus root path does not exist: {}", root);
            report.put("status", "FAILED");
            report.put("error", "Directory not found: " + root);
            return report;
        }

        // Recursive legal document splitter (800 tokens max, 150 token overlap)
        DocumentSplitter splitter = DocumentSplitters.recursive(800, 150);

        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(splitter)
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        int totalPdfs = 0;

        // 1. National Corpus (India)
        totalPdfs += ingestFolder(ingestor, root.resolve("national/statutes"), "INDIA", "STATUTE");
        totalPdfs += ingestFolder(ingestor, root.resolve("national/rules"), "INDIA", "RULE");
        totalPdfs += ingestFolder(ingestor, root.resolve("national/forms"), "INDIA", "STATUTORY_FORM");

        // 2. International Corpus (Global)
        totalPdfs += ingestFolder(ingestor, root.resolve("international/treaties"), "INTERNATIONAL", "TREATY");
        totalPdfs += ingestFolder(ingestor, root.resolve("international/regulations"), "INTERNATIONAL", "REGULATION");

        report.put("status", "SUCCESS");
        report.put("total_documents_ingested", totalPdfs);
        report.put("target_vector_table", "legal_document_embeddings");
        report.put("dimension", 384);

        log.info("Ingestion completed! {} documents successfully processed into pgvector.", totalPdfs);
        return report;
    }

    private int ingestFolder(EmbeddingStoreIngestor ingestor, Path dirPath, String jurisdiction, String authorityType) {
        File folder = dirPath.toFile();
        if (!folder.exists() || !folder.isDirectory()) {
            log.warn("Directory not found: {}", dirPath);
            return 0;
        }

        File[] pdfs = folder.listFiles((d, name) -> name.toLowerCase().endsWith(".pdf"));
        if (pdfs == null || pdfs.length == 0) {
            return 0;
        }

        int count = 0;
        ApachePdfBoxDocumentParser parser = new ApachePdfBoxDocumentParser();

        for (File pdf : pdfs) {
            try {
                log.info("Ingesting [{} | {}]: {}", jurisdiction, authorityType, pdf.getName());

                Document doc = FileSystemDocumentLoader.loadDocument(pdf.toPath(), parser);

                // Inject crucial RAG metadata for jurisdiction switching & citation traceability
                doc.metadata()
                        .put("jurisdiction", jurisdiction)
                        .put("authority_type", authorityType)
                        .put("file_name", pdf.getName())
                        .put("file_path", pdf.getAbsolutePath());

                ingestor.ingest(doc);
                count++;
            } catch (Exception e) {
                log.error("Failed to ingest PDF: " + pdf.getName(), e);
            }
        }
        return count;
    }
}
