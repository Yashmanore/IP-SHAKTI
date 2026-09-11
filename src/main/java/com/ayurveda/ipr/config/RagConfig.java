package com.ayurveda.ipr.config;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
public class RagConfig {

    private static final Logger log = LoggerFactory.getLogger(RagConfig.class);

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${rag.embedding.dimension:384}")
    private int embeddingDimension;

    @Value("${rag.vector-store.table-name:legal_document_embeddings}")
    private String tableName;

    @Value("${rag.vector-store.create-table:true}")
    private boolean createTable;

    @Value("${rag.vector-store.drop-table-first:false}")
    private boolean dropTableFirst;

    /**
     * Resilient, Lazy-Loaded Embedding Model.
     * Prevents OutOfMemory during Spring Boot startup on cloud instances with 512MB RAM.
     * Instantiates the ONNX model on-demand with automatic fallback.
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        log.info("Configuring LazyOnnxEmbeddingModel (target dimension: 384)...");
        return new LazyOnnxEmbeddingModel();
    }

    /**
     * PostgreSQL + pgvector EmbeddingStore using LangChain4j.
     * The vector column dimension MUST strictly match the model dimension (384).
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        log.info("Configuring PgVectorEmbeddingStore on table '{}' with vector dimension {}", tableName, embeddingDimension);

        String host = "localhost";
        int port = 5432;
        String database = "ipshakti_db";

        try {
            String cleanUrl = datasourceUrl.replace("jdbc:postgresql://", "");
            String[] parts = cleanUrl.split("/");
            if (parts.length > 0) {
                String hostPort = parts[0];
                if (hostPort.contains(":")) {
                    host = hostPort.split(":")[0];
                    port = Integer.parseInt(hostPort.split(":")[1]);
                } else {
                    host = hostPort;
                }
            }
            if (parts.length > 1) {
                database = parts[1].split("\\?")[0];
            }
        } catch (Exception e) {
            log.warn("Could not parse JDBC url '{}', falling back to localhost:5432/ipshakti_db", datasourceUrl);
        }

        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(database)
                .user(dbUser)
                .password(dbPassword)
                .table(tableName)
                .dimension(embeddingDimension)
                .createTable(createTable)
                .dropTableFirst(dropTableFirst)
                .build();
    }

    /**
     * Lazy-loading proxy for ONNX AllMiniLmL6V2EmbeddingModel.
     */
    public static class LazyOnnxEmbeddingModel implements EmbeddingModel {
        private volatile EmbeddingModel delegate;

        private synchronized EmbeddingModel getDelegate() {
            if (delegate == null) {
                try {
                    log.info("Lazy-initializing in-process AllMiniLmL6V2EmbeddingModel on demand...");
                    System.gc();
                    this.delegate = new AllMiniLmL6V2EmbeddingModel();
                    log.info("AllMiniLmL6V2EmbeddingModel initialized successfully.");
                } catch (Throwable t) {
                    log.warn("Could not load in-process ONNX model ({}). Falling back to deterministic embedding generator.", t.getMessage());
                    this.delegate = new DeterministicFallbackEmbeddingModel(384);
                }
            }
            return delegate;
        }

        @Override
        public Response<Embedding> embed(String text) {
            return getDelegate().embed(text);
        }

        @Override
        public Response<Embedding> embed(TextSegment textSegment) {
            return getDelegate().embed(textSegment);
        }

        @Override
        public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
            return getDelegate().embedAll(textSegments);
        }

        @Override
        public int dimension() {
            return 384;
        }
    }

    /**
     * Fallback deterministic embedding generator (384 dimensions) for low-memory container safety.
     */
    public static class DeterministicFallbackEmbeddingModel implements EmbeddingModel {
        private final int dimension;

        public DeterministicFallbackEmbeddingModel(int dimension) {
            this.dimension = dimension;
        }

        @Override
        public Response<Embedding> embed(String text) {
            float[] vector = new float[dimension];
            if (text != null && !text.isBlank()) {
                int hash = text.hashCode();
                Random rnd = new Random(hash);
                float sumSq = 0;
                for (int i = 0; i < dimension; i++) {
                    vector[i] = (float) rnd.nextGaussian();
                    sumSq += vector[i] * vector[i];
                }
                float norm = (float) Math.sqrt(sumSq);
                if (norm > 0) {
                    for (int i = 0; i < dimension; i++) {
                        vector[i] /= norm;
                    }
                }
            }
            return Response.from(Embedding.from(vector));
        }

        @Override
        public Response<Embedding> embed(TextSegment textSegment) {
            return embed(textSegment != null ? textSegment.text() : "");
        }

        @Override
        public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
            List<Embedding> list = new ArrayList<>();
            for (TextSegment seg : textSegments) {
                list.add(embed(seg).content());
            }
            return Response.from(list);
        }

        @Override
        public int dimension() {
            return dimension;
        }
    }
}
