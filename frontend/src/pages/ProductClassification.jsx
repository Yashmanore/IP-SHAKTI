import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PackageSearch,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Scale,
  Leaf,
  FileText,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import { classifyProduct } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Constants derived from backend enums (ClassificationRequest)
// ─────────────────────────────────────────────────────────────────────────────
const INTENDED_USE_OPTIONS = [
  {
    value: 'THERAPEUTIC_TREATMENT',
    label: 'Therapeutic treatment or disease mitigation',
    description: 'Products used to treat, mitigate, or prevent a disease or condition.',
  },
  {
    value: 'DIETARY_NUTRITION',
    label: 'Food, dietary, or nutritional support',
    description: 'Products intended as food supplements or nutritional support without therapeutic claims.',
  },
  {
    value: 'COSMETIC_BEAUTY',
    label: 'Cleansing, beautifying, skin, or hair application',
    description: 'Cosmetic products for skin/hair care that do not claim therapeutic effects.',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'A different intended use not listed above.',
  },
];

const APPLICANT_TYPE_OPTIONS = [
  { value: 'INDIAN_INDIVIDUAL', label: 'Indian individual / sole proprietor' },
  { value: 'INDIAN_COMPANY', label: 'Indian company / partnership / LLP' },
  { value: 'FOREIGN_ENTITY_OR_NRI', label: 'Foreign entity or NRI' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Radio card used for multi-choice questions */
const RadioCard = ({ id, name, value, checked, onChange, label, description }) => (
  <label
    htmlFor={id}
    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors
      ${checked
        ? 'border-forest-green bg-forest-green/5 ring-1 ring-forest-green'
        : 'border-border-color bg-white hover:border-deep-teal hover:bg-warm-ivory'
      }`}
  >
    <input
      type="radio"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="mt-0.5 accent-forest-green shrink-0"
    />
    <div>
      <span className={`text-sm font-medium ${checked ? 'text-forest-green' : 'text-charcoal'}`}>
        {label}
      </span>
      {description && (
        <p className="text-xs text-slate mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
  </label>
);

/** Three-option Yes/No/Not-sure control */
const TriStateRadio = ({ name, value, onChange, label, helpText, required }) => {
  const options = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
    { value: 'unsure', label: 'Not sure' },
  ];
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-2">
        {label}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
      </label>
      {helpText && <p className="text-xs text-slate mb-3">{helpText}</p>}
      <div className="flex gap-3 flex-wrap">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors
              ${value === opt.value
                ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green'
                : 'border-border-color bg-white text-charcoal hover:border-deep-teal'
              }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-forest-green"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
};

/** Result field row — shows "Not available" when value is absent */
const ResultField = ({ label, value, mono }) => {
  const isEmpty = value === null || value === undefined || value === '' ||
    (Array.isArray(value) && value.length === 0);
  return (
    <div className="py-3 border-b border-border-color last:border-0">
      <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{label}</dt>
      <dd className={`text-sm ${isEmpty ? 'text-slate italic' : 'text-charcoal'} ${mono ? 'font-mono' : ''}`}>
        {isEmpty
          ? 'Not available'
          : Array.isArray(value)
            ? (
              <ul className="space-y-1">
                {value.map((v, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-muted-gold mt-0.5">•</span>{v}</li>)}
              </ul>
            )
            : String(value)}
      </dd>
    </div>
  );
};

/** Context banner shown when coming from Ask IP-SAKTI */
const AssessmentContextBanner = ({ context, onGoToAsk }) => {
  const hasContext = context?.productName || context?.question || context?.jurisdiction;

  if (!hasContext) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
        <AlertCircle size={16} className="text-slate shrink-0 mt-0.5" />
        <div>
          <p className="text-charcoal font-medium">No assessment context available yet.</p>
          <button
            type="button"
            onClick={onGoToAsk}
            className="text-forest-green hover:underline mt-1 text-sm font-medium"
          >
            Start from Ask IP-SAKTI →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg mb-6 text-sm space-y-1.5">
      <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-2">Assessment Context</p>
      {context.productName && (
        <p><span className="font-medium text-charcoal">Product:</span> <span className="text-charcoal">{context.productName}</span></p>
      )}
      {context.jurisdiction && (
        <p><span className="font-medium text-charcoal">Jurisdiction:</span> <span className="text-charcoal">{context.jurisdiction === 'INDIA' ? 'India' : 'International'}</span></p>
      )}
      {context.question && (
        <p><span className="font-medium text-charcoal">Question:</span> <span className="text-slate italic">"{context.question}"</span></p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Category badge colors
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  CLASSICAL_AYURVEDIC_FORMULATION: 'bg-success/10 text-success border-success/30',
  PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A: 'bg-deep-teal/10 text-deep-teal border-deep-teal/30',
  PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B: 'bg-warning/10 text-warning border-warning/30',
  NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL: 'bg-muted-gold/10 text-muted-gold border-muted-gold/30',
  AYURVEDA_AAHAR: 'bg-forest-green/10 text-forest-green border-forest-green/30',
  AYURVEDIC_COSMETIC: 'bg-slate/10 text-slate border-slate/30',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductClassification Page
// ─────────────────────────────────────────────────────────────────────────────
const ProductClassification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Receive context passed via navigation state from Ask IP-SAKTI
  const assessmentContext = location.state || null;

  // ── Form state ──
  const [productName, setProductName] = useState(assessmentContext?.productName || '');
  const [ingredientsRaw, setIngredientsRaw] = useState(assessmentContext?.mainIngredients || '');
  const [intendedUse, setIntendedUse] = useState('');
  const [otherIntendedUse, setOtherIntendedUse] = useState('');
  const [matchesClassicalText, setMatchesClassicalText] = useState('');
  const [classicalTextName, setClassicalTextName] = useState('');
  const [formulaModified, setFormulaModified] = useState('');
  const [newIndicationOrRoute, setNewIndicationOrRoute] = useState('false');
  const [purifiedExtract, setPurifiedExtract] = useState('false');
  const [synergisticData, setSynergisticData] = useState('false');
  const [applicantType, setApplicantType] = useState('');
  const [commercialUse, setCommercialUse] = useState('');
  const [claimedIndication, setClaimedIndication] = useState('');

  // ── Advanced fields toggle ──
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── UI state ──
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [result, setResult] = useState(null);

  // ── Validation ──
  const validate = () => {
    if (!productName.trim()) {
      setValidationError('Please enter a product name.');
      return false;
    }
    if (!intendedUse) {
      setValidationError('Please select the primary intended use.');
      return false;
    }
    if (!matchesClassicalText) {
      setValidationError('Please indicate whether the formulation is from a classical Ayurvedic text.');
      return false;
    }
    if (!commercialUse) {
      setValidationError('Please indicate whether the product is intended for commercial use.');
      return false;
    }
    return true;
  };

  // ── Build the exact request payload matching ClassificationRequest ──
  const buildRequest = () => {
    // Parse comma/newline-separated ingredients into a string array
    const botanicalIngredients = ingredientsRaw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Map tri-state string → boolean (backend only accepts boolean for these)
    const boolOrFalse = (val) => val === 'true';

    // Map intendedUse: if "OTHER", we send THERAPEUTIC_TREATMENT as a safe default
    // and pass the custom text as claimedIndication.
    const backendIntendedUse = intendedUse === 'OTHER' ? 'THERAPEUTIC_TREATMENT' : intendedUse;

    return {
      productName: productName.trim(),
      botanicalIngredients,
      matchesScheduleIBook: boolOrFalse(matchesClassicalText),
      scheduleIBookName: matchesClassicalText === 'true' ? (classicalTextName.trim() || null) : null,
      formulaOrRatioModified: boolOrFalse(formulaModified),
      intendedUse: backendIntendedUse,
      claimedIndication: (intendedUse === 'OTHER' ? otherIntendedUse.trim() : claimedIndication.trim()) || null,
      newIndicationOrDosageRoute: boolOrFalse(newIndicationOrRoute),
      purifiedPhytochemicalExtract: boolOrFalse(purifiedExtract),
      synergisticDataAvailable: boolOrFalse(synergisticData),
      applicantType: applicantType || null,
      commercialUtilization: boolOrFalse(commercialUse),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setSubmitError(null);
    setServiceUnavailable(false);

    if (!validate()) return;
    setValidationError('');
    setIsSubmitting(true);

    try {
      const request = buildRequest();
      const data = await classifyProduct(request);
      if (!data || !data.category) {
        setSubmitError('No classification result was returned.');
      } else {
        setResult(data);
        // Scroll to result
        setTimeout(() => {
          document.getElementById('classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('net::ERR')) {
        setServiceUnavailable(true);
      } else {
        setSubmitError(err.message || 'Unable to interpret the classification response.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate('/ip-protection', {
      state: {
        ...assessmentContext,
        productName,
        classificationResult: result,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Ask IP-SAKTI', path: '/ask-ip-sakti' },
          { label: 'Product Classification', path: '/product-classification' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          Product Classification
        </h1>
        <p className="text-slate text-base leading-relaxed">
          Identify the relevant Ayurveda product category before assessing intellectual property and regulatory requirements.
        </p>
      </div>

      {/* 7-step Stepper */}
      <AssessmentStepper activeKey="classify" />

      {/* Assessment Context */}
      <AssessmentContextBanner
        context={assessmentContext}
        onGoToAsk={() => navigate('/ask-ip-sakti')}
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── MAIN COLUMN ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: Product Information */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <PackageSearch size={18} className="text-muted-gold" />
                <h2 className="text-lg font-heading font-semibold text-charcoal">Product Information</h2>
              </div>
              <p className="text-sm text-slate mb-5">
                Provide the details needed to determine the appropriate Ayurveda product category under Indian law.
              </p>

              {/* Product name */}
              <div className="mb-5">
                <label htmlFor="productName" className="block text-sm font-medium text-charcoal mb-1.5">
                  Product name <span className="text-error" aria-hidden="true">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setValidationError(''); }}
                  placeholder="Enter product name"
                  aria-required="true"
                  className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <label htmlFor="ingredients" className="block text-sm font-medium text-charcoal mb-1.5">
                  Ingredients / formulation details
                </label>
                <textarea
                  id="ingredients"
                  value={ingredientsRaw}
                  onChange={(e) => setIngredientsRaw(e.target.value)}
                  placeholder="Describe the main ingredients, formulation, preparation, or composition."
                  rows={4}
                  className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
                <p className="mt-1.5 text-xs text-slate">Separate multiple ingredients with commas or new lines.</p>
              </div>

              {/* Primary intended use */}
              <div className="mb-5">
                <fieldset>
                  <legend className="block text-sm font-medium text-charcoal mb-3">
                    Primary intended use <span className="text-error" aria-hidden="true">*</span>
                  </legend>
                  <div className="space-y-3">
                    {INTENDED_USE_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt.value}
                        id={`use-${opt.value}`}
                        name="intendedUse"
                        value={opt.value}
                        checked={intendedUse === opt.value}
                        onChange={() => { setIntendedUse(opt.value); setValidationError(''); }}
                        label={opt.label}
                        description={opt.description}
                      />
                    ))}
                  </div>
                </fieldset>
                {intendedUse === 'OTHER' && (
                  <div className="mt-3">
                    <label htmlFor="otherIntendedUse" className="block text-sm font-medium text-charcoal mb-1.5">
                      Please describe the intended use
                    </label>
                    <input
                      id="otherIntendedUse"
                      type="text"
                      value={otherIntendedUse}
                      onChange={(e) => setOtherIntendedUse(e.target.value)}
                      placeholder="Describe the intended use"
                      className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                    />
                  </div>
                )}
              </div>

              {/* Classical text */}
              <div className="mb-5">
                <TriStateRadio
                  name="matchesClassicalText"
                  value={matchesClassicalText}
                  onChange={(v) => { setMatchesClassicalText(v); setValidationError(''); }}
                  label="Is the formulation found in an authoritative classical Ayurvedic text?"
                  helpText="For example, Charaka Samhita, Sushruta Samhita, Sharangadhara Samhita, or other First Schedule books."
                  required
                />
                {matchesClassicalText === 'true' && (
                  <div className="mt-3">
                    <label htmlFor="classicalTextName" className="block text-sm font-medium text-charcoal mb-1.5">
                      Name of the classical text (optional)
                    </label>
                    <input
                      id="classicalTextName"
                      type="text"
                      value={classicalTextName}
                      onChange={(e) => setClassicalTextName(e.target.value)}
                      placeholder="e.g. Charaka Samhita"
                      className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                    />
                  </div>
                )}
                {matchesClassicalText === 'true' && (
                  <div className="mt-3">
                    <TriStateRadio
                      name="formulaModified"
                      value={formulaModified}
                      onChange={setFormulaModified}
                      label="Was the formula, ratio, or excipients modified from the classical text?"
                    />
                  </div>
                )}
              </div>

              {/* Commercial use */}
              <div>
                <TriStateRadio
                  name="commercialUse"
                  value={commercialUse}
                  onChange={(v) => { setCommercialUse(v); setValidationError(''); }}
                  label="Intended for commercial use?"
                  required
                />
              </div>
            </section>

            {/* SECTION 2: Applicant Type */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">Applicant / Manufacturer Type</h2>
              <p className="text-sm text-slate mb-4">
                Optional — helps determine NBA/ABS obligations and patent eligibility. If unsure, leave blank.
              </p>
              <div className="space-y-2">
                {APPLICANT_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors text-sm
                      ${applicantType === opt.value
                        ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green font-medium'
                        : 'border-border-color bg-white text-charcoal hover:border-deep-teal'
                      }`}
                  >
                    <input
                      type="radio"
                      name="applicantType"
                      value={opt.value}
                      checked={applicantType === opt.value}
                      onChange={() => setApplicantType(opt.value)}
                      className="accent-forest-green"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </section>

            {/* SECTION 3: Advanced / Innovation Factors (collapsible) */}
            <section className="card">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-forest-green/40 rounded-xl"
                aria-expanded={showAdvanced}
              >
                <div>
                  <h2 className="text-lg font-heading font-semibold text-charcoal">Innovation & Extraction Details</h2>
                  <p className="text-sm text-slate mt-0.5">Optional — affects phytopharmaceutical and patent classification</p>
                </div>
                {showAdvanced ? <ChevronUp size={18} className="text-slate" /> : <ChevronDown size={18} className="text-slate" />}
              </button>
              {showAdvanced && (
                <div className="px-6 pb-6 space-y-5 border-t border-border-color pt-5">
                  <div>
                    <label htmlFor="claimedIndication" className="block text-sm font-medium text-charcoal mb-1.5">
                      Claimed indication (optional)
                    </label>
                    <input
                      id="claimedIndication"
                      type="text"
                      value={claimedIndication}
                      onChange={(e) => setClaimedIndication(e.target.value)}
                      placeholder="e.g. Arthritis relief, Hair growth"
                      className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                    />
                  </div>
                  <TriStateRadio
                    name="newIndicationOrRoute"
                    value={newIndicationOrRoute}
                    onChange={setNewIndicationOrRoute}
                    label="Does the product involve a new indication or a novel dosage route?"
                    helpText="e.g. converting a classical churna into a sublingual nano-spray delivery."
                  />
                  <TriStateRadio
                    name="purifiedExtract"
                    value={purifiedExtract}
                    onChange={setPurifiedExtract}
                    label="Is this a purified phytochemical or standardized botanical extract?"
                    helpText="A single isolated bioactive compound or a highly standardized fraction vs. a whole plant extract."
                  />
                  <TriStateRadio
                    name="synergisticData"
                    value={synergisticData}
                    onChange={setSynergisticData}
                    label="Is synergistic laboratory data available?"
                    helpText="Lab data demonstrating non-additive synergy between ingredients, relevant to patent eligibility."
                  />
                </div>
              )}
            </section>

            {/* Validation error */}
            {validationError && (
              <div role="alert" className="flex items-center gap-2 text-sm text-error bg-red-50 border border-error/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} />
                {validationError}
              </div>
            )}

            {/* PRIMARY ACTION */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="Determine product category"
                className="flex items-center gap-2 bg-forest-green text-white px-6 py-3 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Determining product category…</>
                ) : (
                  <><PackageSearch size={18} /> Determine Product Category</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ask-ip-sakti', { state: assessmentContext })}
                className="flex items-center gap-2 text-sm text-forest-green font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded py-3"
              >
                <ArrowLeft size={15} /> Back to Ask IP-SAKTI
              </button>
            </div>

            {/* Service unavailable */}
            {serviceUnavailable && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-charcoal">Classification service is currently unavailable.</p>
                  <p className="text-slate mt-0.5">The classification engine could not be reached. Please try again when the backend is running.</p>
                </div>
              </div>
            )}

            {/* Backend error */}
            {submitError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
                <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Classification error</p>
                  <p className="text-slate mt-0.5">{submitError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ── CLASSIFICATION RESULT ──────────────────────────────── */}
            {result && (
              <section
                id="classification-result"
                className="card p-6 border-l-4 border-l-forest-green"
                aria-live="polite"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={22} className="text-success shrink-0" />
                    <h2 className="text-xl font-heading font-semibold text-charcoal">Classification Result</h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[result.category] || 'bg-slate/10 text-slate border-slate/30'}`}
                  >
                    {result.category?.replace(/_/g, ' ')}
                  </span>
                </div>

                <dl className="divide-y divide-border-color">
                  <ResultField label="Product Category" value={result.categoryDisplayName} />
                  <ResultField label="Governing Act / Regulation" value={result.governingAct} />
                  <ResultField label="Licensing Authority" value={result.licensingAuthority} />
                  <ResultField label="Licensing Procedure" value={result.licensingProcedure} />
                  <ResultField label="Clinical Trial Requirement" value={result.clinicalTrialRequirement} />
                  <ResultField label="Mandatory Label Disclaimers" value={result.mandatoryLabelDisclaimers} />
                </dl>

                <div className="mt-6 pt-5 border-t border-border-color space-y-1">
                  <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                    <Scale size={16} className="text-muted-gold" /> IP &amp; Patentability Guidance
                  </h3>
                  <dl className="divide-y divide-border-color">
                    <ResultField
                      label="Formulation Patentable in India?"
                      value={result.formulationPatentableInIndia === true ? 'Yes' : result.formulationPatentableInIndia === false ? 'No' : null}
                    />
                    <ResultField label="Patentability Verdict" value={result.patentabilityVerdict} />
                    <ResultField label="Relevant Patent Act Sections" value={result.relevantPatentSections} />
                    <ResultField label="Recommended IP Strategy" value={result.recommendedIprStrategy} />
                  </dl>
                </div>

                <div className="mt-6 pt-5 border-t border-border-color">
                  <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                    <Leaf size={16} className="text-success" /> Biodiversity &amp; NBA Compliance
                  </h3>
                  <dl className="divide-y divide-border-color">
                    <ResultField label="NBA Compliance Status" value={result.nbaComplianceStatus} />
                    <ResultField label="Required NBA Form" value={result.requiredNbaForm} />
                  </dl>
                </div>

                {result.decisionTrace?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-border-color">
                    <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                      <FileText size={16} className="text-slate" /> Classification Decision Trace
                    </h3>
                    <ol className="space-y-1.5">
                      {result.decisionTrace.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal">
                          <span className="text-xs font-bold text-muted-gold mt-0.5 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Continue button */}
                <div className="mt-6 pt-5 border-t border-border-color flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="flex items-center gap-2 bg-forest-green text-white px-6 py-3 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
                  >
                    Continue to IP Protection <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-slate self-center">
                    This classification result reflects guidance from the backend engine only. It is not a legal determination.
                  </p>
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate border-t border-border-color pt-5 leading-relaxed">
              <strong>Disclaimer:</strong> IP-SAKTI provides information and guidance based on available sources.
              It is not a substitute for legal advice, regulatory approval, licensing, certification, or professional consultation.
            </p>
          </div>

          {/* ── SIDEBAR / INFO COLUMN ──────────────────────────────────── */}
          <div className="space-y-6">

            {/* Source-Grounded Classification */}
            <aside className="card p-5">
              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-muted-gold shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-heading font-semibold text-charcoal mb-2">
                    Source-Grounded Classification
                  </h2>
                  <p className="text-sm text-slate leading-relaxed">
                    Classification results are intended to be supported by the project's authoritative legal and regulatory knowledge sources.
                  </p>
                  <div className="mt-3 p-3 bg-warm-ivory rounded-lg">
                    <p className="text-xs text-slate italic">
                      No source record is available for this classification yet.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* What categories are possible? */}
            <aside className="card p-5">
              <h2 className="text-base font-heading font-semibold text-charcoal mb-3">Possible Categories</h2>
              <p className="text-xs text-slate mb-3">The backend engine may return any of these legally-defined categories:</p>
              <ul className="space-y-2 text-sm text-charcoal">
                {[
                  'Classical Ayurvedic Formulation',
                  'Proprietary Ayurvedic Medicine — Category A',
                  'Proprietary Ayurvedic Medicine — Category B',
                  'Phytopharmaceutical Drug',
                  'Ayurveda Aahar (Food / Dietary Supplement)',
                  'Ayurvedic Cosmetic',
                ].map((cat) => (
                  <li key={cat} className="flex items-start gap-2">
                    <span className="text-muted-gold mt-0.5 shrink-0">•</span>
                    {cat}
                  </li>
                ))}
              </ul>
            </aside>

          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductClassification;
