import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Tag,
  MapPin,
  Palette,
  PenLine,
  Lock,
  Sprout,
  BookOpen,
  X,
  RefreshCw,
  Info,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────────────────────
// IP Route Definitions
// These are structural UI definitions only. Relevance/status comes from
// the assessment context (classification result) or a future backend endpoint.
// ─────────────────────────────────────────────────────────────────────────────
const IP_ROUTES = [
  {
    key: 'patent',
    icon: <ShieldCheck size={20} />,
    name: 'Patent',
    explanation:
      'May protect qualifying inventions or technical innovations — such as novel processes, formulations, or delivery mechanisms — subject to applicable patentability requirements.',
    detailWhat:
      'Patents may protect new, inventive, and industrially applicable inventions. For Ayurveda products, this typically concerns novel extraction processes, delivery mechanisms, or technical innovations — not traditional formulations.',
    detailConsiderations: [
      'Classical formulations documented in First Schedule books are generally subject to the traditional-knowledge patent bar.',
      'Process patents for novel extraction or delivery mechanisms may be available depending on the specific innovation.',
      'Patentability requires novelty, inventive step, and industrial applicability.',
      'Subject-matter exclusions under the applicable patents act may apply.',
    ],
  },
  {
    key: 'trademark',
    icon: <Tag size={20} />,
    name: 'Trademark',
    explanation:
      'May protect brand identifiers such as names, logos, labels, or distinctive marks used to distinguish your product in the marketplace.',
    detailWhat:
      'Trademarks protect signs, words, logos, or marks that distinguish goods or services of one enterprise from those of others.',
    detailConsiderations: [
      'Generic classical Ayurvedic names generally cannot be registered as trademarks.',
      'Distinctive brand names or logos may be eligible for registration.',
      'Registration provides territorial protection in the applicable jurisdiction.',
      'Continuous use and renewal are generally required to maintain trademark rights.',
    ],
  },
  {
    key: 'gi',
    icon: <MapPin size={20} />,
    name: 'Geographical Indication (GI)',
    explanation:
      'May be relevant where the product qualifies for GI protection — i.e., where quality, reputation, or characteristics are linked to a specific geographical origin.',
    detailWhat:
      'Geographical Indications identify a product as originating from a specific place, where the quality, reputation, or other characteristics are attributable to that origin.',
    detailConsiderations: [
      'Applicable only where a genuine link to a geographical origin exists.',
      'GI registration is typically managed by producer associations or government bodies.',
      'Individual companies generally cannot register a GI exclusively for themselves.',
      'GI protection prevents unauthorized use of the geographical name by non-qualifying producers.',
    ],
  },
  {
    key: 'design',
    icon: <Palette size={20} />,
    name: 'Industrial Design',
    explanation:
      'May protect qualifying visual or aesthetic features of a product — such as shape, configuration, pattern, or ornamentation — that give it a distinctive appearance.',
    detailWhat:
      'Industrial design rights protect the visual appearance or aesthetics of a product, distinct from its functional aspects.',
    detailConsiderations: [
      'Protects the look and feel, not the functional properties of a product.',
      'The design must be novel and not previously disclosed.',
      'Does not protect the underlying formulation or composition.',
    ],
  },
  {
    key: 'copyright',
    icon: <PenLine size={20} />,
    name: 'Copyright',
    explanation:
      'May apply to qualifying original creative works — such as packaging artwork, marketing materials, instructional content, or software — depending on the subject matter.',
    detailWhat:
      'Copyright protects original creative expressions fixed in a tangible form. It does not protect ideas, methods, or formulations.',
    detailConsiderations: [
      'Arises automatically on creation in most jurisdictions — registration provides additional evidentiary benefits.',
      'Does not protect the formulation, ingredient list, or technical method itself.',
      'May protect original packaging artwork, product literature, or instructional content.',
    ],
  },
  {
    key: 'tradesecret',
    icon: <Lock size={20} />,
    name: 'Trade Secret / Confidential Know-How',
    explanation:
      'Confidential formulation details, proprietary processes, or business information may sometimes be protected through confidentiality agreements and trade-secret practices where applicable.',
    detailWhat:
      'Trade secrets protect valuable confidential business information — such as formulas, processes, or methods — that provide a competitive advantage and are kept secret.',
    detailConsiderations: [
      'Requires active steps to maintain secrecy (e.g., confidentiality agreements, access controls).',
      'Protection lasts as long as the information remains confidential.',
      'Lost if independently discovered or if the secret becomes public.',
      'No registration required, but legal advice on confidentiality practices is recommended.',
    ],
  },
  {
    key: 'pvp',
    icon: <Sprout size={20} />,
    name: 'Plant Variety Protection',
    explanation:
      'May be relevant where the subject concerns a qualifying new, distinct, uniform, and stable plant variety developed through breeding or cultivation.',
    detailWhat:
      'Plant variety protection (also known as plant breeders\' rights) protects new plant varieties that are distinct, uniform, stable, and novel.',
    detailConsiderations: [
      'Applies specifically to plant varieties, not to extracts or formulations derived from existing plant varieties.',
      'Requires the variety to be new, distinct from existing varieties, uniform, and stable.',
      'Does not prevent others from using the protected variety for research or further breeding.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: derive patent-specific status from classification result
// Returns null if no useful info is available (show "Not assessed")
// ─────────────────────────────────────────────────────────────────────────────
function derivePatentStatus(classificationResult) {
  if (!classificationResult) return null;
  if (classificationResult.patentabilityVerdict) {
    return {
      label: 'Guidance available',
      verdict: classificationResult.patentabilityVerdict,
      sections: classificationResult.relevantPatentSections || [],
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Compact context summary at the top of the page */
const ContextCard = ({ context, onGoToAsk }) => {
  const cr = context?.classificationResult;
  const hasContext = context?.productName || cr || context?.jurisdiction;

  if (!hasContext) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
        <AlertCircle size={16} className="text-slate shrink-0 mt-0.5" />
        <div>
          <p className="text-charcoal font-medium">Assessment context is not available.</p>
          <button
            type="button"
            onClick={onGoToAsk}
            className="text-forest-green hover:underline mt-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded"
          >
            Return to Ask IP-SAKTI →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg mb-6 text-sm">
      <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-2">Assessment Context</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-slate font-medium block">Product</span>
          <span className="text-charcoal">{context?.productName || 'Not provided'}</span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">Classification</span>
          <span className="text-charcoal">{cr?.categoryDisplayName || 'Not assessed'}</span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">Jurisdiction</span>
          <span className="text-charcoal">
            {context?.jurisdiction === 'INDIA'
              ? 'India'
              : context?.jurisdiction === 'INTERNATIONAL'
                ? `International${context?.destinationMarket ? ` — ${context.destinationMarket}` : ''}`
                : 'Not provided'}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Status badge — shows dynamic status or "Not assessed" */
const StatusBadge = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate/10 text-slate border border-slate/20 font-medium">
        Not assessed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted-gold/10 text-muted-gold border border-muted-gold/30 font-medium">
      {status}
    </span>
  );
};

/** "View requirements" detail drawer/expansion */
const RequirementsPanel = ({ route, jurisdiction, onClose }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`${route.name} requirements`}
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
  >
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/20"
      onClick={onClose}
      aria-hidden="true"
    />
    {/* Panel */}
    <div className="relative bg-white rounded-xl shadow-xl border border-border-color max-w-lg w-full max-h-[85vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-border-color px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-forest-green">{route.icon}</span>
          <h2 className="text-lg font-heading font-semibold text-charcoal">{route.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close requirements panel"
          className="text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-full p-1"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-charcoal mb-2">What it can generally protect</h3>
          <p className="text-sm text-slate leading-relaxed">{route.detailWhat}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-charcoal mb-2">Key considerations</h3>
          <ul className="space-y-2">
            {route.detailConsiderations.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
                <span className="text-muted-gold shrink-0 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-charcoal mb-2">Jurisdiction</h3>
          <p className="text-sm text-slate">
            {jurisdiction === 'INDIA'
              ? 'India — assessment based on Indian legal framework.'
              : jurisdiction === 'INTERNATIONAL'
                ? 'International — requirements vary by country. Jurisdiction-specific guidance requires further assessment.'
                : 'Not specified.'}
          </p>
        </div>

        <div className="p-3 bg-warm-ivory rounded-lg border border-border-color">
          <p className="text-xs text-slate italic">
            Detailed source-backed requirements are not available yet. Source records will appear here when the RAG knowledge base is connected.
          </p>
        </div>

        <p className="text-xs text-slate border-t border-border-color pt-4">
          This information is provided for general awareness only and does not constitute legal advice.
        </p>
      </div>
    </div>
  </div>
);

/** Individual IP route card */
const IpRouteCard = ({ route, status, verdict, jurisdiction, onViewRequirements }) => {
  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-start gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-warm-ivory flex items-center justify-center text-forest-green shrink-0">
        {route.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h3 className="text-base font-semibold text-charcoal">{route.name}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-slate leading-relaxed mb-3">{route.explanation}</p>

        {/* Show patent verdict from classification if available */}
        {verdict && (
          <div className="p-3 bg-warm-ivory border border-border-color rounded-lg mb-3 text-sm text-charcoal leading-relaxed">
            <span className="font-medium text-forest-green text-xs uppercase tracking-wide block mb-1">From classification result</span>
            {verdict}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0 self-start">
        <button
          type="button"
          onClick={() => onViewRequirements(route)}
          aria-label={`View requirements for ${route.name}`}
          className="text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          View requirements
        </button>
      </div>
    </div>
  );
};

/** RAG source search result section */
const SourceGroundedSection = ({ jurisdiction }) => {
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const j = jurisdiction === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'INDIA';
      const res = await fetch(
        `${API_BASE_URL}/api/v1/rag/search?query=intellectual+property+protection+ayurveda&jurisdiction=${j}&maxResults=5&minScore=0.65`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setSources(data);
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('service_unavailable');
      } else {
        setError(err.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [jurisdiction]);

  return (
    <section className="card p-6">
      <div className="flex items-start gap-3 mb-4">
        <BookOpen size={18} className="text-muted-gold shrink-0 mt-0.5" />
        <div className="flex-1">
          <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
            Source-Grounded IP Guidance
          </h2>
          <p className="text-sm text-slate leading-relaxed">
            IP-SAKTI uses authoritative legal and regulatory sources to support its guidance. Source records will appear here when available.
          </p>
        </div>
      </div>

      {!sources && !loading && !error && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-slate mb-4">
            No source-grounded IP guidance is available for this assessment yet.
          </p>
          <button
            type="button"
            onClick={fetchSources}
            className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            <RefreshCw size={14} /> Search sources
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-6 text-slate text-sm">
          <Loader2 size={16} className="animate-spin" /> Searching authoritative sources…
        </div>
      )}

      {error === 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">Source search service is not connected yet.</p>
            <p className="text-slate mt-0.5">Source records will appear when the RAG service is available.</p>
          </div>
          <button
            type="button"
            onClick={fetchSources}
            className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none"
          >
            Retry
          </button>
        </div>
      )}

      {error && error !== 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
          <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">IP protection assessment could not be loaded.</p>
            <p className="text-slate mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchSources}
            className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none"
          >
            Retry
          </button>
        </div>
      )}

      {sources && sources.length === 0 && (
        <p className="text-sm text-slate italic py-4">
          No matching source records were found for this query and jurisdiction.
        </p>
      )}

      {sources && sources.length > 0 && (
        <ul className="space-y-3 mt-2">
          {sources.map((src, i) => (
            <li key={i} className="p-4 bg-warm-ivory rounded-lg border border-border-color text-sm">
              {src.title && (
                <p className="font-semibold text-charcoal mb-1">{src.title}</p>
              )}
              {src.content && (
                <p className="text-slate leading-relaxed line-clamp-3">{src.content}</p>
              )}
              {src.section && (
                <p className="text-xs text-muted-gold mt-2 font-medium">{src.section}</p>
              )}
              {src.sourceUrl && (
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-forest-green hover:underline mt-1 block"
                >
                  View source →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const IpProtection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentContext = location.state || null;

  const [openPanel, setOpenPanel] = useState(null);

  const classificationResult = assessmentContext?.classificationResult || null;
  const jurisdiction = assessmentContext?.jurisdiction || null;

  // Derive patent status from the classification result (only for patent card)
  const patentStatus = derivePatentStatus(classificationResult);

  const handleViewRequirements = (route) => {
    setOpenPanel(route);
  };

  const handleClosePanel = () => {
    setOpenPanel(null);
  };

  const handleBack = () => {
    navigate('/product-classification', { state: assessmentContext });
  };

  const handleContinue = () => {
    navigate('/regulatory-check', { state: assessmentContext });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Product Classification', path: '/product-classification' },
          { label: 'IP Protection', path: '/ip-protection' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">IP Protection</h1>
        <p className="text-slate text-base leading-relaxed">
          Explore intellectual property protection routes that may be relevant to your Ayurveda product.
        </p>
      </div>

      {/* Assessment Stepper */}
      <AssessmentStepper activeKey="ip" />

      {/* Assessment Context */}
      <ContextCard
        context={assessmentContext}
        onGoToAsk={() => navigate('/ask-ip-sakti')}
      />

      {/* Info note about page purpose */}
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
        <Info size={16} className="text-slate shrink-0 mt-0.5" />
        <p className="text-slate leading-relaxed">
          The routes below represent possible IP protection categories. Relevance depends on your specific product, formulation, and jurisdiction. Status shown as{' '}
          <span className="font-medium text-charcoal">"Not assessed"</span> means the backend has not yet evaluated that route for this assessment.
        </p>
      </div>

      {/* Main IP Routes Section */}
      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-forest-green mb-2">
          Potential IP Protection Routes
        </h2>
        <p className="text-sm text-slate mb-6 leading-relaxed">
          Different forms of intellectual property may protect different aspects of an Ayurveda product, formulation, brand, appearance, creative material, or confidential know-how. Review the routes below based on your assessment context.
        </p>

        <div className="space-y-4">
          {IP_ROUTES.map((route) => {
            // Only the Patent card gets dynamic data from the classification result
            const isPatent = route.key === 'patent';
            const status = isPatent && patentStatus ? patentStatus.label : null;
            const verdict = isPatent && patentStatus ? patentStatus.verdict : null;

            return (
              <IpRouteCard
                key={route.key}
                route={route}
                status={status}
                verdict={verdict}
                jurisdiction={jurisdiction}
                onViewRequirements={handleViewRequirements}
              />
            );
          })}
        </div>
      </section>

      {/* Source-grounded guidance */}
      <div className="mb-8">
        <SourceGroundedSection jurisdiction={jurisdiction} />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate border-t border-border-color pt-5 mb-8 leading-relaxed">
        <strong>Disclaimer:</strong> IP-SAKTI provides information and source-grounded guidance, not legal advice or a legal determination of protection.
      </p>

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to Product Classification"
          className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          <ArrowLeft size={16} /> Back to Product Classification
        </button>
        <button
          type="button"
          onClick={handleContinue}
          aria-label="Continue to Regulatory Check"
          className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          Continue to Regulatory Check <ArrowRight size={16} />
        </button>
      </div>

      {/* Requirements panel modal */}
      {openPanel && (
        <RequirementsPanel
          route={openPanel}
          jurisdiction={jurisdiction}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
};

export default IpProtection;
