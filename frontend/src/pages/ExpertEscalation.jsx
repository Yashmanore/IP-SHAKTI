import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Send,
  FileText,
  ShieldAlert,
  Info,
  MapPin,
  Globe,
  Upload,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ESCALATION_REASONS = [
  { id: 'complex_ip', label: 'Complex IP protection question' },
  { id: 'unclear_class', label: 'Unclear product classification' },
  { id: 'regulatory_review', label: 'Regulatory requirements need further review' },
  { id: 'abs_concerns', label: 'ABS / biodiversity concerns' },
  { id: 'tk_concerns', label: 'Traditional knowledge concerns' },
  { id: 'prior_art', label: 'TKDL / prior-art findings need interpretation' },
  { id: 'insufficient_sources', label: 'Source information is insufficient' },
  { id: 'human_verification', label: 'AI guidance requires human verification' },
  { id: 'other', label: 'Other' },
];

const JURISDICTION_LABELS = {
  INDIA: 'India',
  INTERNATIONAL: 'International',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ContextCard = ({ context }) => {
  const cr = context?.classificationResult;
  return (
    <div className="p-4 bg-forest-green/5 border border-forest-green/20 rounded-lg mb-6 text-sm">
      <p className="text-xs font-semibold text-forest-green uppercase tracking-wide mb-2">Assessment Context</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          <span className="text-charcoal flex items-center gap-1">
            {context?.jurisdiction === 'INDIA' ? <MapPin size={12} className="text-orange-600" /> : null}
            {context?.jurisdiction === 'INTERNATIONAL' ? <Globe size={12} className="text-blue-600" /> : null}
            {context?.jurisdiction === 'INDIA'
              ? 'India'
              : context?.jurisdiction === 'INTERNATIONAL'
                ? `International${context?.destinationMarket ? ` — ${context.destinationMarket}` : ''}`
                : 'Not provided'}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">Assessment ID</span>
          <span className="text-charcoal font-mono">{context?.assessmentId || 'Not available'}</span>
        </div>
        <div>
          <span className="text-xs text-slate font-medium block">Current Stage</span>
          <span className="text-charcoal">{context?.currentStage || 'Not available'}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const ExpertEscalation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentContext = location.state || null;

  // Form State
  const [reason, setReason] = useState('');
  const [reviewDetails, setReviewDetails] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  // Submission State (No backend endpoint exists yet)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const cr = assessmentContext?.classificationResult;
  const hasContext = !!assessmentContext;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || !reviewDetails.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate an attempt to reach a non-existent backend endpoint
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitError('The expert escalation service is not connected yet.');
    }, 800);
  };

  const handleBack = () => {
    // Attempt to return to the last known stage, or ask-ip-sakti
    navigate(-1); 
  };

  if (!hasContext) {
    return (
      <div className="max-w-5xl mx-auto pb-16">
        <Breadcrumb items={[{ label: 'Expert Escalation', path: '/expert-escalation' }]} />
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">Expert Escalation</h1>
        </div>
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-warm-ivory flex items-center justify-center mb-4 border border-border-color">
            <ShieldAlert size={28} className="text-warning" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">No assessment selected</h3>
          <p className="text-sm text-slate max-w-sm leading-relaxed mb-6">
            Open or complete an assessment before requesting expert review.
          </p>
          <button
            type="button"
            onClick={() => navigate('/ask-ip-sakti')}
            className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb items={[{ label: 'Expert Escalation', path: '/expert-escalation' }]} />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">Expert Escalation</h1>
        <p className="text-slate text-base leading-relaxed">
          Request human review when your IP, regulatory, biodiversity, or traditional-knowledge assessment needs further attention.
        </p>
      </div>

      <ContextCard context={assessmentContext} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1 & 2: Review Request Form */}
          <section className="card p-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-5">Request Human Review</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">
                  When should you request expert review? / Reason for escalation <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ESCALATION_REASONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors
                        ${reason === opt.id
                          ? 'border-forest-green bg-forest-green/5 text-forest-green ring-1 ring-forest-green font-medium'
                          : 'border-border-color bg-white text-charcoal hover:border-deep-teal hover:bg-warm-ivory'
                        }`}
                    >
                      <input
                        type="radio"
                        name="escalationReason"
                        value={opt.id}
                        checked={reason === opt.id}
                        onChange={() => setReason(opt.id)}
                        className="accent-forest-green mt-0.5 shrink-0"
                        required
                      />
                      <span className="leading-snug">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="reviewDetails" className="block text-sm font-medium text-charcoal mb-1.5">
                  What would you like the expert to review? <span className="text-error">*</span>
                </label>
                <textarea
                  id="reviewDetails"
                  value={reviewDetails}
                  onChange={(e) => setReviewDetails(e.target.value)}
                  placeholder="Describe the question, concern, or part of the assessment you would like reviewed."
                  rows={4}
                  required
                  className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="additionalContext" className="block text-sm font-medium text-charcoal mb-1.5">
                  Additional context (Optional)
                </label>
                <textarea
                  id="additionalContext"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any relevant information that may help the reviewer understand your case."
                  rows={3}
                  className="w-full rounded-lg border border-border-color px-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
              </div>

              {/* Privacy Notice */}
              <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm mt-4">
                <ShieldAlert size={16} className="text-slate shrink-0 mt-0.5" />
                <p className="text-slate leading-relaxed">
                  Only provide information necessary for the expert review. Avoid submitting passwords, payment information, or other unnecessary sensitive information.
                </p>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
                  <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">Your expert review request could not be submitted.</p>
                    <p className="text-slate mt-0.5">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !reason || !reviewDetails.trim()}
                  className="flex items-center gap-2 bg-forest-green text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting review request...</>
                  ) : (
                    <><Send size={16} /> Request Expert Review</>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Existing Requests (Empty State since no backend) */}
          <section className="card p-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">Your Expert Review Requests</h2>
            <div className="p-4 bg-warm-ivory border border-border-color rounded-lg text-sm text-slate italic text-center">
              No expert review requests yet.
            </div>
          </section>
        </div>

        {/* Right Column: Context Summaries */}
        <div className="space-y-6">
          
          {/* Section 3: Assessment Summary */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-slate" />
              <h2 className="text-base font-heading font-semibold text-charcoal">Assessment Summary</h2>
            </div>
            <dl className="divide-y divide-border-color space-y-3">
              <div className="pt-3 first:pt-0">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Product</dt>
                <dd className="text-sm text-charcoal">{assessmentContext?.productName || 'Not provided'}</dd>
              </div>
              <div className="pt-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Classification</dt>
                <dd className="text-sm text-charcoal">{cr?.categoryDisplayName || 'Not assessed'}</dd>
              </div>
              <div className="pt-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Jurisdiction</dt>
                <dd className="text-sm text-charcoal">
                  {assessmentContext?.jurisdiction === 'INDIA' ? 'India' : assessmentContext?.jurisdiction === 'INTERNATIONAL' ? `International${assessmentContext?.destinationMarket ? ` - ${assessmentContext.destinationMarket}` : ''}` : 'Not provided'}
                </dd>
              </div>
              {/* Only show other fields if they exist in state */}
              {assessmentContext?.ipProtectionAssessment && (
                <div className="pt-3">
                  <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">IP Protection</dt>
                  <dd className="text-sm text-charcoal">Assessment available</dd>
                </div>
              )}
              {cr?.licensingProcedure && (
                <div className="pt-3">
                  <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Regulatory Assessment</dt>
                  <dd className="text-sm text-charcoal">Assessment available</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Section 4: Sources */}
          <section className="card p-5">
            <h2 className="text-base font-heading font-semibold text-charcoal mb-3">Sources Used in Assessment</h2>
            {assessmentContext?.sourceRecords && assessmentContext.sourceRecords.length > 0 ? (
              <ul className="space-y-3">
                {assessmentContext.sourceRecords.map((src, i) => (
                  <li key={i} className="text-sm p-3 bg-warm-ivory rounded-lg border border-border-color">
                    <p className="font-medium text-charcoal">{src.title || src.metadata?.title || 'Source Record'}</p>
                    <p className="text-xs text-slate mt-1">{src.metadata?.authority_type || src.type || 'Source'}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate italic p-3 bg-warm-ivory rounded-lg border border-border-color">
                No source records are available for this assessment.
              </p>
            )}
          </section>

          {/* Section 5: Supporting Documents */}
          <section className="card p-5">
             <div className="flex items-center gap-2 mb-3">
              <Upload size={18} className="text-slate" />
              <h2 className="text-base font-heading font-semibold text-charcoal">Supporting Documents</h2>
            </div>
            <p className="text-sm text-slate leading-relaxed">
              Supporting document upload is not available yet.
            </p>
          </section>

        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate border-t border-border-color pt-5 mt-8 leading-relaxed">
        <strong>Disclaimer:</strong> Expert escalation provides a request for human review. IP-SAKTI itself does not provide legal advice, and submission of a request does not guarantee a particular legal or regulatory outcome.
      </p>

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft size={16} /> Back to Assessment
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-medium text-forest-green hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>

    </div>
  );
};

export default ExpertEscalation;
