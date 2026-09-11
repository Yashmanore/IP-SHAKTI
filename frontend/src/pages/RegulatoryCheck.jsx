import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Factory,
  FlaskConical,
  Tag,
  Megaphone,
  Apple,
  Sparkles,
  Stethoscope,
  BookOpen,
  X,
  RefreshCw,
  Info,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import { useJurisdiction } from '../context/JurisdictionContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Determine if this classification is Ayurveda Aahar (food/dietary) */
function isAaharCategory(cr) {
  return cr?.category === 'AYURVEDA_AAHAR';
}

/** Determine if this classification is cosmetic */
function isCosmeticCategory(cr) {
  return cr?.category === 'AYURVEDIC_COSMETIC';
}

/** Determine if this classification is classical */
function isClassicalCategory(cr) {
  return cr?.category === 'CLASSICAL_AYURVEDIC_FORMULATION';
}

/** Determine if classification has been assessed */
function hasClassification(cr) {
  return !!cr?.category;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Context card at top of page */
const ContextCard = ({ context, onGoToAsk }) => {
  const { t } = useTranslation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();
  const cr = context?.classificationResult;
  const jur = context?.jurisdiction || globalJurisdiction;
  const hasContext = context?.productName || cr || jur;

  if (!hasContext) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
        <AlertCircle size={16} className="text-slate shrink-0 mt-0.5" />
        <div>
          <p className="text-charcoal font-medium">{t('common.noContext', 'Assessment context is not available.')}</p>
          <button
            type="button"
            onClick={onGoToAsk}
            className="text-forest-green hover:underline mt-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded"
          >
            {t('common.returnToAsk', 'Return to Ask IP-SAKTI →')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg mb-6 text-sm">
      <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-2">
        {t('common.assessmentContext', 'Assessment Context')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-slate font-medium block">{t('common.product', 'Product')}</span>
          <span className="text-charcoal">{context?.productName || t('common.notProvided', 'Not provided')}</span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">{t('common.classification', 'Classification')}</span>
          <span className="text-charcoal">{cr?.categoryDisplayName || t('common.notAssessed', 'Not assessed')}</span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">{t('common.jurisdictionLabel', 'Jurisdiction')}</span>
          <span className="text-charcoal">
            {jur === 'INDIA'
              ? t('common.india', 'India')
              : jur === 'INTERNATIONAL'
                ? `${t('common.international', 'International')}${context?.destinationMarket ? ` — ${context.destinationMarket}` : ''}`
                : t('common.notProvided', 'Not provided')}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Status badge */
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const styles = {
    assessed: 'bg-success/10 text-success border-success/30',
    not_assessed: 'bg-slate/10 text-slate border-slate/20',
    not_applicable: 'bg-border-color text-slate border-border-color',
  };
  const labels = {
    assessed: t('common.assessed', 'Information available'),
    not_assessed: t('common.notAssessed', 'Not assessed'),
    not_applicable: t('common.notApplicable', 'Not applicable'),
  };
  const s = status || 'not_assessed';
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${styles[s]}`}>
      {labels[s]}
    </span>
  );
};

/** Regulatory pathway visual step */
const PathwayStep = ({ number, label, sublabel, isActive }) => (
  <div className="flex flex-col items-center text-center flex-1 min-w-0">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-2 shrink-0
      ${isActive ? 'bg-forest-green text-white' : 'bg-border-color text-slate'}`}>
      {number}
    </div>
    <p className={`text-xs font-medium leading-tight ${isActive ? 'text-forest-green' : 'text-charcoal'}`}>
      {label}
    </p>
    {sublabel && <p className="text-xs text-slate mt-0.5">{sublabel}</p>}
  </div>
);

/** Expandable requirement card */
const RequirementCard = ({ icon, title, status, explanation, details, detailUnavailable }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-warm-ivory flex items-center justify-center text-forest-green shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h3 className="text-base font-semibold text-charcoal">{title}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-sm text-slate leading-relaxed">{explanation}</p>
          </div>
          <div className="shrink-0 self-start">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={`${expanded ? t('common.collapse', 'Collapse') : t('common.viewRequirements', 'View requirements')} ${title}`}
              className="flex items-center gap-1.5 text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 whitespace-nowrap"
            >
              {expanded ? <><ChevronUp size={14} /> {t('common.collapse', 'Collapse')}</> : <>{t('common.viewRequirements', 'View requirements')}<ChevronDown size={14} /></>}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border-color bg-warm-ivory/40">
          {details ? (
            <div className="space-y-3 pt-3">
              {details.map((d, i) => (
                <div key={i}>
                  {d.label && (
                    <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-0.5">{d.label}</p>
                  )}
                  <p className="text-sm text-charcoal leading-relaxed">{d.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate italic pt-3">
              {detailUnavailable || t('regulatoryCheck.detailedReqUnavailable', 'Detailed source-backed requirements are not available yet.')}
            </p>
          )}
          <p className="mt-4 text-xs text-slate border-t border-border-color pt-3">
            {t('regulatoryCheck.generalAwarenessNotice', 'This information is provided for general awareness only and does not constitute legal advice or regulatory approval.')}
          </p>
        </div>
      )}
    </div>
  );
};

/** Conditional card (Not applicable unless category matches) */
const ConditionalRequirementCard = ({ icon, title, explanation, applicable, applicableReason, details }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!applicable) {
    return (
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3 opacity-60">
        <div className="w-10 h-10 rounded-lg bg-warm-ivory flex items-center justify-center text-slate shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-base font-semibold text-charcoal">{title}</h3>
            <StatusBadge status="not_applicable" />
          </div>
          <p className="text-xs text-slate">
            {applicableReason || t('regulatoryCheck.notApplicableReason', 'This section does not appear applicable based on the current product classification.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border-l-4 border-l-muted-gold">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted-gold/10 flex items-center justify-center text-muted-gold shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h3 className="text-base font-semibold text-charcoal">{title}</h3>
              <StatusBadge status="assessed" />
            </div>
            <p className="text-sm text-slate leading-relaxed">{explanation}</p>
          </div>
          <div className="shrink-0 self-start">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={`${expanded ? t('common.collapse', 'Collapse') : t('common.viewRequirements', 'View requirements')} ${title}`}
              className="flex items-center gap-1.5 text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 whitespace-nowrap"
            >
              {expanded ? <><ChevronUp size={14} /> {t('common.collapse', 'Collapse')}</> : <>{t('common.viewRequirements', 'View requirements')}<ChevronDown size={14} /></>}
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border-color bg-warm-ivory/40">
          {details?.length > 0 ? (
            <div className="space-y-3 pt-3">
              {details.map((d, i) => (
                <div key={i}>
                  {d.label && <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-0.5">{d.label}</p>}
                  <p className="text-sm text-charcoal leading-relaxed">{d.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate italic pt-3">{t('regulatoryCheck.detailedReqUnavailable', 'Detailed source-backed requirements are not available yet.')}</p>
          )}
          <p className="mt-4 text-xs text-slate border-t border-border-color pt-3">
            {t('regulatoryCheck.generalAwarenessNotice', 'This information is provided for general awareness only and does not constitute legal advice or regulatory approval.')}
          </p>
        </div>
      )}
    </div>
  );
};

/** Rule 158-B dedicated section */
const Rule158BSection = ({ cr }) => {
  const { t } = useTranslation();
  const hasData = hasClassification(cr);
  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green font-bold text-xs shrink-0">
          158-B
        </div>
        <h2 className="text-lg font-heading font-semibold text-charcoal">
          {t('regulatoryCheck.rule158bTitle', 'Rule 158-B Classification Pathway')}
        </h2>
      </div>

      {!hasData ? (
        <div className="p-4 bg-warm-ivory rounded-lg border border-border-color text-sm text-slate italic">
          {t('regulatoryCheck.notAssessedYet', 'Rule 158-B assessment is not available yet. Complete product classification to see the applicable pathway.')}
        </div>
      ) : (
        <dl className="divide-y divide-border-color">
          <div className="py-3">
            <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('common.classification', 'Classification')}</dt>
            <dd className="text-sm text-charcoal">{cr.categoryDisplayName}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('regulatoryCheck.governingAct', 'Governing Act / Framework')}</dt>
            <dd className="text-sm text-charcoal">{cr.governingAct || t('common.notAvailable', 'Not available')}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('regulatoryCheck.licensingAuthority', 'Licensing Authority')}</dt>
            <dd className="text-sm text-charcoal">{cr.licensingAuthority || t('common.notAvailable', 'Not available')}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('regulatoryCheck.evidenceReq', 'Applicable Evidence Requirements')}</dt>
            <dd className="text-sm text-charcoal">{cr.clinicalTrialRequirement || t('common.notAvailable', 'Not available')}</dd>
          </div>
          <div className="py-3">
            <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('regulatoryCheck.regulatoryPathway', 'Regulatory Pathway')}</dt>
            <dd className="text-sm text-charcoal">{cr.licensingProcedure || t('common.notAvailable', 'Not available')}</dd>
          </div>
          {cr.mandatoryLabelDisclaimers?.length > 0 && (
            <div className="py-3">
              <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{t('regulatoryCheck.mandatoryDisclaimers', 'Mandatory Label Disclaimers')}</dt>
              <dd>
                <ul className="space-y-1">
                  {cr.mandatoryLabelDisclaimers.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
                      <span className="text-muted-gold mt-0.5 shrink-0">•</span>{d}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
};

/** Source-grounded guidance from RAG */
const SourceGroundedSection = ({ jurisdiction }) => {
  const { t } = useTranslation();
  const [sources, setSources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const j = jurisdiction === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'INDIA';
      const res = await fetch(
        `${API_BASE_URL}/api/v1/rag/search?query=ayurveda+regulatory+requirements+licensing&jurisdiction=${j}&maxResults=5&minScore=0.65`
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
        <div>
          <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
            {t('regulatoryCheck.sourceGroundedTitle', 'Source-Grounded Regulatory Guidance')}
          </h2>
          <p className="text-sm text-slate leading-relaxed">
            {t('regulatoryCheck.sourceGroundedDesc', 'IP-SAKTI uses authoritative legal and regulatory sources to support its guidance. Source records will appear here when available.')}
          </p>
        </div>
      </div>

      {!sources && !loading && !error && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-slate mb-4">
            {t('regulatoryCheck.emptyGuidance', 'No source-grounded regulatory guidance is available for this assessment yet.')}
          </p>
          <button
            type="button"
            onClick={fetchSources}
            className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            <RefreshCw size={14} /> {t('common.searchSources', 'Search sources')}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-6 text-slate text-sm">
          <Loader2 size={16} className="animate-spin" /> {t('common.searchingSources', 'Searching authoritative regulatory sources…')}
        </div>
      )}

      {error === 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">{t('common.serviceUnavailable', 'Source search service is not connected yet.')}</p>
            <p className="text-slate mt-0.5">{t('regulatoryCheck.sourceServiceUnavailableDesc', 'Source records will appear when the RAG service is available.')}</p>
          </div>
          <button type="button" onClick={fetchSources} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none">{t('common.retry', 'Retry')}</button>
        </div>
      )}

      {error && error !== 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
          <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">{t('common.errorOccurred', 'Regulatory assessment could not be loaded.')}</p>
            <p className="text-slate mt-0.5">{error}</p>
          </div>
          <button type="button" onClick={fetchSources} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none">{t('common.retry', 'Retry')}</button>
        </div>
      )}

      {sources && sources.length === 0 && (
        <p className="text-sm text-slate italic py-4">{t('sourceExplorer.noMatch', 'No matching regulatory source records found for this jurisdiction.')}</p>
      )}

      {sources && sources.length > 0 && (
        <ul className="space-y-3 mt-2">
          {sources.map((src, i) => (
            <li key={i} className="p-4 bg-warm-ivory rounded-lg border border-border-color text-sm">
              {src.title && <p className="font-semibold text-charcoal mb-1">{src.title}</p>}
              {src.content && <p className="text-slate leading-relaxed line-clamp-3">{src.content}</p>}
              {src.section && <p className="text-xs text-muted-gold mt-2 font-medium">{src.section}</p>}
              {src.sourceUrl && (
                <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-forest-green hover:underline mt-1 block">
                  {t('common.viewSource', 'View source →')}
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
const RegulatoryCheck = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();
  const assessmentContext = location.state || null;
  const cr = assessmentContext?.classificationResult || null;
  const effectiveJurisdiction = assessmentContext?.jurisdiction || globalJurisdiction || 'INDIA';
  const effectiveContext = assessmentContext
    ? { ...assessmentContext, jurisdiction: effectiveJurisdiction }
    : { jurisdiction: effectiveJurisdiction };

  // Determine conditional sections
  const isAahar = isAaharCategory(cr);
  const isCosmetic = isCosmeticCategory(cr);
  const isClassical = isClassicalCategory(cr);
  const classificationDone = hasClassification(cr);

  // Form state
  const [activeTab, setActiveTab] = useState(isAahar ? 'aahar' : isCosmetic ? 'cosmetic' : 'rule158b');
  const [openSection, setOpenSection] = useState(null);

  // Build requirement detail arrays from real backend classification data
  const manufacturingDetails = classificationDone
    ? [
        { label: 'Licensing Procedure', value: cr.licensingProcedure || 'Not available' },
        { label: 'Licensing Authority', value: cr.licensingAuthority || 'Not available' },
        { label: 'Governing Act', value: cr.governingAct || 'Not available' },
      ]
    : null;

  const safetyDetails = classificationDone
    ? [{ label: 'Evidence / Safety Requirements', value: cr.clinicalTrialRequirement || 'Not available' }]
    : null;

  const labellingDetails = classificationDone && cr.mandatoryLabelDisclaimers?.length > 0
    ? cr.mandatoryLabelDisclaimers.map((d) => ({ label: 'Required Statement', value: d }))
    : null;

  // Food-specific details
  const aaharDetails = isAahar
    ? [
        { label: 'Governing Regulation', value: cr.governingAct },
        { label: 'Licensing Authority', value: cr.licensingAuthority },
        { label: 'Licensing Procedure', value: cr.licensingProcedure },
        { label: 'Safety Requirements', value: cr.clinicalTrialRequirement },
        { label: 'Mandatory Label Statements', value: cr.mandatoryLabelDisclaimers?.join('; ') || 'See label disclaimer section' },
      ]
    : null;

  // Cosmetic-specific details
  const cosmeticDetails = isCosmetic
    ? [
        { label: 'Governing Act', value: cr.governingAct },
        { label: 'Licensing Authority', value: cr.licensingAuthority },
        { label: 'Licensing Procedure', value: cr.licensingProcedure },
        { label: 'Safety Requirements', value: cr.clinicalTrialRequirement },
        { label: 'Mandatory Disclaimers', value: cr.mandatoryLabelDisclaimers?.join('; ') || 'Not available' },
      ]
    : null;

  const handleBack = () => navigate('/ip-protection', { state: effectiveContext });
  const handleContinue = () => navigate('/abs-biodiversity', { state: effectiveContext });

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Product Classification', path: '/product-classification' },
          { label: 'IP Protection', path: '/ip-protection' },
          { label: 'Regulatory Check', path: '/regulatory-check' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('regulatoryCheck.title', 'Regulatory Check')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('regulatoryCheck.subtitle', 'Understand the regulatory requirements that may apply to your Ayurveda product.')}
        </p>
      </div>

      {/* Stepper */}
      <AssessmentStepper activeKey="regulatory" />

      {/* Assessment Context */}
      <ContextCard context={assessmentContext} onGoToAsk={() => navigate('/ask-ip-sakti')} />

      {/* Jurisdiction notice */}
      {effectiveJurisdiction === 'INTERNATIONAL' && (
        <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
          <Info size={16} className="text-slate shrink-0 mt-0.5" />
          <p className="text-slate leading-relaxed">
            <strong className="text-charcoal">International jurisdiction selected.</strong> Regulatory requirements vary significantly by destination country.
            {assessmentContext?.destinationMarket && (
              <> Destination market: <strong className="text-charcoal">{assessmentContext.destinationMarket}</strong>.</>
            )} Jurisdiction-specific requirements require country-specific legal advice.
          </p>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-8 text-sm">
        <Info size={16} className="text-slate shrink-0 mt-0.5" />
        <p className="text-slate leading-relaxed">
          Requirements shown below are derived from the backend classification result for this assessment.
          Items showing <strong className="text-charcoal">"Not assessed"</strong> require a completed product classification.
        </p>
      </div>

      {/* ── REGULATORY PATHWAY ─────────────────────────────────────────── */}
      <section className="card p-6 mb-8">
        <h2 className="text-xl font-heading font-semibold text-charcoal mb-5">
          {t('regulatoryCheck.pathwayTitle', 'Regulatory Pathway')}
        </h2>
        <p className="text-sm text-slate mb-6 leading-relaxed">
          {t('regulatoryCheck.pathwaySubtitle', 'This is a general overview of the regulatory pathway for Ayurveda products under Indian law. The specific steps applicable depend on the product category determined by the backend classification engine.')}
        </p>
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
          {[
            { n: 1, label: t('regulatoryCheck.steps.step1', 'Product Classification'), sub: t('regulatoryCheck.steps.step1Sub', 'Rule 158-B / FSSAI / D&C Act') },
            { n: 2, label: t('regulatoryCheck.steps.step2', 'Applicable Framework'), sub: t('regulatoryCheck.steps.step2Sub', 'Governing Act & Authority') },
            { n: 3, label: t('regulatoryCheck.steps.step3', 'Safety & Evidence'), sub: t('regulatoryCheck.steps.step3Sub', 'Testing / Trial Requirements') },
            { n: 4, label: t('regulatoryCheck.steps.step4', 'Manufacturing / Licensing'), sub: t('regulatoryCheck.steps.step4Sub', 'License Application') },
            { n: 5, label: t('regulatoryCheck.steps.step5', 'Labelling & Claims'), sub: t('regulatoryCheck.steps.step5Sub', 'Mandatory Statements') },
            { n: 6, label: t('regulatoryCheck.steps.step6', 'Commercialization'), sub: t('regulatoryCheck.steps.step6Sub', 'Market Authorization') },
          ].map((step, i) => (
            <React.Fragment key={step.n}>
              <PathwayStep
                number={step.n}
                label={step.label}
                sublabel={step.sub}
                isActive={classificationDone && i <= 1}
              />
              {i < 5 && (
                <div className="text-border-color self-start mt-4 text-lg shrink-0 px-1">›</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-slate mt-4 border-t border-border-color pt-3">
          This pathway is a visual explanation only. It does not indicate that the product has completed any regulatory stage.
        </p>
      </section>

      {/* ── REGULATORY REQUIREMENTS ────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-forest-green mb-2">
          {t('regulatoryCheck.requirementsTitle', 'Regulatory Requirements')}
        </h2>
        <p className="text-sm text-slate mb-6 leading-relaxed">
          {t('regulatoryCheck.requirementsSubtitle', 'The following requirements may apply to this product. Status reflects information from the backend classification engine only.')}
        </p>

        <div className="space-y-4">
          {/* 1. Product Category */}
          <RequirementCard
            icon={<FileText size={20} />}
            title={t('regulatoryCheck.cards.productCategory', 'Product Category')}
            status={classificationDone ? 'assessed' : 'not_assessed'}
            explanation="The applicable regulatory category determines the governing act, licensing authority, and overall compliance pathway."
            details={classificationDone ? [
              { label: 'Category', value: cr.categoryDisplayName },
              { label: 'Governing Act', value: cr.governingAct },
              { label: 'Licensing Authority', value: cr.licensingAuthority },
            ] : null}
          />

          {/* 2. Manufacturing & Licensing */}
          <RequirementCard
            icon={<Factory size={20} />}
            title={t('regulatoryCheck.cards.manufacturing', 'Manufacturing & Licensing')}
            status={classificationDone ? 'assessed' : 'not_assessed'}
            explanation="This section covers manufacturing permissions, licensing, registrations, or other regulatory requirements that may apply to the identified product category."
            details={manufacturingDetails}
          />

          {/* 3. Safety & Evidence */}
          <RequirementCard
            icon={<FlaskConical size={20} />}
            title={t('regulatoryCheck.cards.safety', 'Safety & Evidence')}
            status={classificationDone ? 'assessed' : 'not_assessed'}
            explanation="This section covers applicable safety, testing, evidence, or documentation requirements. Requirements depend on the product category, intended use, and applicable regulatory framework."
            details={safetyDetails}
          />

          {/* 4. Labelling */}
          <RequirementCard
            icon={<Tag size={20} />}
            title={t('regulatoryCheck.cards.labelling', 'Labelling')}
            status={classificationDone && cr.mandatoryLabelDisclaimers?.length > 0 ? 'assessed' : classificationDone ? 'assessed' : 'not_assessed'}
            explanation="This section covers labelling information and requirements that may apply to the product category and jurisdiction."
            details={labellingDetails}
            detailUnavailable={classificationDone ? 'Specific mandatory label statements are not returned for this category. Check the Rule 158-B section below for label disclaimers.' : undefined}
          />

          {/* 5. Advertising & Claims */}
          <RequirementCard
            icon={<Megaphone size={20} />}
            title={t('regulatoryCheck.cards.advertising', 'Advertising & Claims')}
            status="not_assessed"
            explanation="This section covers requirements or restrictions that may apply to advertising, therapeutic claims, health claims, or other product representations. Restrictions depend on the product category and applicable regulatory framework."
            details={null}
          />

          {/* 6. Food / Ayurveda-Aahar (conditional) */}
          <ConditionalRequirementCard
            icon={<Apple size={20} />}
            title={t('regulatoryCheck.cards.foodAahar', 'Food / Ayurveda-Aahar Requirements')}
            applicable={isAahar}
            explanation={isAahar
              ? `This product has been classified as ${cr.categoryDisplayName}. FSSAI Ayurveda Aahar Regulations 2022 apply.`
              : ''}
            applicableReason={!isAahar && classificationDone
              ? `The backend classification is "${cr.categoryDisplayName}" — Ayurveda-Aahar (food) requirements do not appear applicable.`
              : !classificationDone
                ? 'Complete product classification to determine whether food requirements apply.'
                : undefined}
            details={aaharDetails}
          />

          {/* 7. Cosmetic Requirements (conditional) */}
          <ConditionalRequirementCard
            icon={<Sparkles size={20} />}
            title={t('regulatoryCheck.cards.cosmetic', 'Ayurvedic Cosmetic Requirements')}
            applicable={isCosmetic}
            explanation={isCosmetic
              ? `This product has been classified as ${cr.categoryDisplayName}. Drugs and Cosmetics Act Section 3(aaa) and related rules apply.`
              : ''}
            applicableReason={!isCosmetic && classificationDone
              ? `The backend classification is "${cr.categoryDisplayName}" — cosmetic-specific requirements do not appear applicable.`
              : !classificationDone
                ? 'Complete product classification to determine whether cosmetic requirements apply.'
                : undefined}
            details={cosmeticDetails}
          />

          {/* 8. Clinical / Human Evidence */}
          <RequirementCard
            icon={<Stethoscope size={20} />}
            title={t('regulatoryCheck.cards.clinicalEvidence', 'Clinical / Human Evidence')}
            status={classificationDone ? 'assessed' : 'not_assessed'}
            explanation="Evidence requirements depend on the product category, intended use, claims, jurisdiction, and applicable regulatory framework. Not all Ayurveda products require clinical trials."
            details={classificationDone ? [
              { label: 'Evidence Requirement', value: cr.clinicalTrialRequirement || 'Not available' },
            ] : null}
          />
        </div>
      </section>

      {/* ── RULE 158-B ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <Rule158BSection cr={cr} />
      </div>

      {/* ── SOURCE-GROUNDED GUIDANCE ────────────────────────────────────── */}
      <div className="mb-8">
        <SourceGroundedSection jurisdiction={effectiveJurisdiction} />
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate border-t border-border-color pt-5 mb-8 leading-relaxed">
        <strong>{t('common.disclaimer', 'Disclaimer:')}</strong> {t('common.disclaimerText', 'IP-SAKTI provides information and source-grounded guidance, not legal advice or a legal determination of protection.')}
      </p>

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t('regulatoryCheck.backToIp', 'Back to IP Protection')}
          className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          <ArrowLeft size={16} /> {t('regulatoryCheck.backToIp', 'Back to IP Protection')}
        </button>
        <button
          type="button"
          onClick={handleContinue}
          aria-label={t('regulatoryCheck.continueToAbs', 'Continue to ABS & Biodiversity')}
          className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          {t('regulatoryCheck.continueToAbs', 'Continue to ABS & Biodiversity')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default RegulatoryCheck;
