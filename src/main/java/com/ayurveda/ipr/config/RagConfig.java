package com.ayurveda.ipr.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
     * In-process, 100% Free & Open-Source embedding model using ONNX runtime.
     * Produces vectors of EXACTLY 384 dimensions.
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        log.info("Initializing in-process AllMiniLmL6V2EmbeddingModel (dimension: 384)");
        System.gc();
        return new AllMiniLmL6V2EmbeddingModel();
    }

    /**
     * PostgreSQL + pgvector EmbeddingStore using LangChain4j.
     * The vector column dimension MUST strictly match the model dimension (384).
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        log.info("Configuring PgVectorEmbeddingStore on table '{}' with vector dimension {}", tableName, embeddingDimension);

        // Parse host, port, database from JDBC URL if needed, or extract standard parameters
        String host = "localhost";
        int port = 5432;
        String database = "ipshakti_db";

        try {
            // e.g. jdbc:postgresql://localhost:5432/ipshakti_db
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
}
