# IP-SHAKTI — Enhancement Implementation Plan

**Goal:** Make IP-SHAKTI more evidence-grounded, retrieval-accurate, context-aware, and capable of abstaining when evidence is insufficient — directly addressing every weakness exposed by the E2E test.

---

## Architecture Before vs After

**Current:**
```
User Query → Gatekeeper → RAG → LLM → Answer
```

**After these enhancements:**
```
User Query → Language Detection → Context-Aware Gatekeeper
   → Ayurvedic Entity Normalization + Query Expansion
   → Dense + BM25 → RRF Fusion → Reranker → Relevance Threshold
   → Deduplication → Contradiction Detection
   → Evidence-Grounded LLM → Abstention Check
   → Answer + Citations + Confidence Breakdown
```

---

## Priority 1 — Context-Aware Gatekeeper (Fix "NO" → OUT_OF_SCOPE bug)

> [!IMPORTANT]
> **Root Cause:** `checkDomainRelevance()` in `GeminiGenerativeService` receives only `userMsg` + product fields. When user sends `"NO"` as a clarification answer mid-conversation, it has no conversation context — so it fires as OUT_OF_SCOPE.

### Fix Strategy
In `ChatOrchestratorService.processMessage()`, before calling `checkDomainRelevance`, check whether the session is already **mid-clarification** (has prior messages). If it is, skip the gatekeeper and treat the input as a clarification answer.

### Files Changed

#### [MODIFY] [ChatOrchestratorService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/chat/service/ChatOrchestratorService.java)
- Add `isActiveClarificationSession(sessionId)` check using `ChatSessionMemoryService`
- If session has prior messages AND `clarificationAnswers` map is provided → skip gatekeeper entirely
- If session is fresh (no history) → run gatekeeper as usual
- Pass `conversationHistory` string into `checkDomainRelevance` for LLM-mode evaluation

#### [MODIFY] [GeminiGenerativeService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/llm/GeminiGenerativeService.java)
- Add overloaded `checkDomainRelevance(userInput, productName, ingredients, intendedUse, conversationHistory, targetLang)`
- In `buildRelevancePrompt()`: inject `CONVERSATION_HISTORY` section so LLM knows the prior domain context
- Deterministic fallback: if `conversationHistory` is non-empty and contains AYUSH keywords, bypass rejection

#### [NEW] Session Context Helper in `ChatSessionMemoryService.java`
- Add `boolean hasActiveSession(String sessionId)` — returns true if session has ≥ 1 prior message

---

## Priority 2 — Reranker + Relevance Threshold (Fix Ketaki → Kutaki mismatch)

> [!IMPORTANT]
> **Root Cause:** Dense cosine similarity matched "Ketaki" (Pandanus) with "Kutaki" because they share embedding space proximity. No threshold filter exists — all scores pass through to the user.

### Fix Strategy
1. **Post-retrieval Gemini Reranker:** After hybrid search returns candidates, run a lightweight Gemini reranking prompt that scores each chunk 0.0–1.0 for query relevance.
2. **Calibrated Score Normalization:** Convert raw cosine similarity (0.0–1.0) and RRF score (0.0–0.033) to a unified application-level `relevancePercent` (0–100).
3. **Relevance Threshold Filter:** Drop any result below `minRelevanceScore` (default 0.55 cosine / 40% calibrated).

### Files Changed

#### [NEW] [RerankerService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/rag/RerankerService.java)
New Spring `@Service` that:
- Takes `(query, List<SearchResult>)` as input
- For each result: builds a Gemini prompt asking "Rate relevance of this text to the query on scale 0.0 to 1.0 with reason"
- Parses JSON response `{score: 0.82, reason: "..."}`
- Falls back to cosine similarity if Gemini call fails
- Returns results sorted by reranker score, with `rerankerScore` and `rerankerReason` fields attached

#### [MODIFY] [LegalSearchService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/rag/LegalSearchService.java)
- After `searchHybrid()`, pass results through `RerankerService.rerank()`
- Normalize scores: `calibratedScore = (0.7 × cosineScore + 0.3 × rrfNormalized) × rerankerWeight`
- Add `filterByMinScore(results, 0.40)` to drop irrelevant documents
- Add `deduplicateByDocTitle(results)` — group same `doc_title` chunks, keep best-scored chunk per document
- Expose `calibratedScore` as a percentage in API response

#### [MODIFY] [RagController.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/controller/RagController.java)
- Return `relevancePercent` (int, 0–100) alongside raw `score` in search response
- Return `rerankerReason` field for transparency

---

## Priority 3 — Ayurvedic Entity Normalization + Query Expansion

> [!IMPORTANT]
> **Root Cause:** "Kutaki" and "Picrorhiza kurroa" are treated as unrelated strings. The search never expands to botanical synonyms.

### Fix Strategy
1. Build an in-memory `AyurvedicSynonymRegistry` (Java Map + JSON file).
2. Before embedding the query, expand it: `"Kutaki"` → `"Kutaki Picrorhiza kurroa hepatoprotective bitter tonic"`
3. Run multi-query retrieval: original query + synonym-expanded query → merge and deduplicate results.

### Files Changed

#### [NEW] [AyurvedicSynonymRegistry.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/rag/AyurvedicSynonymRegistry.java)
New Spring `@Component` that:
- Loads `ayurvedic_synonyms.json` from classpath at startup
- Provides `expandQuery(String query)` → returns enriched query string
- Provides `extractBotanicalNames(String query)` → returns list of detected binomials
- 100+ entries covering major AYUSH herbs, formulations, and TKDL terms

#### [NEW] [ayurvedic_synonyms.json](file:///d:/general/GenAI/IP-SHAKTI/src/main/resources/ayurvedic_synonyms.json)
JSON knowledge base with entries like:
```json
{
  "kutaki": ["Picrorhiza kurroa", "Picrorhiza kurroa Royle", "katuka", "kutaki rasayana", "liver tonic herb"],
  "kalmegh": ["Andrographis paniculata", "king of bitters", "bhunimba", "hepatoprotective bitter"],
  "ashwagandha": ["Withania somnifera", "Indian ginseng", "adaptogen", "rasayana"],
  ...
}
```

#### [MODIFY] [LegalSearchService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/rag/LegalSearchService.java)
- Inject `AyurvedicSynonymRegistry`
- In `searchHybrid()`: expand query before embedding
- Add `searchMultiQuery()` method: run 2–3 expanded queries, merge results, deduplicate by `embedding_id`

---

## Priority 4 — Evidence-Grounded Abstention ("I Don't Know" Mechanism)

> [!IMPORTANT]
> **Root Cause:** When no relevant evidence exists in the corpus, the LLM can still generate plausible-sounding legal conclusions — hallucinating legal facts.

### Fix Strategy
After retrieval, evaluate: "Is the evidence sufficient to answer this query?" If not, the system must abstain with a specific message rather than generating unsupported conclusions.

### Files Changed

#### [MODIFY] [SafeAbstentionEngine.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/dpdp/SafeAbstentionEngine.java)
- Add `evaluateEvidenceSufficiency(query, List<SearchResult> retrievedDocs)` method
- Logic: if `retrievedDocs.isEmpty()` OR all scores < 0.45 → abstain
- Returns `AbstentionEvaluation` with reason: "Insufficient evidence in available corpus"
- Add specific guidance: "Please provide the patent/application number or additional formulation details"

#### [MODIFY] [ChatOrchestratorService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/chat/service/ChatOrchestratorService.java)
- After RAG retrieval in `synthesizeAssessment()`, call `safeAbstentionEngine.evaluateEvidenceSufficiency()`
- If abstain → return `INSUFFICIENT_EVIDENCE` status with explanation
- Add `evidenceCoverageScore` to response (ratio of high-quality hits / total retrieved)

#### [MODIFY] [ChatMessageResponse.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/chat/model/ChatMessageResponse.java)
- Add `DialogueStatus.INSUFFICIENT_EVIDENCE` enum value
- Add `evidenceCoverageScore` field (Double, 0.0–1.0)

---

## Priority 5 — Citation + Explainability Layer

> [!NOTE]
> Every legal conclusion must show: **Section → Source → Evidence Text → AI Inference Label → Confidence**

### Fix Strategy
Enrich `StatutorySourceCitation` model and force the LLM prompt to produce structured citation evidence. Label each conclusion as `DIRECTLY_SUPPORTED`, `AI_INFERENCE`, or `INSUFFICIENT_EVIDENCE`.

### Files Changed

#### [MODIFY] [StatutorySourceCitation.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/chat/model/StatutorySourceCitation.java)
Add fields:
- `evidenceText` (String) — exact excerpt from source document supporting the conclusion
- `supportLevel` (Enum: `DIRECTLY_SUPPORTED | AI_INFERENCE | INSUFFICIENT_EVIDENCE`)
- `rerankerScore` (Double) — confidence from reranker for this citation
- `pageRange` (String) — e.g., "Pages 45–48"

#### [MODIFY] [GeminiGenerativeService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/llm/GeminiGenerativeService.java)
- In `buildGenerativePrompt()`: require LLM to label each conclusion as `[DIRECTLY_SUPPORTED]`, `[AI_INFERENCE]`, or `[INSUFFICIENT_EVIDENCE]`
- In `parseDeliverables()`: extract and map support level labels to `StatutorySourceCitation.supportLevel`
- Add contradiction detection: if two citations assert conflicting facts, flag with `CONTRADICTION_DETECTED` and surface to user

#### Frontend — [MODIFY] [SourceExplorer.jsx](file:///d:/general/GenAI/IP-SHAKTI/frontend/src/pages/SourceExplorer.jsx)
- Show `relevancePercent` as a colored progress bar (green ≥ 75%, yellow 50–74%, red < 50%)
- Show `rerankerReason` as a tooltip on hover
- Show `DIRECTLY_SUPPORTED` as green badge, `AI_INFERENCE` as amber badge, `INSUFFICIENT_EVIDENCE` as red badge

---

## Priority 6 — Duplicate Document Deduplication

> [!NOTE]
> Hybrid search returned "Drugs And Cosmetics Act 1940" twice — confusing to users.

### Fix Strategy
Group results by `doc_title` (or `source_file`), keep only the best-scored chunk per document.

### Files Changed

#### [MODIFY] [LegalSearchService.java](file:///d:/general/GenAI/IP-SHAKTI/src/main/java/com/ayurveda/ipr/rag/LegalSearchService.java)
- Add `deduplicateResults(List<Map<String,Object>> results)` method
- Group by `metadata.doc_title` → keep max score per title
- Return flat deduped list sorted by score descending

---

## Proposed Changes Summary

### Backend — New Files
| File | Purpose |
|------|---------|
| [NEW] `RerankerService.java` | Gemini-powered post-retrieval reranking |
| [NEW] `AyurvedicSynonymRegistry.java` | Herb synonym expansion and query enrichment |
| [NEW] `ayurvedic_synonyms.json` | 100+ entry knowledge base of AYUSH herb synonyms |

### Backend — Modified Files
| File | Change |
|------|--------|
| `ChatOrchestratorService.java` | Context-aware gatekeeper; abstention check; evidence coverage score |
| `GeminiGenerativeService.java` | Conversation-history-aware relevance check; citation support labels; contradiction detection |
| `LegalSearchService.java` | Reranker integration; synonym expansion; deduplication; calibrated scores |
| `SafeAbstentionEngine.java` | Evidence sufficiency evaluation |
| `StatutorySourceCitation.java` | evidenceText, supportLevel, rerankerScore, pageRange fields |
| `ChatMessageResponse.java` | INSUFFICIENT_EVIDENCE status; evidenceCoverageScore field |
| `RagController.java` | Expose relevancePercent + rerankerReason in API response |

### Frontend — Modified Files
| File | Change |
|------|--------|
| `SourceExplorer.jsx` | Relevance % bar; support level badges; reranker reason tooltip |

---

## Verification Plan

### Automated API Tests (PowerShell)
```powershell
# Test 1: Kutaki should no longer match Ketaki (Pandanus)
GET /api/v1/rag/search?query=Kutaki+Kalmegh+hepatoprotective
# Expected: No Pandanus/GI result; score > 0.70

# Test 2: Context-aware gatekeeper allows "NO" in clarification
POST /api/v1/chat/message { sessionId: existing, message: "NO", clarificationAnswers: {} }
# Expected: NOT OUT_OF_SCOPE

# Test 3: Abstention on unanswerable query
POST /api/v1/chat/message { message: "What is the exact grant date of patent IN456789?" }
# Expected: INSUFFICIENT_EVIDENCE status

# Test 4: Deduplication
GET /api/v1/rag/hybrid-search?query=herbal+hepatoprotective
# Expected: "Drugs And Cosmetics Act 1940" appears at most once

# Test 5: Score normalization
GET /api/v1/rag/hybrid-search?query=...
# Expected: relevancePercent field present, values 0–100
```

### Manual Verification
- Chat flow: Start session → answer clarification with "NO" → confirm flow continues correctly
- Source Explorer: Verify green/amber/red badges display per support level
- Relevance bar: Verify percentage display is calibrated and meaningful

---

## Open Questions

> [!IMPORTANT]
> **Q1: Reranker quota** — The reranker calls Gemini once per retrieved document per search. With 5 results this is 5 extra API calls per query. Do you want to batch these or run them selectively (only when top score < 0.75)?

> [!IMPORTANT]
> **Q2: Synonym file scope** — Should `ayurvedic_synonyms.json` cover only ~50 most common herbs for now (faster to build) or should we use the full TKDL plant list (~1000+ entries)?

> [!NOTE]
> **Q3: UI updates** — Should the citation support-level badges (`DIRECTLY_SUPPORTED`, `AI_INFERENCE`) appear in the Chat page, Source Explorer, or both?
