import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { useJurisdiction } from '../context/JurisdictionContext';

// ─────────────────────────────────────────────────────────────────────────────
// Constants derived from backend enums (ClassificationRequest)
// ─────────────────────────────────────────────────────────────────────────────
const INTENDED_USE_OPTIONS = [
  {
    value: 'THERAPEUTIC_TREATMENT',
    labelKey: 'productClassification.intendedUseOptions.therapeutic.label',
    defaultLabel: 'Therapeutic treatment or disease mitigation',
    descKey: 'productClassification.intendedUseOptions.therapeutic.description',
    defaultDescription: 'Products used to treat, mitigate, or prevent a disease or condition.',
  },
  {
    value: 'DIETARY_NUTRITION',
    labelKey: 'productClassification.intendedUseOptions.dietary.label',
    defaultLabel: 'Food, dietary, or nutritional support',
    descKey: 'productClassification.intendedUseOptions.dietary.description',
    defaultDescription: 'Products intended as food supplements or nutritional support without therapeutic claims.',
  },
  {
    value: 'COSMETIC_BEAUTY',
    labelKey: 'productClassification.intendedUseOptions.cosmetic.label',
    defaultLabel: 'Cleansing, beautifying, skin, or hair application',
    descKey: 'productClassification.intendedUseOptions.cosmetic.description',
    defaultDescription: 'Cosmetic products for skin/hair care that do not claim therapeutic effects.',
  },
  {
    value: 'OTHER',
    labelKey: 'productClassification.intendedUseOptions.other.label',
    defaultLabel: 'Other',
    descKey: 'productClassification.intendedUseOptions.other.description',
    defaultDescription: 'A different intended use not listed above.',
  },
];

const APPLICANT_TYPE_OPTIONS = [
  { value: 'INDIAN_INDIVIDUAL', labelKey: 'productClassification.applicantTypeOptions.indianIndividual', defaultLabel: 'Indian individual / sole proprietor' },
  { value: 'INDIAN_COMPANY', labelKey: 'productClassification.applicantTypeOptions.indianCompany', defaultLabel: 'Indian company / partnership / LLP' },
  { value: 'FOREIGN_ENTITY_OR_NRI', labelKey: 'productClassification.applicantTypeOptions.foreignEntity', defaultLabel: 'Foreign entity or NRI' },
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
  const { t } = useTranslation();
  const options = [
    { value: 'true', label: t('common.yes', 'Yes') },
    { value: 'false', label: t('common.no', 'No') },
    { value: 'unsure', label: t('common.notSure', 'Not sure') },
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
  const { t } = useTranslation();
  const isEmpty = value === null || value === undefined || value === '' ||
    (Array.isArray(value) && value.length === 0);
  return (
    <div className="py-3 border-b border-border-color last:border-0">
      <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">{label}</dt>
      <dd className={`text-sm ${isEmpty ? 'text-slate italic' : 'text-charcoal'} ${mono ? 'font-mono' : ''}`}>
        {isEmpty
          ? t('productClassification.result.notAvailable', 'Not available')
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
  const { t } = useTranslation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();
  const effectiveJurisdiction = context?.jurisdiction || globalJurisdiction || 'INDIA';
  const hasContext = context?.productName || context?.question || context?.jurisdiction;

  if (!hasContext) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg mb-6 text-sm">
        <AlertCircle size={16} className="text-slate shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-charcoal font-medium">
            {t('productClassification.assessmentContextBanner.noContext', 'No assessment context available yet.')}
          </p>
          <p className="text-xs text-slate mt-1">
            <span className="font-medium text-charcoal">{t('productClassification.assessmentContextBanner.jurisdiction', 'Jurisdiction:')}</span>{' '}
            <span className="text-forest-green font-medium">{effectiveJurisdiction === 'INDIA' ? t('common.india', 'India') : t('common.international', 'International')}</span>
          </p>
          <button
            type="button"
            onClick={onGoToAsk}
            className="text-forest-green hover:underline mt-1.5 text-sm font-medium block"
          >
            {t('productClassification.assessmentContextBanner.startFromAsk', 'Start from Ask IP-SAKTI →')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg mb-6 text-sm space-y-1.5">
      <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-2">
        {t('productClassification.assessmentContextBanner.title', 'Assessment Context')}
      </p>
      {context.productName && (
        <p><span className="font-medium text-charcoal">{t('productClassification.assessmentContextBanner.product', 'Product:')}</span> <span className="text-charcoal">{context.productName}</span></p>
      )}
      <p><span className="font-medium text-charcoal">{t('productClassification.assessmentContextBanner.jurisdiction', 'Jurisdiction:')}</span> <span className="text-charcoal">{effectiveJurisdiction === 'INDIA' ? t('common.india', 'India') : t('common.international', 'International')}</span></p>
      {context.question && (
        <p><span className="font-medium text-charcoal">{t('productClassification.assessmentContextBanner.question', 'Question:')}</span> <span className="text-slate italic">"{context.question}"</span></p>
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
  OUT_OF_SCOPE: 'bg-amber-100 text-amber-800 border-amber-300',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductClassification Page
// ─────────────────────────────────────────────────────────────────────────────
const ProductClassification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();
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
      setValidationError(t('productClassification.validation.productNameRequired', 'Please enter a product name.'));
      return false;
    }
    if (!intendedUse) {
      setValidationError(t('productClassification.validation.intendedUseRequired', 'Please select the primary intended use.'));
      return false;
    }
    if (!matchesClassicalText) {
      setValidationError(t('productClassification.validation.classicalRequired', 'Please indicate whether the formulation is from a classical Ayurvedic text.'));
      return false;
    }
    if (!commercialUse) {
      setValidationError(t('productClassification.validation.commercialRequired', 'Please indicate whether the product is intended for commercial use.'));
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
        setSubmitError(t('productClassification.classificationError', 'No classification result was returned.'));
      } else {
        setResult(data);
        const parsedBotanicalList = ingredientsRaw
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean);

        const activeState = {
          ...assessmentContext,
          productName,
          botanicalIngredients: parsedBotanicalList,
          ingredients: ingredientsRaw,
          intendedUse,
          applicantType,
          jurisdiction: assessmentContext?.jurisdiction || globalJurisdiction || 'INDIA',
          classificationResult: data,
        };
        try {
          sessionStorage.setItem('ip_shakti_active_assessment', JSON.stringify(activeState));
        } catch (storageErr) {
          console.warn('Session storage quota exceeded', storageErr);
        }
        // Scroll to result
        setTimeout(() => {
          document.getElementById('classification-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('net::ERR')) {
        setServiceUnavailable(true);
      } else {
        setSubmitError(err.message || t('productClassification.classificationError', 'Unable to interpret the classification response.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    const parsedBotanicalList = ingredientsRaw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const forwardState = {
      ...assessmentContext,
      productName,
      botanicalIngredients: parsedBotanicalList,
      ingredients: ingredientsRaw,
      intendedUse,
      applicantType,
      jurisdiction: assessmentContext?.jurisdiction || globalJurisdiction || 'INDIA',
      classificationResult: result,
    };
    try {
      sessionStorage.setItem('ip_shakti_active_assessment', JSON.stringify(forwardState));
    } catch (storageErr) {}
    navigate('/ip-protection', {
      state: forwardState,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { labelKey: 'nav.askIpSakti', label: 'Ask IP-SAKTI', path: '/ask-ip-sakti' },
          { labelKey: 'nav.productClassification', label: 'Product Classification', path: '/product-classification' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('productClassification.title')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('productClassification.subtitle')}
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
                <h2 className="text-lg font-heading font-semibold text-charcoal">
                  {t('productClassification.infoTitle')}
                </h2>
              </div>
              <p className="text-sm text-slate mb-5">
                {t('productClassification.infoSubtitle')}
              </p>

              {/* Product name */}
              <div className="mb-5">
                <label htmlFor="productName" className="block text-sm font-medium text-charcoal mb-1.5">
                  {t('productClassification.productName')} <span className="text-error" aria-hidden="true">*</span>
                </label>
                <input
                  id="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setValidationError(''); }}
                  placeholder={t('productClassification.productNamePlaceholder')}
                  aria-required="true"
                  className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
              </div>

              {/* Ingredients */}
              <div className="mb-5">
                <label htmlFor="ingredients" className="block text-sm font-medium text-charcoal mb-1.5">
                  {t('productClassification.ingredientsLabel', 'Ingredients / formulation details')}
                </label>
                <textarea
                  id="ingredients"
                  value={ingredientsRaw}
                  onChange={(e) => setIngredientsRaw(e.target.value)}
                  placeholder={t('productClassification.ingredientsPlaceholder', 'Describe the main ingredients, formulation, preparation, or composition.')}
                  rows={4}
                  className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
                <p className="mt-1.5 text-xs text-slate">
                  {t('productClassification.ingredientsHelper', 'Separate multiple ingredients with commas or new lines.')}
                </p>
              </div>

              {/* Primary intended use */}
              <div className="mb-5">
                <fieldset>
                  <legend className="block text-sm font-medium text-charcoal mb-3">
                    {t('productClassification.intendedUseLegend', 'Primary intended use')} <span className="text-error" aria-hidden="true">*</span>
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
                        label={opt.labelKey ? t(opt.labelKey, opt.defaultLabel) : opt.label}
                        description={opt.descKey ? t(opt.descKey, opt.defaultDescription) : opt.description}
                      />
                    ))}
                  </div>
                </fieldset>
                {intendedUse === 'OTHER' && (
                  <div className="mt-3">
                    <label htmlFor="otherIntendedUse" className="block text-sm font-medium text-charcoal mb-1.5">
                      {t('productClassification.otherIntendedUseLabel', 'Please describe the intended use')}
                    </label>
                    <input
                      id="otherIntendedUse"
                      type="text"
                      value={otherIntendedUse}
                      onChange={(e) => setOtherIntendedUse(e.target.value)}
                      placeholder={t('productClassification.otherIntendedUsePlaceholder', 'Describe the intended use')}
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
                  label={t('productClassification.classicalTextLabel', 'Is the formulation found in an authoritative classical Ayurvedic text?')}
                  helpText={t('productClassification.classicalTextHelp', 'For example, Charaka Samhita, Sushruta Samhita, Sharangadhara Samhita, or other First Schedule books.')}
                  required
                />
                {matchesClassicalText === 'true' && (
                  <div className="mt-3">
                    <label htmlFor="classicalTextName" className="block text-sm font-medium text-charcoal mb-1.5">
                      {t('productClassification.classicalTextNameLabel', 'Name of the classical text (optional)')}
                    </label>
                    <input
                      id="classicalTextName"
                      type="text"
                      value={classicalTextName}
                      onChange={(e) => setClassicalTextName(e.target.value)}
                      placeholder={t('productClassification.classicalTextNamePlaceholder', 'e.g. Charaka Samhita')}
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
                      label={t('productClassification.formulaModifiedLabel', 'Was the formula, ratio, or excipients modified from the classical text?')}
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
                  label={t('productClassification.commercialUseLabel', 'Intended for commercial use?')}
                  required
                />
              </div>
            </section>

            {/* SECTION 2: Applicant Type */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
                {t('productClassification.applicantTypeTitle', 'Applicant / Manufacturer Type')}
              </h2>
              <p className="text-sm text-slate mb-4">
                {t('productClassification.applicantTypeDesc', 'Optional — helps determine NBA/ABS obligations and patent eligibility. If unsure, leave blank.')}
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
                    {opt.labelKey ? t(opt.labelKey, opt.defaultLabel) : opt.label}
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
                  <h2 className="text-lg font-heading font-semibold text-charcoal">
                    {t('productClassification.advancedTitle', 'Innovation & Extraction Details')}
                  </h2>
                  <p className="text-sm text-slate mt-0.5">
                    {t('productClassification.advancedSubtitle', 'Optional — affects phytopharmaceutical and patent classification')}
                  </p>
                </div>
                {showAdvanced ? <ChevronUp size={18} className="text-slate" /> : <ChevronDown size={18} className="text-slate" />}
              </button>
              {showAdvanced && (
                <div className="px-6 pb-6 space-y-5 border-t border-border-color pt-5">
                  <div>
                    <label htmlFor="claimedIndication" className="block text-sm font-medium text-charcoal mb-1.5">
                      {t('productClassification.claimedIndicationLabel', 'Claimed indication (optional)')}
                    </label>
                    <input
                      id="claimedIndication"
                      type="text"
                      value={claimedIndication}
                      onChange={(e) => setClaimedIndication(e.target.value)}
                      placeholder={t('productClassification.claimedIndicationPlaceholder', 'e.g. Arthritis relief, Hair growth')}
                      className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                    />
                  </div>
                  <TriStateRadio
                    name="newIndicationOrRoute"
                    value={newIndicationOrRoute}
                    onChange={setNewIndicationOrRoute}
                    label={t('productClassification.newIndicationLabel', 'Does the product involve a new indication or a novel dosage route?')}
                    helpText={t('productClassification.newIndicationHelp', 'e.g. converting a classical churna into a sublingual nano-spray delivery.')}
                  />
                  <TriStateRadio
                    name="purifiedExtract"
                    value={purifiedExtract}
                    onChange={setPurifiedExtract}
                    label={t('productClassification.purifiedExtractLabel', 'Is this a purified phytochemical or standardized botanical extract?')}
                    helpText={t('productClassification.purifiedExtractHelp', 'A single isolated bioactive compound or a highly standardized fraction vs. a whole plant extract.')}
                  />
                  <TriStateRadio
                    name="synergisticData"
                    value={synergisticData}
                    onChange={setSynergisticData}
                    label={t('productClassification.synergisticDataLabel', 'Is synergistic laboratory data available?')}
                    helpText={t('productClassification.synergisticDataHelp', 'Lab data demonstrating non-additive synergy between ingredients, relevant to patent eligibility.')}
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
                  <><Loader2 size={18} className="animate-spin" /> {t('productClassification.evaluating')}</>
                ) : (
                  <><PackageSearch size={18} /> {t('productClassification.evaluateButton')}</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/ask-ip-sakti', { state: assessmentContext })}
                className="flex items-center gap-2 text-sm text-forest-green font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded py-3"
              >
                <ArrowLeft size={15} /> {t('productClassification.backToAsk', 'Back to Ask IP-SAKTI')}
              </button>
            </div>

            {/* Service unavailable */}
            {serviceUnavailable && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-charcoal">
                    {t('productClassification.serviceUnavailableTitle', 'Classification service is currently unavailable.')}
                  </p>
                  <p className="text-slate mt-0.5">
                    {t('productClassification.serviceUnavailableDesc', 'The classification engine could not be reached. Please try again when the backend is running.')}
                  </p>
                </div>
              </div>
            )}

            {/* Backend error */}
            {submitError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
                <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-charcoal">
                    {t('productClassification.classificationError', 'Classification error')}
                  </p>
                  <p className="text-slate mt-0.5">{submitError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap"
                >
                  {t('productClassification.dismiss', 'Dismiss')}
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
                    <h2 className="text-xl font-heading font-semibold text-charcoal">
                      {t('productClassification.result.title', 'Classification Result')}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[result.category] || 'bg-slate/10 text-slate border-slate/30'}`}
                  >
                    {result.category?.replace(/_/g, ' ')}
                  </span>
                </div>

                <dl className="divide-y divide-border-color">
                  <ResultField label={t('productClassification.result.productCategory', 'Product Category')} value={result.categoryDisplayName} />
                  <ResultField label={t('productClassification.result.governingAct', 'Governing Act / Regulation')} value={result.governingAct} />
                  <ResultField label={t('productClassification.result.licensingAuthority', 'Licensing Authority')} value={result.licensingAuthority} />
                  <ResultField label={t('productClassification.result.licensingProcedure', 'Licensing Procedure')} value={result.licensingProcedure} />
                  <ResultField label={t('productClassification.result.clinicalTrial', 'Clinical Trial Requirement')} value={result.clinicalTrialRequirement} />
                  <ResultField label={t('productClassification.result.mandatoryLabel', 'Mandatory Label Disclaimers')} value={result.mandatoryLabelDisclaimers} />
                </dl>

                <div className="mt-6 pt-5 border-t border-border-color space-y-1">
                  <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                    <Scale size={16} className="text-muted-gold" /> {t('productClassification.result.ipGuidance', 'IP & Patentability Guidance')}
                  </h3>
                  <dl className="divide-y divide-border-color">
                    <ResultField
                      label={t('productClassification.result.formulationPatentable', 'Formulation Patentable in India?')}
                      value={result.formulationPatentableInIndia === true ? t('common.yes', 'Yes') : result.formulationPatentableInIndia === false ? t('common.no', 'No') : null}
                    />
                    <ResultField label={t('productClassification.result.patentabilityVerdict', 'Patentability Verdict')} value={result.patentabilityVerdict} />
                    <ResultField label={t('productClassification.result.relevantSections', 'Relevant Patent Act Sections')} value={result.relevantPatentSections} />
                    <ResultField label={t('productClassification.result.recommendedStrategy', 'Recommended IP Strategy')} value={result.recommendedIprStrategy} />
                  </dl>
                </div>

                <div className="mt-6 pt-5 border-t border-border-color">
                  <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                    <Leaf size={16} className="text-success" /> {t('productClassification.result.biodiversityHeading', 'Biodiversity & NBA Compliance')}
                  </h3>
                  <dl className="divide-y divide-border-color">
                    <ResultField label={t('productClassification.result.nbaStatus', 'NBA Compliance Status')} value={result.nbaComplianceStatus} />
                    <ResultField label={t('productClassification.result.requiredNbaForm', 'Required NBA Form')} value={result.requiredNbaForm} />
                  </dl>
                </div>

                {result.decisionTrace?.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-border-color">
                    <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2 mb-3">
                      <FileText size={16} className="text-slate" /> {t('productClassification.result.decisionTrace', 'Classification Decision Trace')}
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
                    {t('productClassification.result.continueButton', 'Continue to IP Protection')} <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-slate self-center">
                    {t('productClassification.result.guidanceDisclaimer', 'This classification result reflects guidance from the backend engine only. It is not a legal determination.')}
                  </p>
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate border-t border-border-color pt-5 leading-relaxed">
              <strong>{t('common.disclaimer', 'Disclaimer:')}</strong> {t('common.disclaimerText', 'IP-SAKTI provides information and guidance based on available sources. It is not a substitute for legal advice, regulatory approval, licensing, certification, or professional consultation.')}
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
                    {t('productClassification.sidebar.sourceGroundedTitle', 'Source-Grounded Classification')}
                  </h2>
                  <p className="text-sm text-slate leading-relaxed">
                    {t('productClassification.sidebar.sourceGroundedDesc', "Classification results are intended to be supported by the project's authoritative legal and regulatory knowledge sources.")}
                  </p>
                  <div className="mt-3 p-3 bg-warm-ivory rounded-lg">
                    <p className="text-xs text-slate italic">
                      {t('productClassification.sidebar.noSourceRecord', 'No source record is available for this classification yet.')}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* What categories are possible? */}
            <aside className="card p-5">
              <h2 className="text-base font-heading font-semibold text-charcoal mb-3">
                {t('productClassification.sidebar.possibleCategoriesTitle', 'Possible Categories')}
              </h2>
              <p className="text-xs text-slate mb-3">
                {t('productClassification.sidebar.possibleCategoriesDesc', 'The backend engine may return any of these legally-defined categories:')}
              </p>
              <ul className="space-y-2 text-sm text-charcoal">
                {[
                  { key: 'classical', def: 'Classical Ayurvedic Formulation' },
                  { key: 'catA', def: 'Proprietary Ayurvedic Medicine — Category A' },
                  { key: 'catB', def: 'Proprietary Ayurvedic Medicine — Category B' },
                  { key: 'phytopharm', def: 'Phytopharmaceutical Drug' },
                  { key: 'aahar', def: 'Ayurveda Aahar (Food / Dietary Supplement)' },
                  { key: 'cosmetic', def: 'Ayurvedic Cosmetic' },
                ].map((item) => (
                  <li key={item.key} className="flex items-start gap-2">
                    <span className="text-muted-gold mt-0.5 shrink-0">•</span>
                    {t(`productClassification.sidebar.categories.${item.key}`, item.def)}
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
