import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Send,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Loader2,
  Globe,
  MapPin,
  Upload,
  FileText,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import { submitAssessment } from '../services/api';
import { useJurisdiction } from '../context/JurisdictionContext';

// ─────────────────────────────────────────────────────────────────────────────
// Assessment flow steps shown as a progress indicator
// ─────────────────────────────────────────────────────────────────────────────
// Note: The stepper is now handled by the shared AssessmentStepper component.

const COMMON_QUESTIONS = [
  'Can I patent my formulation?',
  'How can I protect my brand?',
  'Does ABS apply to my product?',
  'Is my formulation based on traditional knowledge?',
  'What regulations apply to my product?',
  'I want to export my product.',
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Assessment flow stepper shown at the top of the page */
// Now using shared AssessmentStepper component — see below.

/** Jurisdiction segmented control */
const JurisdictionSelector = ({ value, onChange }) => {
  const { t } = useTranslation();
  const options = [
    { value: 'INDIA', label: t('common.india', 'India'), icon: <MapPin size={14} /> },
    { value: 'INTERNATIONAL', label: t('common.international', 'International'), icon: <Globe size={14} /> },
  ];
  return (
    <div className="flex rounded-lg border border-border-color overflow-hidden w-fit" role="group" aria-label="Jurisdiction">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 focus:ring-inset
            ${value === opt.value
              ? 'bg-forest-green text-white'
              : 'bg-white text-charcoal hover:bg-warm-ivory'
            }`}
          aria-pressed={value === opt.value}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/** Service not connected notice */
const ServiceNotConnected = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
      <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" />
      <div>
        <p className="font-medium text-charcoal">{t('common.serviceUnavailable', 'Analysis service is not connected yet.')}</p>
        <p className="text-slate mt-0.5">
          {t('askIpSakti.sourceGrounded.emptySource', 'Authoritative source connectivity will be shown when available.')}
        </p>
      </div>
    </div>
  );
};

/** Error display */
const ErrorMessage = ({ message, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
      <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-charcoal">{t('common.errorOccurred', 'An error occurred')}</p>
        <p className="text-slate mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-forest-green hover:underline whitespace-nowrap"
      >
        {t('common.tryAgain', 'Try again')}
      </button>
    </div>
  );
};

/** Out-of-Scope / Non-Domain Input Advisory Card */
const OutOfScopeAdvisory = ({ notice, onDismiss }) => {
  const { t } = useTranslation();
  const isOutOfScope = notice?.status === 'OUT_OF_SCOPE';
  const title = isOutOfScope
    ? t('askIpSakti.outOfScope.title', 'Domain Notice: Input Outside Scope of AYUSH & Traditional Medicine')
    : t('askIpSakti.outOfScope.safeAbstentionTitle', 'Statutory Safe Abstention Advisory');

  return (
    <div className="mb-6 p-5 rounded-xl border border-amber-300 bg-amber-50/90 shadow-sm transition-all" role="alert">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-heading font-semibold text-charcoal">
              {title}
            </h3>
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate hover:text-charcoal p-1 rounded transition-colors"
              aria-label="Dismiss notice"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-2 text-sm text-charcoal leading-relaxed font-normal">
            {notice.botMessage}
          </p>

          {notice.citationPills && notice.citationPills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {notice.citationPills.map((pill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-200/80 text-amber-900"
                >
                  {pill}
                </span>
              ))}
            </div>
          )}

          {notice.relevanceEvaluation?.suggestedAction && (
            <div className="mt-3.5 p-3 rounded-lg bg-white/90 border border-amber-200/70 text-xs text-charcoal space-y-1">
              <span className="font-semibold text-forest-green block">
                {t('askIpSakti.outOfScope.recommendationLabel', 'Recommended Action:')}
              </span>
              <p className="text-slate">
                {notice.relevanceEvaluation.suggestedAction}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-1.5 rounded-lg bg-forest-green text-white text-xs font-medium hover:bg-forest-green/90 transition-colors shadow-sm"
            >
              {t('askIpSakti.outOfScope.refineButton', 'Refine Your Inquiry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
const AskIpSakti = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { jurisdiction: globalJurisdiction, setJurisdiction: setGlobalJurisdiction } = useJurisdiction();

  // Form state
  const [question, setQuestion] = useState('');
  const [productName, setProductName] = useState('');
  const [mainIngredients, setMainIngredients] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [jurisdiction, setJurisdiction] = useState(globalJurisdiction || 'INDIA');
  const [destinationMarket, setDestinationMarket] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (globalJurisdiction) {
      setJurisdiction(globalJurisdiction);
    }
  }, [globalJurisdiction]);

  const handleJurisdictionChange = (val) => {
    setJurisdiction(val);
    setGlobalJurisdiction(val);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // UI state
  const [questionError, setQuestionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [outOfScopeNotice, setOutOfScopeNotice] = useState(null);

  const validateAndSubmit = async (e) => {
    e.preventDefault();

    // Validate required field
    if (!question.trim()) {
      setQuestionError('Please enter your question.');
      return;
    }

    setQuestionError('');
    setSubmitError(null);
    setServiceUnavailable(false);
    setOutOfScopeNotice(null);
    setIsSubmitting(true);

    const payload = {
      question: question.trim(),
      productContext: {
        productName: productName.trim() || null,
        mainIngredients: mainIngredients.trim() || null,
        intendedUse: intendedUse.trim() || null,
      },
      jurisdiction,
      language: i18n.language ? i18n.language.substring(0, 2).toUpperCase() : 'AUTO',
      destinationMarket: jurisdiction === 'INTERNATIONAL' ? destinationMarket.trim() || null : null,
    };

    try {
      const result = await submitAssessment(payload);

      // Intercept Out of Scope / Safe Abstention responses and present authoritative advisory
      if (result?.status === 'OUT_OF_SCOPE' || result?.status === 'SAFE_ABSTENTION') {
        setOutOfScopeNotice(result);
        return;
      }

      // ChatMessageResponse returns: sessionId, responseType, pillars, clarifyingChips, etc.
      navigate('/product-classification', {
        state: {
          question: question.trim(),
          productName: productName.trim() || null,
          mainIngredients: mainIngredients.trim() || null,
          intendedUse: intendedUse.trim() || null,
          jurisdiction,
          destinationMarket: jurisdiction === 'INTERNATIONAL' ? destinationMarket.trim() || null : null,
          assessmentId: result?.sessionId || result?.id || null,
          chatResponse: result || null,
        },
      });

    } catch (err) {
      // Check if service is simply not running yet vs. a real error
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setServiceUnavailable(true);
      } else {
        setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    if (questionError) setQuestionError('');
  };

  const handleCommonQuestion = (q) => {
    setQuestion(q);
    if (questionError) setQuestionError('');
  };

  const handleRetry = () => {
    setSubmitError(null);
    setServiceUnavailable(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb items={[{ labelKey: 'nav.askIpSakti', label: 'Ask IP-SAKTI', path: '/ask-ip-sakti' }]} />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">{t('askIpSakti.title')}</h1>
        <p className="text-slate text-base leading-relaxed">
          {t('askIpSakti.subtitle')}
        </p>
      </div>

      {/* Assessment Flow Stepper */}
      <AssessmentStepper activeKey="ask" />

      {/* Out of Scope / Safe Abstention Domain Gatekeeper Advisory */}
      {outOfScopeNotice && (
        <OutOfScopeAdvisory
          notice={outOfScopeNotice}
          onDismiss={() => setOutOfScopeNotice(null)}
        />
      )}

      <form onSubmit={validateAndSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT / MAIN COLUMN ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* SECTION 1: Main Question */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
                {t('askIpSakti.questionLabel')}
              </h2>
              <p className="text-sm text-slate mb-4">
                {t('askIpSakti.questionHelper')}
              </p>
              <div>
                <label htmlFor="question" className="sr-only">{t('askIpSakti.questionLabel')}</label>
                <textarea
                  id="question"
                  name="question"
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder={t('askIpSakti.questionPlaceholder')}
                  rows={6}
                  aria-required="true"
                  aria-invalid={!!questionError}
                  aria-describedby={questionError ? 'question-error' : undefined}
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 resize-y
                    focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow
                    ${questionError ? 'border-error bg-red-50' : 'border-border-color bg-white'}`}
                />
                {questionError && (
                  <p id="question-error" role="alert" className="flex items-center gap-1.5 mt-2 text-sm text-error">
                    <AlertCircle size={14} />
                    {questionError}
                  </p>
                )}
              </div>
            </section>

            {/* SECTION 2: Product Context */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
                {t('askIpSakti.productContext.title')}
              </h2>
              <p className="text-sm text-slate mb-5">
                {t('askIpSakti.productContext.helper')}
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-charcoal mb-1.5">
                    {t('askIpSakti.productContext.productName')}
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={t('askIpSakti.productContext.productNamePlaceholder')}
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="mainIngredients" className="block text-sm font-medium text-charcoal mb-1.5">
                    {t('askIpSakti.productContext.mainIngredients')}
                  </label>
                  <input
                    id="mainIngredients"
                    type="text"
                    value={mainIngredients}
                    onChange={(e) => setMainIngredients(e.target.value)}
                    placeholder={t('askIpSakti.productContext.mainIngredientsPlaceholder')}
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="intendedUse" className="block text-sm font-medium text-charcoal mb-1.5">
                    {t('askIpSakti.productContext.intendedUse')}
                  </label>
                  <input
                    id="intendedUse"
                    type="text"
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    placeholder={t('askIpSakti.productContext.intendedUsePlaceholder')}
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: Jurisdiction */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">
                {t('askIpSakti.jurisdiction.title')}
              </h2>
              <p className="text-sm text-slate mb-4">
                {t('askIpSakti.jurisdiction.helper')}
              </p>
              <JurisdictionSelector value={jurisdiction} onChange={handleJurisdictionChange} />
              {jurisdiction === 'INTERNATIONAL' && (
                <div className="mt-4">
                  <label htmlFor="destinationMarket" className="block text-sm font-medium text-charcoal mb-1.5">
                    {t('askIpSakti.jurisdiction.destinationMarket')}
                  </label>
                  <input
                    id="destinationMarket"
                    type="text"
                    value={destinationMarket}
                    onChange={(e) => setDestinationMarket(e.target.value)}
                    placeholder={t('askIpSakti.jurisdiction.destinationMarketPlaceholder')}
                    className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                  />
                  <p className="mt-1.5 text-xs text-slate">
                    {t('askIpSakti.jurisdiction.destinationMarketHelper')}
                  </p>
                </div>
              )}
            </section>

            {/* SECTION 4: Document Upload */}
            <section className="card p-6">
              <h2 className="text-lg font-heading font-semibold text-charcoal mb-1">Supporting Documents</h2>
              <p className="text-sm text-slate mb-4">
                Upload PDFs or other documents (e.g., formulations, prior art, product labels) to include as context.
              </p>
              
              <div className="border-2 border-dashed border-border-color rounded-xl p-6 text-center hover:bg-warm-ivory transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-sm text-slate"
                >
                  <div className="w-10 h-10 rounded-full bg-forest-green/10 flex items-center justify-center text-forest-green mb-2">
                    <Upload size={20} />
                  </div>
                  <span className="font-medium text-charcoal">Click to upload documents</span>
                  <span>or drag and drop</span>
                  <span className="text-xs mt-1">Supported formats: PDF, DOC, DOCX, TXT</span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate uppercase tracking-wide">Attached Files</p>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-white border border-border-color rounded-lg text-sm shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText size={16} className="text-muted-gold shrink-0" />
                          <span className="text-charcoal font-medium truncate">{file.name}</span>
                          <span className="text-xs text-slate shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-slate hover:text-error transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-error/50 rounded"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* PRIMARY ACTION */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button
                type="submit"
                disabled={isSubmitting}
                aria-label="Analyze your question with IP-SAKTI"
                className="flex items-center gap-2 bg-forest-green text-white px-6 py-3 rounded-lg font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('askIpSakti.submitting')}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t('askIpSakti.submit')}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/product-classification')}
                className="flex items-center gap-2 text-sm text-forest-green font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded py-3"
              >
                {t('askIpSakti.notSure')}
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Service / Error feedback */}
            {serviceUnavailable && <ServiceNotConnected />}
            {submitError && <ErrorMessage message={submitError} onRetry={handleRetry} />}

            {/* Disclaimer */}
            <p className="text-xs text-slate border-t border-border-color pt-5 leading-relaxed">
              <strong>Disclaimer:</strong> {t('askIpSakti.disclaimer')}
            </p>
          </div>

          {/* ── RIGHT / SIDEBAR COLUMN ────────────────────────────────── */}
          <div className="space-y-6">

            {/* Common Questions */}
            <section className="card p-5">
              <h2 className="text-base font-heading font-semibold text-charcoal mb-3">
                {t('askIpSakti.commonQuestions.title')}
              </h2>
              <p className="text-xs text-slate mb-3">
                {t('askIpSakti.commonQuestions.helper')}
              </p>
              <ul className="space-y-2" role="list">
                {COMMON_QUESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => handleCommonQuestion(q)}
                      className="w-full text-left text-sm text-charcoal px-3 py-2.5 rounded-lg border border-border-color bg-warm-ivory hover:border-deep-teal hover:bg-white hover:text-forest-green transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Source-Grounded Guidance Info */}
            <section className="card p-5">
              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-muted-gold shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-heading font-semibold text-charcoal mb-2">
                    {t('askIpSakti.sourceGrounded.title')}
                  </h2>
                  <p className="text-sm text-slate leading-relaxed">
                    {t('askIpSakti.sourceGrounded.description')}
                  </p>
                  <div className="mt-3 p-3 bg-warm-ivory rounded-lg">
                    <p className="text-xs text-slate italic">
                      {t('askIpSakti.sourceGrounded.emptySource')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </form>
    </div>
  );
};

export default AskIpSakti;
