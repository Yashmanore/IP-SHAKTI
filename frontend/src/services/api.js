/**
 * API service layer for IP-SAKTI backend integration.
 * All functions communicate with the real Spring Boot backend.
 * No mock/fake data is returned here.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

/**
 * Submit an IP-SAKTI question for analysis via the conversational orchestrator.
 * Backend endpoint: POST /api/v1/chat/message (ChatController)
 *
 * Request shape (ChatMessageRequest):
 *   sessionId: string | null       — conversation session UUID
 *   message: string                — the user's question (maps from `question` field in form)
 *   productName: string | null
 *   mainIngredients: string | null
 *   intendedUse: string | null
 *   jurisdiction: 'INDIA' | 'INTERNATIONAL'
 *   language: 'AUTO' | 'EN' | 'HI' | 'MR'
 *   clarificationAnswers: Record<string, string>
 *
 * Response shape (ChatMessageResponse): pillars, sessionId, clarifications, etc.
 */
export async function submitAssessment(payload) {
  // Flatten payload: map `question` → `message`, unwrap `productContext` nested object
  const chatRequest = {
    sessionId: payload.sessionId || null,
    message: payload.question || payload.message || '',
    productName: payload.productContext?.productName || payload.productName || null,
    mainIngredients: payload.productContext?.mainIngredients || payload.mainIngredients || null,
    intendedUse: payload.productContext?.intendedUse || payload.intendedUse || null,
    jurisdiction: payload.jurisdiction || 'INDIA',
    language: payload.language || 'AUTO',
    clarificationAnswers: payload.clarificationAnswers || {},
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatRequest),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Server error: ${response.status}`);
  }
  return response.json();
}

/**
 * Classify an Ayurvedic product using the Rule158B classification engine.
 * Backend endpoint: POST /api/v1/classifier/evaluate
 *
 * Request shape (ClassificationRequest):
 *   productName: string
 *   botanicalIngredients: string[]
 *   matchesScheduleIBook: boolean
 *   scheduleIBookName: string | null
 *   formulaOrRatioModified: boolean
 *   intendedUse: 'THERAPEUTIC_TREATMENT' | 'DIETARY_NUTRITION' | 'COSMETIC_BEAUTY'
 *   claimedIndication: string | null
 *   newIndicationOrDosageRoute: boolean
 *   purifiedPhytochemicalExtract: boolean
 *   synergisticDataAvailable: boolean
 *   applicantType: 'INDIAN_INDIVIDUAL' | 'INDIAN_COMPANY' | 'FOREIGN_ENTITY_OR_NRI' | null
 *   commercialUtilization: boolean
 *
 * Response shape (ClassificationResult):
 *   category: ProductCategory enum key
 *   categoryDisplayName: string
 *   governingAct: string
 *   licensingAuthority: string
 *   licensingProcedure: string
 *   clinicalTrialRequirement: string
 *   mandatoryLabelDisclaimers: string[]
 *   formulationPatentableInIndia: boolean
 *   patentabilityVerdict: string
 *   relevantPatentSections: string[]
 *   recommendedIprStrategy: string
 *   nbaComplianceStatus: string
 *   requiredNbaForm: string
 *   decisionTrace: string[]
 */
export async function classifyProduct(request) {
  const response = await fetch(`${API_BASE_URL}/api/v1/classifier/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Server error: ${response.status}`);
  }
  return response.json();
}

