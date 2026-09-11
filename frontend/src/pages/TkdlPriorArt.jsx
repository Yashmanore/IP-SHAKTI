import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Search,
  BookOpen,
  RefreshCw,
  Info,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckSquare,
  Square,
  Globe,
  MapPin,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import { useJurisdiction } from '../context/JurisdictionContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TERMINOLOGY_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'other', label: 'Other' },
];

const PRIOR_ART_SCOPE_OPTIONS = [
  { value: 'patents', label: 'Patents' },
  { value: 'publications', label: 'Patent publications' },
  { value: 'literature', label: 'Scientific / technical literature' },
  { value: 'tk_sources', label: 'Traditional knowledge sources' },
  { value: 'official_records', label: 'Other official records' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Tri-option Yes / No / Not sure selector */
const TriOptionSelector = ({ id, value, onChange, label, helpText }) => {
  const { t } = useTranslation();
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-charcoal mb-2">{label}</legend>
      {helpText && <p className="text-xs text-slate mb-3 leading-relaxed">{helpText}</p>}
      <div className="flex flex-wrap gap-3">
        {[
          { value: 'yes', label: t('common.yes', 'Yes') },
          { value: 'no', label: t('common.no', 'No') },
          { value: 'not_sure', label: t('common.notSure', 'Not sure') },
        ].map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors
            ${value === opt.value
              ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green'
              : 'border-border-color bg-white text-charcoal hover:border-deep-teal hover:bg-warm-ivory'
            }`}
        >
          <input
            type="radio"
            name={id}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-forest-green"
          />
          {opt.label}
        </label>
      ))}
    </div>
  </fieldset>
  );
};

/** Checkbox multi-select */
const CheckboxGroup = ({ options, selected, onChange, label }) => {
  const { t } = useTranslation();
  const toggle = (val) => {
    onChange(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    );
  };
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-charcoal mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          const optLabel = t(`tkdlPriorArt.scopeOptions.${opt.value}`, opt.label);
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                ${checked
                  ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green font-medium'
                  : 'border-border-color bg-white text-charcoal hover:border-deep-teal hover:bg-warm-ivory'
                }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className="accent-forest-green"
              />
              {optLabel}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

/** Context card */
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

/** RAG search result card — shows only real backend fields */
const SearchResultCard = ({ result, index }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const meta = result.metadata || {};
  const title = meta.title || meta.source || `Result ${index + 1}`;
  const jurisdiction = meta.jurisdiction;
  const section = meta.section || meta.provision;
  const sourceUrl = meta.url || meta.sourceUrl;
  const score = typeof result.score === 'number' ? result.score.toFixed(3) : null;

  return (
    <div className="p-4 bg-white border border-border-color rounded-xl shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-charcoal">{title}</p>
            {jurisdiction && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-forest-green/10 text-forest-green border border-forest-green/20 font-medium">
                {jurisdiction === 'INDIA' ? t('common.india', 'India') : jurisdiction === 'INTERNATIONAL' ? t('common.international', 'International') : jurisdiction}
              </span>
            )}
          </div>
          {section && (
            <p className="text-xs text-muted-gold font-medium mb-1">{section}</p>
          )}
          <p className={`text-sm text-slate leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {result.text}
          </p>
          {result.text?.length > 200 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-forest-green hover:underline mt-1 focus:outline-none focus:ring-1 focus:ring-forest-green/50 rounded"
            >
              {expanded ? t('common.showLess', 'Show less') : t('common.showMore', 'Show more')}
            </button>
          )}
        </div>
        {score && (
          <span className="text-xs text-slate bg-warm-ivory border border-border-color px-2 py-0.5 rounded-full shrink-0 font-mono">
            {score}
          </span>
        )}
      </div>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-forest-green hover:underline mt-2 block focus:outline-none"
        >
          {t('common.viewSource', 'View source →')}
        </a>
      )}
    </div>
  );
};

/** Reusable search section with its own state */
const SearchSection = ({
  sectionId,
  heading,
  description,
  searchTerms,
  onSearchTermsChange,
  terminology,
  onTerminologyChange,
  showTerminology,
  searchScope,
  onScopeChange,
  showScope,
  onSearch,
  loading,
  results,
  error,
  notConnected,
  emptyMessage,
  loadingMessage,
  errorMessage,
}) => {
  const { t } = useTranslation();
  return (
    <section className="card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Search size={18} className="text-muted-gold" />
        <h2 className="text-lg font-heading font-semibold text-charcoal">{heading}</h2>
      </div>
      {description && <p className="text-sm text-slate mb-5 leading-relaxed">{description}</p>}

      <div className="space-y-4">
        <div>
          <label htmlFor={`${sectionId}-terms`} className="block text-sm font-medium text-charcoal mb-1.5">
            {t('tkdlPriorArt.searchTerms', 'Search terms')}
          </label>
          <textarea
            id={`${sectionId}-terms`}
            value={searchTerms}
            onChange={(e) => onSearchTermsChange(e.target.value)}
            placeholder={t('tkdlPriorArt.searchTermsPlaceholder', 'Enter keywords or terms to search')}
            rows={2}
            className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
          />
        </div>

        {showTerminology && (
          <div>
            <label htmlFor={`${sectionId}-lang`} className="block text-sm font-medium text-charcoal mb-2">
              {t('tkdlPriorArt.languageTerminology', 'Language / terminology')}
            </label>
            <div className="flex flex-wrap gap-2">
              {TERMINOLOGY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                    ${terminology === opt.value
                      ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green font-medium'
                      : 'border-border-color bg-white text-charcoal hover:border-deep-teal'
                    }`}
                >
                  <input
                    type="radio"
                    name={`${sectionId}-lang`}
                    value={opt.value}
                    checked={terminology === opt.value}
                    onChange={() => onTerminologyChange(opt.value)}
                    className="accent-forest-green"
                  />
                  {t(`tkdlPriorArt.terminology.${opt.value}`, opt.label)}
                </label>
              ))}
            </div>
          </div>
        )}

        {showScope && (
          <CheckboxGroup
            options={PRIOR_ART_SCOPE_OPTIONS}
            selected={searchScope}
            onChange={onScopeChange}
            label={t('tkdlPriorArt.searchScope', 'Search scope')}
          />
        )}

        <button
          type="button"
          onClick={onSearch}
          disabled={loading || !searchTerms.trim()}
          aria-label={`Run ${heading} search`}
          className="flex items-center gap-2 bg-forest-green text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> {loadingMessage}</>
          ) : (
            <><Search size={16} /> {t('sourceExplorer.searchButton', 'Search')}</>
          )}
        </button>
      </div>

      {/* Results area */}
      <div className="mt-5 pt-5 border-t border-border-color">
        {!results && !loading && !error && !notConnected && (
          <p className="text-sm text-slate italic">
            {t('tkdlPriorArt.enterTermsPrompt', 'Enter search terms above to search available records.')}
          </p>
        )}

        {notConnected && !loading && !results && !error && (
          <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
            <Info size={16} className="text-slate shrink-0 mt-0.5" />
            <p className="text-slate">
              {notConnected}
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-4 text-slate text-sm">
            <Loader2 size={16} className="animate-spin" /> {loadingMessage}
          </div>
        )}

        {error === 'service_unavailable' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-charcoal">{errorMessage}</p>
              <p className="text-slate mt-0.5">{t('tkdlPriorArt.errorTkdl', 'The search service is not reachable. Please try again when the backend is running.')}</p>
            </div>
            <button type="button" onClick={onSearch} disabled={!searchTerms.trim()} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none disabled:opacity-40">{t('common.retry', 'Retry')}</button>
          </div>
        )}

        {error && error !== 'service_unavailable' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
            <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-charcoal">{errorMessage}</p>
              <p className="text-slate mt-0.5">{error}</p>
            </div>
            <button type="button" onClick={onSearch} disabled={!searchTerms.trim()} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none disabled:opacity-40">{t('common.retry', 'Retry')}</button>
          </div>
        )}

        {results && results.length === 0 && (
          <p className="text-sm text-slate italic py-2">{emptyMessage}</p>
        )}

        {results && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate font-medium">
              {results.length} {t('common.records', 'records')}
            </p>
            {results.map((r, i) => (
              <SearchResultCard key={i} result={r} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const TkdlPriorArt = () => {
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
  const jParam = effectiveJurisdiction === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'INDIA';

  // ── Section 1: Search subject ──
  const [subjectName, setSubjectName] = useState(assessmentContext?.productName || '');
  const [subjectIngredients, setSubjectIngredients] = useState(
    assessmentContext?.mainIngredients || ''
  );
  const [subjectUse, setSubjectUse] = useState('');
  const [subjectProcess, setSubjectProcess] = useState('');

  // ── Section 2: TK relevance ──
  const [tkRelevance, setTkRelevance] = useState('');

  // ── Section 3: TKDL Search ──
  const [tkdlTerms, setTkdlTerms] = useState('');
  const [tkdlTerminology, setTkdlTerminology] = useState('english');
  const [tkdlResults, setTkdlResults] = useState(null);
  const [tkdlLoading, setTkdlLoading] = useState(false);
  const [tkdlError, setTkdlError] = useState(null);

  // ── Section 4: Prior Art ──
  const [priorArtTerms, setPriorArtTerms] = useState('');
  const [priorArtScope, setPriorArtScope] = useState([]);
  const [priorArtResults, setPriorArtResults] = useState(null);
  const [priorArtLoading, setPriorArtLoading] = useState(false);
  const [priorArtError, setPriorArtError] = useState(null);

  // ── RAG search helper ──
  const ragSearch = useCallback(async (query) => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/rag/search?query=${encodeURIComponent(query)}&jurisdiction=${jParam}&maxResults=6&minScore=0.60`
    );
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  }, [jParam]);

  const classifyError = (err) =>
    err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
      ? 'service_unavailable'
      : err.message || 'Unknown error';

  // TKDL search — uses the RAG endpoint with a TK-focused query
  const handleTkdlSearch = useCallback(async () => {
    if (!tkdlTerms.trim()) return;
    setTkdlLoading(true);
    setTkdlError(null);
    setTkdlResults(null);
    try {
      const query = `traditional knowledge TKDL ayurveda ${tkdlTerms.trim()}`;
      const data = await ragSearch(query);
      setTkdlResults(data);
    } catch (err) {
      setTkdlError(classifyError(err));
    } finally {
      setTkdlLoading(false);
    }
  }, [tkdlTerms, ragSearch]);

  // Prior-art search — uses the RAG endpoint with a prior-art-focused query
  const handlePriorArtSearch = useCallback(async () => {
    if (!priorArtTerms.trim()) return;
    setPriorArtLoading(true);
    setPriorArtError(null);
    setPriorArtResults(null);
    try {
      const scopeContext = priorArtScope.join(' ');
      const query = `prior art patent ayurveda ${priorArtTerms.trim()} ${scopeContext}`.trim();
      const data = await ragSearch(query);
      setPriorArtResults(data);
    } catch (err) {
      setPriorArtError(classifyError(err));
    } finally {
      setPriorArtLoading(false);
    }
  }, [priorArtTerms, priorArtScope, ragSearch]);

  const handleBack = () => navigate('/abs-biodiversity', { state: effectiveContext });
  const handleContinue = () =>
    navigate('/guidance', {
      state: {
        ...effectiveContext,
        jurisdiction: effectiveJurisdiction,
        tkdlAssessment: {
          tkRelevance,
          subjectName,
          subjectIngredients,
          subjectUse,
          subjectProcess,
        },
      },
    });

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Product Classification', path: '/product-classification' },
          { label: 'IP Protection', path: '/ip-protection' },
          { label: 'Regulatory Check', path: '/regulatory-check' },
          { label: 'ABS & Biodiversity', path: '/abs-biodiversity' },
          { label: 'TKDL / Prior Art', path: '/tkdl-prior-art' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('tkdlPriorArt.title', 'TKDL / Prior Art')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('tkdlPriorArt.subtitle', 'Check traditional-knowledge relevance and prepare prior-art research for Ayurveda-related IP assessment.')}
        </p>
      </div>

      {/* Stepper */}
      <AssessmentStepper activeKey="tkdl" />

      {/* Context */}
      <ContextCard context={assessmentContext} onGoToAsk={() => navigate('/ask-ip-sakti')} />

      {/* Search limitations notice */}
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-8 text-sm">
        <Info size={16} className="text-slate shrink-0 mt-0.5" />
        <p className="text-slate leading-relaxed">
          {t('tkdlPriorArt.limitationsNotice', 'Search results are not legal determinations of novelty, inventive step, patentability, infringement, or ownership. Results reflect records available in the connected source repository and require further professional review.')}
        </p>
      </div>

      <div className="space-y-6">

        {/* ── SECTION 1: SEARCH SUBJECT ──────────────────────────────── */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-muted-gold" />
            <h2 className="text-lg font-heading font-semibold text-charcoal">
              {t('tkdlPriorArt.subjectHeading', 'Search Subject')}
            </h2>
          </div>
          <p className="text-sm text-slate mb-5 leading-relaxed">
            {t('tkdlPriorArt.subjectDesc', 'Confirm or update the details to be used in the TKDL and prior-art search. Fields prefilled from the current assessment where available.')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="subjectName" className="block text-sm font-medium text-charcoal mb-1.5">
                {t('tkdlPriorArt.subjectFormulationName', 'Subject / formulation name')}
              </label>
              <input
                id="subjectName"
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder={t('tkdlPriorArt.subjectNamePlaceholder', 'Enter or confirm subject name')}
                className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="subjectUse" className="block text-sm font-medium text-charcoal mb-1.5">
                {t('tkdlPriorArt.subjectUse', 'Traditional use / therapeutic purpose')}
              </label>
              <input
                id="subjectUse"
                type="text"
                value={subjectUse}
                onChange={(e) => setSubjectUse(e.target.value)}
                placeholder={t('tkdlPriorArt.subjectUsePlaceholder', 'e.g. anti-inflammatory, digestive aid')}
                className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="subjectIngredients" className="block text-sm font-medium text-charcoal mb-1.5">
                {t('tkdlPriorArt.subjectIngredients', 'Key ingredients / biological resources')}
              </label>
              <textarea
                id="subjectIngredients"
                value={subjectIngredients}
                onChange={(e) => setSubjectIngredients(e.target.value)}
                placeholder={t('tkdlPriorArt.subjectIngredientsPlaceholder', 'List key ingredients or biological resources')}
                rows={2}
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="subjectProcess" className="block text-sm font-medium text-charcoal mb-1.5">
                {t('tkdlPriorArt.subjectProcess', 'Preparation / process details')}
              </label>
              <textarea
                id="subjectProcess"
                value={subjectProcess}
                onChange={(e) => setSubjectProcess(e.target.value)}
                placeholder={t('tkdlPriorArt.subjectProcessPlaceholder', 'Describe the preparation method or process, if relevant')}
                rows={2}
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* ── SECTION 2: TK RELEVANCE ────────────────────────────────── */}
        <section className="card p-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-muted-gold" />
            <h2 className="text-lg font-heading font-semibold text-charcoal">
              {t('tkdlPriorArt.tkRelevanceHeading', 'Traditional Knowledge Relevance')}
            </h2>
          </div>
          <p className="text-sm text-slate mb-5 leading-relaxed">
            {t('tkdlPriorArt.tkRelevanceDesc', 'Traditional knowledge (TK) relevance affects patent eligibility, TKDL search scope, and prior-art considerations for Ayurveda-related IP.')}
          </p>

          <TriOptionSelector
            id="tkRelevance"
            value={tkRelevance}
            onChange={setTkRelevance}
            label={t('tkdlPriorArt.tkRelevanceQuestion', 'Could the subject be based on, derived from, or related to documented traditional knowledge?')}
          />

          {tkRelevance === 'yes' && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg text-sm">
              <Info size={16} className="text-forest-green shrink-0 mt-0.5" />
              <p className="text-slate leading-relaxed">
                {t('tkdlPriorArt.tkRelevanceYes', 'Traditional-knowledge research may be relevant to this assessment. TKDL records and related source materials should be reviewed as part of the prior-art assessment. This is an informational indicator only.')}
              </p>
            </div>
          )}
          {tkRelevance === 'no' && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
              <Info size={16} className="text-slate shrink-0 mt-0.5" />
              <p className="text-slate">
                {t('tkdlPriorArt.tkRelevanceNo', 'No traditional-knowledge relevance indicated. Prior-art research may still be appropriate depending on the formulation and IP goals.')}
              </p>
            </div>
          )}
          {tkRelevance === 'not_sure' && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
              <HelpCircle size={16} className="text-slate shrink-0 mt-0.5" />
              <p className="text-slate leading-relaxed">
                {t('tkdlPriorArt.tkRelevanceNotSure', 'Further source research may be useful to determine whether relevant traditional knowledge is documented. Consider reviewing classical Ayurvedic texts and TKDL records.')}
              </p>
            </div>
          )}

          {/* Patentability verdict from classification if available */}
          {cr?.patentabilityVerdict && (
            <div className="mt-4 p-4 bg-warm-ivory border border-border-color rounded-lg">
              <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-1">
                {t('tkdlPriorArt.fromClassification', 'From classification result')}
              </p>
              <p className="text-sm text-charcoal leading-relaxed">{cr.patentabilityVerdict}</p>
              {cr.relevantPatentSections?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {cr.relevantPatentSections.map((s, i) => (
                    <li key={i} className="text-xs text-muted-gold font-medium flex items-center gap-1.5">
                      <span className="text-muted-gold">•</span> {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* ── SECTION 3: TKDL SEARCH ─────────────────────────────────── */}
        <SearchSection
          sectionId="tkdl"
          heading={t('tkdlPriorArt.tkdlSearchTitle', 'TKDL Search')}
          description={`${t('tkdlPriorArt.tkdlSearchDesc', 'Search the connected source repository for records relevant to traditional Ayurvedic knowledge. Results are source records only — not legal determinations.')} ${t('common.jurisdictionLabel', 'Jurisdiction')}: ${effectiveJurisdiction === 'INTERNATIONAL' ? t('common.international', 'International') : t('common.india', 'India')}.`}
          searchTerms={tkdlTerms}
          onSearchTermsChange={setTkdlTerms}
          terminology={tkdlTerminology}
          onTerminologyChange={setTkdlTerminology}
          showTerminology={true}
          searchScope={[]}
          onScopeChange={() => {}}
          showScope={false}
          onSearch={handleTkdlSearch}
          loading={tkdlLoading}
          results={tkdlResults}
          error={tkdlError}
          notConnected={null}
          emptyMessage={t('tkdlPriorArt.emptyTkdl', 'No TKDL records were returned for this search.')}
          loadingMessage={t('tkdlPriorArt.searchingTkdl', 'Searching TKDL…')}
          errorMessage={t('tkdlPriorArt.errorTkdl', 'TKDL search could not be completed.')}
        />

        {/* ── SECTION 4: PRIOR ART ───────────────────────────────────── */}
        <SearchSection
          sectionId="prior-art"
          heading={t('tkdlPriorArt.priorArtTitle', 'Prior Art')}
          description={t('tkdlPriorArt.priorArtDesc', 'Search the connected source repository for prior-art records relevant to the subject matter. Results are source records only — not legal conclusions about novelty or patentability.')}
          searchTerms={priorArtTerms}
          onSearchTermsChange={setPriorArtTerms}
          terminology="english"
          onTerminologyChange={() => {}}
          showTerminology={false}
          searchScope={priorArtScope}
          onScopeChange={setPriorArtScope}
          showScope={true}
          onSearch={handlePriorArtSearch}
          loading={priorArtLoading}
          results={priorArtResults}
          error={priorArtError}
          notConnected={null}
          emptyMessage={t('tkdlPriorArt.emptyPriorArt', 'No prior-art results returned for this search.')}
          loadingMessage={t('tkdlPriorArt.searchingPriorArt', 'Searching prior-art records…')}
          errorMessage={t('tkdlPriorArt.errorPriorArt', 'Prior-art search could not be completed.')}
        />

        {/* ── PRELIMINARY RELEVANCE ─────────────────────────────────── */}
        <section className="card p-6">
          <h2 className="text-lg font-heading font-semibold text-charcoal mb-3">
            {t('tkdlPriorArt.preliminaryRelevanceHeading', 'Preliminary Relevance')}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium bg-slate/10 text-slate border-slate/20">
              {t('tkdlPriorArt.notAssessed', 'Not assessed')}
            </span>
          </div>
          <p className="text-sm text-slate leading-relaxed">
            {t('tkdlPriorArt.preliminaryRelevanceDesc', 'Run a supported search above to obtain source records for preliminary review. Preliminary relevance will reflect only what is returned by the connected source repository — not an independent legal conclusion.')}
          </p>
          {(tkdlResults?.length > 0 || priorArtResults?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-border-color">
              <p className="text-sm text-charcoal">
                <span className="font-medium">{(tkdlResults?.length || 0) + (priorArtResults?.length || 0)}</span> {t('tkdlPriorArt.recordsReturned', 'source record(s) returned across search(es). Review the results above for relevant records.')}
              </p>
              <p className="text-xs text-slate mt-1">
                {t('tkdlPriorArt.sourceRecordsNotice', 'These results are source records only. They do not constitute a finding of novelty, non-novelty, patentability, or infringement.')}
              </p>
            </div>
          )}
        </section>

        {/* ── JURISDICTION CONTEXT ───────────────────────────────────── */}
        {effectiveJurisdiction === 'INTERNATIONAL' ? (
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-forest-green" />
              <h2 className="text-base font-heading font-semibold text-charcoal">
                {t('tkdlPriorArt.intlContextTitle', 'International Research Context')}
              </h2>
            </div>
            <p className="text-sm text-slate leading-relaxed">
              {t('tkdlPriorArt.intlContextDesc', 'International prior-art research requirements vary by jurisdiction. Patent offices and databases relevant to the destination market should be consulted.')}
              {assessmentContext?.destinationMarket && (
                <span className="block mt-1">
                  <strong className="text-charcoal">{t('absBiodiversity.destinationMarket', 'Destination market:')}</strong> {assessmentContext.destinationMarket}
                </span>
              )}
            </p>
          </section>
        ) : (
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-forest-green" />
              <h2 className="text-base font-heading font-semibold text-charcoal">
                {t('tkdlPriorArt.indiaContextTitle', 'India – TKDL & Prior-Art Context')}
              </h2>
            </div>
            <p className="text-sm text-slate leading-relaxed">
              {t('tkdlPriorArt.indiaContextDesc', 'India-specific TKDL and prior-art searches are relevant to assessing Indian patent eligibility, particularly under Section 3(p) of the Patents Act 1970 which bars patenting of traditional knowledge.')}
            </p>
            {cr?.patentabilityVerdict && (
              <p className="text-sm text-charcoal mt-3 font-medium">
                {t('tkdlPriorArt.fromClassification', 'Patentability assessment from classification engine is available — see "Traditional Knowledge Relevance" section above.')}
              </p>
            )}
          </section>
        )}

        {/* ── NEXT STEPS ────────────────────────────────────────────── */}
        <section className="card p-6">
          <h2 className="text-lg font-heading font-semibold text-charcoal mb-4">
            {t('tkdlPriorArt.nextStepsTitle', 'Next Steps')}
          </h2>
          <p className="text-sm text-slate mb-4">
            {t('tkdlPriorArt.nextStepsDesc', 'These are suggested workflow steps. Items are not marked complete automatically.')}
          </p>
          <ul className="space-y-3">
            {[
              { key: 'verifyTk', defaultLabel: 'Verify traditional-knowledge relevance based on source records', done: tkRelevance === 'yes' || tkRelevance === 'no' },
              { key: 'reviewRecords', defaultLabel: 'Review TKDL and prior-art source records returned by the search', done: (tkdlResults?.length > 0 || priorArtResults?.length > 0) },
              { key: 'checkPatentEligibility', defaultLabel: 'Check patent eligibility requirements based on product classification', done: !!cr?.patentabilityVerdict },
              { key: 'reviewCitations', defaultLabel: 'Review relevant source citations with legal or IP professional', done: false },
              { key: 'escalateExpert', defaultLabel: 'Escalate complex or low-confidence cases to an IP expert', done: false },
            ].map((step) => (
              <li key={step.key} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 shrink-0 ${step.done ? 'text-success' : 'text-border-color'}`}>
                  {step.done
                    ? <CheckSquare size={16} className="text-success" />
                    : <Square size={16} className="text-slate/40" />
                  }
                </span>
                <span className={step.done ? 'text-charcoal' : 'text-slate'}>
                  {t(`tkdlPriorArt.nextStepsItems.${step.key}`, step.defaultLabel)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-slate border-t border-border-color pt-5 leading-relaxed">
          <strong>{t('common.disclaimer', 'Disclaimer:')}</strong> {t('common.disclaimerText', 'IP-SAKTI provides information and source-grounded guidance, not legal advice or a legal determination of protection.')}
        </p>

        {/* Bottom navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleBack}
            aria-label={t('tkdlPriorArt.backToAbs', 'Back to ABS & Biodiversity')}
            className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            <ArrowLeft size={16} /> {t('tkdlPriorArt.backToAbs', 'Back to ABS & Biodiversity')}
          </button>
          <button
            type="button"
            onClick={handleContinue}
            aria-label={t('tkdlPriorArt.continueToGuidance', 'Continue to Final Guidance')}
            className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            {t('tkdlPriorArt.continueToGuidance', 'Continue to Final Guidance')} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TkdlPriorArt;
