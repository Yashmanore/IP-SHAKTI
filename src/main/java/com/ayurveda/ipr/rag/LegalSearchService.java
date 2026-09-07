package com.ayurveda.ipr.rag;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.filter.Filter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static dev.langchain4j.store.embedding.filter.MetadataFilterBuilder.metadataKey;

@Service
public class LegalSearchService {

    private static final Logger log = LoggerFactory.getLogger(LegalSearchService.class);

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public LegalSearchService(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    /**
     * Search pgvector strictly filtered by user-selected jurisdiction (INDIA vs INTERNATIONAL)
     */
    public List<Map<String, Object>> searchLegalCorpus(String query, String jurisdiction, int maxResults, double minScore) {
        log.info("Executing legal vector search | Query: '{}' | Jurisdiction Filter: '{}'", query, jurisdiction);

        // 1. Generate query embedding (384 dimensions)
        Embedding queryEmbedding = embeddingModel.embed(query).content();

        // 2. Strict jurisdiction filter: prevents mixing Indian and International laws
        Filter jurisdictionFilter = metadataKey("jurisdiction").isEqualTo(jurisdiction.toUpperCase());

        // 3. Search pgvector
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .filter(jurisdictionFilter)
                .maxResults(maxResults > 0 ? maxResults : 5)
                .minScore(minScore > 0 ? minScore : 0.65)
                .build();

        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(request);

        List<Map<String, Object>> results = new ArrayList<>();
        for (EmbeddingMatch<TextSegment> match : searchResult.matches()) {
            Map<String, Object> item = new HashMap<>();
            item.put("score", match.score());
            item.put("text", match.embedded().text());
            item.put("metadata", match.embedded().metadata().toMap());
            results.add(item);
        }

        return results;
    }
}
