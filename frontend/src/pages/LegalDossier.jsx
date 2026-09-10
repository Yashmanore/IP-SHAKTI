import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Download,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  MapPin,
  Globe,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
          <span className="text-xs text-slate font-medium block">Status</span>
          <span className="text-charcoal">{context?.status || 'Not available'}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const LegalDossier = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentContext = location.state || null;
  const sessionId = assessmentContext?.assessmentId;
  const hasContext = !!assessmentContext;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [emailAddress, setEmailAddress] = useState(assessmentContext?.email || '');
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState('');

  // ── Download Handler ──
  const handleDownload = async () => {
    if (!sessionId) {
      setDownloadError('Assessment ID is missing.');
      return;
    }
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      const params = new URLSearchParams();
      if (assessmentContext?.productName) params.set('productName', assessmentContext.productName);
      if (assessmentContext?.applicantName) params.set('applicantName', assessmentContext.applicantName);
      if (emailAddress?.trim()) params.set('recipientEmail', emailAddress.trim());
      const paramStr = params.toString() ? `?${params.toString()}` : '';

      const response = await fetch(`${API_BASE_URL}/api/v1/report/download/${sessionId}${paramStr}`);
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Report export endpoint is not connected yet.' : `HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'IP_SHAKTI_Legal_Dossier.pdf';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
        ? 'Report export endpoint is not connected yet.'
        : err.message;
      setDownloadError(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Email Handler ──
  const handleEmail = async (e) => {
    e.preventDefault();
    if (!sessionId) {
      setEmailError('Assessment ID is missing.');
      return;
    }
    if (!emailAddress.trim() || !/^\S+@\S+\.\S+$/.test(emailAddress)) {
      setEmailValidationError('Please enter a valid email address.');
      return;
    }

    setEmailValidationError('');
    setIsEmailing(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/report/email/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: emailAddress.trim(),
          applicantName: assessmentContext?.applicantName || 'Ayurvedic Innovator',
          productName: assessmentContext?.productName || '',
        }),
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Report email endpoint is not connected yet.' : `HTTP Error: ${response.status}`);
      }

      setEmailSuccess(true);
    } catch (err) {
      const msg = err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
        ? 'Report email endpoint is not connected yet.'
        : err.message;
      setEmailError(msg);
    } finally {
      setIsEmailing(false);
    }
  };

  if (!hasContext) {
    return (
      <div className="max-w-5xl mx-auto pb-16">
        <Breadcrumb items={[{ label: 'Legal Dossier', path: '/legal-dossier' }]} />
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">Executive Legal Dossier</h1>
        </div>
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-warm-ivory flex items-center justify-center mb-4 border border-border-color">
            <FileText size={28} className="text-muted-gold" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">No assessment selected</h3>
          <p className="text-sm text-slate max-w-sm leading-relaxed mb-6">
            Open an assessment before generating an Executive Legal Dossier.
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
      <Breadcrumb items={[{ label: 'Legal Dossier', path: '/legal-dossier' }]} />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">Executive Legal Dossier</h1>
        <p className="text-slate text-base leading-relaxed">
          Generate a consolidated, source-grounded report of your IP-SAKTI assessment.
        </p>
      </div>

      <ContextCard context={assessmentContext} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Download Card */}
          <section className="card p-6 border-t-4 border-t-forest-green">
            <div className="flex items-center gap-2 mb-2">
              <Download size={20} className="text-forest-green" />
              <h2 className="text-xl font-heading font-semibold text-charcoal">Download Legal Dossier</h2>
            </div>
            <p className="text-sm text-slate mb-5 leading-relaxed">
              Generate the latest dossier for this assessment and download it as a PDF.
            </p>

            {downloadError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm mb-4">
                <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-charcoal">Legal dossier could not be generated.</p>
                  <p className="text-slate mt-0.5">{downloadError}</p>
                </div>
              </div>
            )}

            {downloadSuccess && (
              <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-lg text-sm mb-4">
                <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                <p className="font-medium text-charcoal">Legal dossier generated successfully.</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || !sessionId}
              className="flex items-center justify-center gap-2 bg-forest-green text-white w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              {isDownloading ? (
                <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
              ) : (
                <><Download size={16} /> Download PDF</>
              )}
            </button>
            {!sessionId && <p className="text-xs text-error mt-2">Cannot download: No Assessment ID</p>}
          </section>

          {/* Email Card */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={20} className="text-forest-green" />
              <h2 className="text-xl font-heading font-semibold text-charcoal">Email Legal Dossier</h2>
            </div>
            <p className="text-sm text-slate mb-5 leading-relaxed">
              Generate the dossier and send it to the registered or selected email address.
            </p>

            <form onSubmit={handleEmail} className="space-y-4 max-w-sm">
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-medium text-charcoal mb-1.5">
                  Email address
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    setEmailValidationError('');
                  }}
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-border-color px-4 py-2.5 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 transition-shadow"
                />
                {emailValidationError && <p className="text-xs text-error mt-1">{emailValidationError}</p>}
              </div>

              {emailError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-error/30 rounded-lg text-sm">
                  <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">Legal dossier could not be sent.</p>
                    <p className="text-slate mt-0.5">{emailError}</p>
                  </div>
                </div>
              )}

              {emailSuccess && (
                <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-lg text-sm">
                  <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                  <p className="font-medium text-charcoal">Legal dossier sent successfully.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isEmailing || !sessionId}
                className="flex items-center justify-center gap-2 border-2 border-forest-green text-forest-green w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEmailing ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending PDF...</>
                ) : (
                  <><Mail size={16} /> Email PDF</>
                )}
              </button>
              {!sessionId && <p className="text-xs text-error mt-2">Cannot send: No Assessment ID</p>}
            </form>
          </section>

          {/* Source Traceability */}
          <section className="card p-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} className="text-muted-gold" />
              <h2 className="text-lg font-heading font-semibold text-charcoal">Source Traceability</h2>
            </div>
            <p className="text-sm text-slate mb-4 leading-relaxed">
              The dossier is intended to preserve the source references supporting the assessment.
            </p>
            {assessmentContext?.sourceRecords && assessmentContext.sourceRecords.length > 0 ? (
              <ul className="space-y-3">
                {assessmentContext.sourceRecords.map((src, i) => (
                  <li key={i} className="text-sm p-3 bg-warm-ivory rounded-lg border border-border-color">
                    <p className="font-medium text-charcoal">{src.title || src.metadata?.title || 'Source Record'}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate">
                      <span>{src.metadata?.jurisdiction || 'Unknown Jurisdiction'}</span>
                      <span>•</span>
                      <span>{src.metadata?.authority_type || src.type || 'Source'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate italic p-3 bg-warm-ivory rounded-lg border border-border-color">
                No source records are available for this assessment yet.
              </p>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          <section className="card p-5">
            <h2 className="text-base font-heading font-semibold text-charcoal mb-3">Report Contents</h2>
            <p className="text-sm text-slate mb-4 leading-relaxed">
              The Executive Legal Dossier consolidates the available assessment findings and source references into a downloadable PDF report.
            </p>
            <ul className="space-y-2 text-sm text-charcoal list-disc list-inside marker:text-forest-green/50">
              <li>Executive Summary</li>
              <li>Regulatory Classification</li>
              <li>IP Protection Analysis</li>
              <li>Traditional Knowledge / TKDL</li>
              <li>ABS & Biodiversity</li>
              <li>Prior Art</li>
              <li>Statutory Sources</li>
              <li>Action Roadmap</li>
              <li>Disclaimer</li>
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-heading font-semibold text-charcoal mb-2">Report Preview</h2>
            <p className="text-sm text-slate leading-relaxed">
              Preview is not available. The complete report will be generated by the backend.
            </p>
          </section>

        </div>
      </div>

      {/* Disclaimers & Navigation */}
      <div className="mt-8 pt-6 border-t border-border-color">
        <div className="flex items-start gap-3 p-4 bg-warm-ivory border border-border-color rounded-lg text-sm mb-6">
          <ShieldAlert size={16} className="text-slate shrink-0 mt-0.5" />
          <p className="text-slate leading-relaxed">
            IP-SAKTI provides source-grounded information and assessment support. The Executive Legal Dossier is not a legal opinion, regulatory approval, licence, certification, market authorization, or official filing before any authority.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/guidance', { state: assessmentContext })}
            className="flex items-center gap-2 text-sm font-medium text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-lg px-2 py-1 -ml-2"
          >
            <ArrowLeft size={16} /> Back to Guidance
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
    </div>
  );
};

export default LegalDossier;
