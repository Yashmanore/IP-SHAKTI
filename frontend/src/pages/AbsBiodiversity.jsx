import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Leaf,
  BookOpen,
  RefreshCw,
  Info,
  CircleCheck,
  Circle,
  Globe,
  MapPin,
  HelpCircle,
  FileText,
  Users,
  Database,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function hasNbaData(cr) {
  return !!(cr?.nbaComplianceStatus || cr?.requiredNbaForm);
}

function hasClassification(cr) {
  return !!cr?.category;
}

// Derive the overall ABS status label from available data
function deriveAbsStatus(cr, bioResource, tradKnowledge) {
  if (!cr && bioResource === '' && tradKnowledge === '') return 'not_assessed';
  if (bioResource === 'no' && tradKnowledge === 'no') return 'more_info'; // still needs review
  if (hasNbaData(cr)) return 'guidance_available';
  if (bioResource === 'yes' || tradKnowledge === 'yes') return 'more_info';
  if (bioResource === 'not_sure' || tradKnowledge === 'not_sure') return 'more_info';
  return 'not_assessed';
}

const ABS_STATUS_CONFIG = {
  not_assessed: {
    label: 'Not assessed',
    style: 'bg-slate/10 text-slate border-slate/20',
    description: 'Provide biological-resource and traditional-knowledge details to support the ABS assessment.',
  },
  more_info: {
    label: 'More information required',
    style: 'bg-warning/10 text-warning border-warning/30',
    description: 'Additional details about biological resources and/or traditional knowledge are needed to complete the ABS review.',
  },
  guidance_available: {
    label: 'Guidance available',
    style: 'bg-muted-gold/10 text-muted-gold border-muted-gold/30',
    description: 'ABS-related guidance is available from the backend classification engine based on the product information provided.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Shared tri-option radio selector (Yes / No / Not sure) */
const TriOptionSelector = ({ id, value, onChange, label, helpText }) => {
  const options = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'not_sure', label: 'Not sure' },
  ];
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-charcoal mb-2">
        {label}
      </legend>
      {helpText && <p className="text-xs text-slate mb-3">{helpText}</p>}
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
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

/** Context card */
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

/** ABS status summary card */
const AbsStatusCard = ({ status, cr }) => {
  const config = ABS_STATUS_CONFIG[status] || ABS_STATUS_CONFIG.not_assessed;
  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-lg bg-warm-ivory flex items-center justify-center text-forest-green shrink-0">
        <Leaf size={20} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h3 className="text-base font-semibold text-charcoal">ABS Assessment Status</h3>
          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${config.style}`}>
            {config.label}
          </span>
        </div>
        <p className="text-sm text-slate leading-relaxed">{config.description}</p>

        {/* Show NBA guidance from classification if available */}
        {hasNbaData(cr) && (
          <div className="mt-4 space-y-3 pt-4 border-t border-border-color">
            {cr.nbaComplianceStatus && (
              <div>
                <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">
                  NBA / Biodiversity Compliance Status
                </p>
                <p className="text-sm text-charcoal leading-relaxed">{cr.nbaComplianceStatus}</p>
              </div>
            )}
            {cr.requiredNbaForm && (
              <div>
                <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">
                  Required NBA Form
                </p>
                <p className="text-sm text-charcoal">{cr.requiredNbaForm}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Checklist item — only ticked when data actually confirms it */
const ChecklistItem = ({ label, ticked, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-border-color last:border-0">
    <div className={`mt-0.5 shrink-0 ${ticked ? 'text-success' : 'text-slate/40'}`}>
      {ticked ? <CircleCheck size={16} /> : <Circle size={16} />}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-medium ${ticked ? 'text-charcoal' : 'text-slate'}`}>{label}</p>
      {value && (
        <p className="text-xs text-slate mt-0.5">{value}</p>
      )}
    </div>
    {!ticked && (
      <span className="text-xs text-slate bg-warm-ivory border border-border-color px-2 py-0.5 rounded-full shrink-0">
        Not provided
      </span>
    )}
  </div>
);

/** Source-Grounded section using RAG */
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
        `${API_BASE_URL}/api/v1/rag/search?query=biological+diversity+access+benefit+sharing+ayurveda&jurisdiction=${j}&maxResults=5&minScore=0.65`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setSources(data);
    } catch (err) {
      setError(
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? 'service_unavailable'
          : err.message || 'Unknown error'
      );
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
            Source-Grounded Guidance
          </h2>
          <p className="text-sm text-slate leading-relaxed">
            IP-SAKTI uses authoritative legal and biodiversity-related sources to support its guidance. Source records will appear here when available.
          </p>
        </div>
      </div>

      {!sources && !loading && !error && (
        <div className="flex flex-col items-center py-8 text-center">
          <p className="text-sm text-slate mb-4">
            No source-grounded ABS guidance is available for this assessment yet.
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
          <Loader2 size={16} className="animate-spin" /> Searching authoritative biodiversity sources…
        </div>
      )}

      {error === 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">Source search service is not connected yet.</p>
            <p className="text-slate mt-0.5">Source records will appear when the RAG service is available.</p>
          </div>
          <button type="button" onClick={fetchSources} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none">Retry</button>
        </div>
      )}

      {error && error !== 'service_unavailable' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
          <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-charcoal">ABS assessment could not be loaded.</p>
            <p className="text-slate mt-0.5">{error}</p>
          </div>
          <button type="button" onClick={fetchSources} className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none">Retry</button>
        </div>
      )}

      {sources && sources.length === 0 && (
        <p className="text-sm text-slate italic py-4">
          No matching ABS source records found for this jurisdiction.
        </p>
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
const AbsBiodiversity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentContext = location.state || null;
  const cr = assessmentContext?.classificationResult || null;
  const jurisdiction = assessmentContext?.jurisdiction || null;

  // ── Local ABS input state ──
  const [bioResource, setBioResource] = useState('');
  const [bioResourceName, setBioResourceName] = useState('');
  const [bioResourceOrigin, setBioResourceOrigin] = useState('');
  const [bioResourceCountry, setBioResourceCountry] = useState('');
  const [bioResourceUse, setBioResourceUse] = useState('');

  const [tradKnowledge, setTradKnowledge] = useState('');
  const [tkDescription, setTkDescription] = useState('');
  const [tkSourceType, setTkSourceType] = useState('');
  const [tkCommunity, setTkCommunity] = useState('');
  const [tkPubliclyDocumented, setTkPubliclyDocumented] = useState('');

  const absStatus = deriveAbsStatus(cr, bioResource, tradKnowledge);

  // Carry updated state forward
  const buildForwardState = () => ({
    ...assessmentContext,
    absAssessment: {
      bioResource,
      bioResourceName: bioResource === 'yes' ? bioResourceName : null,
      bioResourceOrigin: bioResource === 'yes' ? bioResourceOrigin : null,
      bioResourceCountry: bioResource === 'yes' ? bioResourceCountry : null,
      bioResourceUse: bioResource === 'yes' ? bioResourceUse : null,
      tradKnowledge,
      tkDescription: tradKnowledge === 'yes' ? tkDescription : null,
      tkSourceType: tradKnowledge === 'yes' ? tkSourceType : null,
      tkCommunity: tradKnowledge === 'yes' ? tkCommunity : null,
      tkPubliclyDocumented: tradKnowledge === 'yes' ? tkPubliclyDocumented : null,
    },
  });

  const handleBack = () => navigate('/regulatory-check', { state: assessmentContext });
  const handleContinue = () => navigate('/tkdl-prior-art', { state: buildForwardState() });

  // Checklist resolution
  const checklistItems = [
    {
      label: 'Biological resource identified',
      ticked: bioResource === 'yes' && !!bioResourceName.trim(),
      value: bioResource === 'yes' && bioResourceName ? bioResourceName : null,
    },
    {
      label: 'Source/origin documented',
      ticked: bioResource === 'yes' && !!bioResourceOrigin.trim(),
      value: bioResource === 'yes' && bioResourceOrigin ? bioResourceOrigin : null,
    },
    {
      label: 'Country of origin identified',
      ticked: bioResource === 'yes' && !!bioResourceCountry.trim(),
      value: bioResource === 'yes' && bioResourceCountry ? bioResourceCountry : null,
    },
    {
      label: 'Traditional knowledge involvement identified',
      ticked: tradKnowledge === 'yes' || tradKnowledge === 'no',
      value: tradKnowledge
        ? tradKnowledge === 'yes'
          ? 'Traditional knowledge involvement indicated'
          : tradKnowledge === 'no'
            ? 'No traditional knowledge involvement indicated'
            : null
        : null,
    },
    {
      label: 'Knowledge source / community identified where applicable',
      ticked: tradKnowledge === 'yes' && !!tkCommunity.trim(),
      value: tradKnowledge === 'yes' && tkCommunity ? tkCommunity : null,
    },
    {
      label: 'Access documentation available where applicable',
      ticked: false, // No document upload system implemented yet
      value: null,
    },
    {
      label: 'Benefit-sharing obligations assessed',
      ticked: hasNbaData(cr),
      value: cr?.nbaComplianceStatus || null,
    },
    {
      label: 'Relevant authority / source records reviewed',
      ticked: false,
      value: null,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Product Classification', path: '/product-classification' },
          { label: 'IP Protection', path: '/ip-protection' },
          { label: 'Regulatory Check', path: '/regulatory-check' },
          { label: 'ABS & Biodiversity', path: '/abs-biodiversity' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">ABS & Biodiversity</h1>
        <p className="text-slate text-base leading-relaxed">
          Assess potential Access and Benefit-Sharing considerations related to biological resources and traditional knowledge.
        </p>
      </div>

      {/* Stepper */}
      <AssessmentStepper activeKey="abs" />

      {/* Assessment Context */}
      <ContextCard context={assessmentContext} onGoToAsk={() => navigate('/ask-ip-sakti')} />

      {/* ABS Status Card */}
      <AbsStatusCard status={absStatus} cr={cr} />

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-8 text-sm">
        <Info size={16} className="text-slate shrink-0 mt-0.5" />
        <p className="text-slate leading-relaxed">
          This page helps identify whether ABS-related considerations may apply. It does not make a final legal determination.
          Where applicable, access to biological resources and associated traditional knowledge may involve Access and Benefit-Sharing obligations. Applicability depends on the resource, origin, knowledge context, jurisdiction, and applicable legal framework.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ── SECTION 1: BIOLOGICAL RESOURCE ───────────────────────── */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Leaf size={18} className="text-muted-gold" />
              <h2 className="text-lg font-heading font-semibold text-charcoal">Biological Resource</h2>
            </div>
            <p className="text-sm text-slate mb-5">
              Biological resources include plants, animals, micro-organisms, or their derivatives used in the product.
            </p>

            <TriOptionSelector
              id="bioResource"
              value={bioResource}
              onChange={setBioResource}
              label="Does the product/formulation use biological resources?"
            />

            {bioResource === 'not_sure' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
                <HelpCircle size={16} className="text-slate shrink-0 mt-0.5" />
                <p className="text-slate leading-relaxed">
                  Additional information may be required to determine whether biodiversity-related requirements apply. Consider consulting the relevant legal or scientific documentation.
                </p>
              </div>
            )}

            {bioResource === 'yes' && (
              <div className="mt-5 space-y-4 pt-5 border-t border-border-color">
                <p className="text-sm font-medium text-charcoal">Biological resource details</p>
                <div>
                  <label htmlFor="bioResourceName" className="block text-sm font-medium text-charcoal mb-1.5">
                    Biological resource identified
                  </label>
                  <input
                    id="bioResourceName"
                    type="text"
                    value={bioResourceName}
                    onChange={(e) => setBioResourceName(e.target.value)}
                    placeholder="Name or description of the biological resource"
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="bioResourceOrigin" className="block text-sm font-medium text-charcoal mb-1.5">
                    Source / origin
                  </label>
                  <input
                    id="bioResourceOrigin"
                    type="text"
                    value={bioResourceOrigin}
                    onChange={(e) => setBioResourceOrigin(e.target.value)}
                    placeholder="Where the resource is sourced or obtained from"
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="bioResourceCountry" className="block text-sm font-medium text-charcoal mb-1.5">
                    Country / region of origin
                  </label>
                  <input
                    id="bioResourceCountry"
                    type="text"
                    value={bioResourceCountry}
                    onChange={(e) => setBioResourceCountry(e.target.value)}
                    placeholder="Country or region where the resource originates"
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="bioResourceUse" className="block text-sm font-medium text-charcoal mb-1.5">
                    How the resource is used in the product
                  </label>
                  <textarea
                    id="bioResourceUse"
                    value={bioResourceUse}
                    onChange={(e) => setBioResourceUse(e.target.value)}
                    placeholder="Describe how this biological resource is used in the formulation or product"
                    rows={3}
                    className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
              </div>
            )}
          </section>

          {/* ── SECTION 2: TRADITIONAL KNOWLEDGE ─────────────────────── */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={18} className="text-muted-gold" />
              <h2 className="text-lg font-heading font-semibold text-charcoal">Traditional Knowledge</h2>
            </div>
            <p className="text-sm text-slate mb-5">
              Traditional knowledge refers to knowledge, innovations, or practices held by indigenous or local communities relating to biological resources.
            </p>

            <TriOptionSelector
              id="tradKnowledge"
              value={tradKnowledge}
              onChange={setTradKnowledge}
              label="Is the formulation, ingredient, preparation method, or use based on traditional knowledge?"
            />

            {tradKnowledge === 'not_sure' && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
                <HelpCircle size={16} className="text-slate shrink-0 mt-0.5" />
                <p className="text-slate leading-relaxed">
                  Additional information may be required to assess traditional-knowledge relevance. Consider reviewing classical Ayurvedic texts, TKDL records, and the product's knowledge history.
                </p>
              </div>
            )}

            {tradKnowledge === 'yes' && (
              <div className="mt-5 space-y-4 pt-5 border-t border-border-color">
                <p className="text-sm font-medium text-charcoal">Traditional knowledge details</p>
                <div>
                  <label htmlFor="tkDescription" className="block text-sm font-medium text-charcoal mb-1.5">
                    Traditional knowledge description
                  </label>
                  <textarea
                    id="tkDescription"
                    value={tkDescription}
                    onChange={(e) => setTkDescription(e.target.value)}
                    placeholder="Describe the traditional knowledge involved"
                    rows={3}
                    className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="tkSourceType" className="block text-sm font-medium text-charcoal mb-1.5">
                    Source / type of knowledge
                  </label>
                  <input
                    id="tkSourceType"
                    type="text"
                    value={tkSourceType}
                    onChange={(e) => setTkSourceType(e.target.value)}
                    placeholder="e.g. classical text, community practice, oral tradition"
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="tkCommunity" className="block text-sm font-medium text-charcoal mb-1.5">
                    Knowledge source / community, where applicable
                  </label>
                  <input
                    id="tkCommunity"
                    type="text"
                    value={tkCommunity}
                    onChange={(e) => setTkCommunity(e.target.value)}
                    placeholder="Community or group associated with this knowledge, if applicable"
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <TriOptionSelector
                    id="tkPubliclyDocumented"
                    value={tkPubliclyDocumented}
                    onChange={setTkPubliclyDocumented}
                    label="Is this knowledge publicly documented?"
                    helpText="For example, in classical Ayurvedic texts, published research, or databases such as TKDL."
                  />
                </div>
              </div>
            )}
          </section>

          {/* ── SECTION 3: JURISDICTION CONTEXT ────────────────────── */}
          {jurisdiction === 'INDIA' || !jurisdiction ? (
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-forest-green" />
                <h2 className="text-lg font-heading font-semibold text-charcoal">India – ABS Context</h2>
              </div>
              <p className="text-sm text-slate leading-relaxed mb-4">
                India-specific ABS considerations should be assessed using the applicable biodiversity framework and authoritative sources. The backend classification engine provides NBA-related guidance based on the applicant type and commercial utilization details provided during classification.
              </p>

              {hasNbaData(cr) ? (
                <dl className="divide-y divide-border-color">
                  {cr.nbaComplianceStatus && (
                    <div className="py-3">
                      <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">NBA Compliance Status</dt>
                      <dd className="text-sm text-charcoal leading-relaxed">{cr.nbaComplianceStatus}</dd>
                    </div>
                  )}
                  {cr.requiredNbaForm && (
                    <div className="py-3">
                      <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Required NBA Form</dt>
                      <dd className="text-sm text-charcoal">{cr.requiredNbaForm}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="p-4 bg-warm-ivory rounded-lg border border-border-color text-sm text-slate italic">
                  No India-specific source records are available for this assessment yet.
                  {!hasClassification(cr) && (
                    <span className="block mt-1">Complete the product classification to receive NBA guidance.</span>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={18} className="text-forest-green" />
                <h2 className="text-lg font-heading font-semibold text-charcoal">International – ABS Context</h2>
              </div>
              <p className="text-sm text-slate leading-relaxed mb-4">
                International ABS requirements vary by destination country and applicable international instruments. Jurisdiction-specific requirements require country-specific legal advice.
                {assessmentContext?.destinationMarket && (
                  <span className="block mt-2">
                    <strong className="text-charcoal">Destination market:</strong> {assessmentContext.destinationMarket}
                  </span>
                )}
              </p>
              <div className="p-4 bg-warm-ivory rounded-lg border border-border-color text-sm text-slate italic">
                International ABS source records are not available for this assessment yet.
              </div>
            </section>
          )}

          {/* ── SECTION 4: DOCUMENTATION NOTE ───────────────────────── */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-slate" />
              <h2 className="text-base font-heading font-semibold text-charcoal">Supporting Documentation</h2>
            </div>
            <p className="text-sm text-slate leading-relaxed">
              Supporting documentation can be attached when document support is available in a future version of this application.
            </p>
          </section>

          {/* Disclaimer */}
          <p className="text-xs text-slate border-t border-border-color pt-5 leading-relaxed">
            <strong>Disclaimer:</strong> IP-SAKTI provides information and source-grounded guidance, not legal advice or a final determination of ABS compliance or benefit-sharing obligations.
          </p>

          {/* Bottom navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back to Regulatory Check"
              className="flex items-center gap-2 text-sm font-medium text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              <ArrowLeft size={16} /> Back to Regulatory Check
            </button>
            <button
              type="button"
              onClick={handleContinue}
              aria-label="Continue to TKDL / Prior Art"
              className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              Continue to TKDL / Prior Art <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Checklist + Source ───────────────────────── */}
        <div className="space-y-6">

          {/* Information checklist */}
          <aside className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Database size={16} className="text-slate" />
              <h2 className="text-base font-heading font-semibold text-charcoal">Information Needed for ABS Review</h2>
            </div>
            <p className="text-xs text-slate mb-4 leading-relaxed">
              Items are marked complete only when the information has been provided in this assessment.
            </p>
            <div>
              {checklistItems.map((item) => (
                <ChecklistItem
                  key={item.label}
                  label={item.label}
                  ticked={item.ticked}
                  value={item.value}
                />
              ))}
            </div>
          </aside>

          {/* Source-grounded guidance */}
          <SourceGroundedSection jurisdiction={jurisdiction} />
        </div>
      </div>
    </div>
  );
};

export default AbsBiodiversity;
