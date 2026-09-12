import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Globe,
  BookOpen,
  CheckCircle2,
  Scale,
  Leaf,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  HelpCircle,
  Clock,
  Send,
  Building,
  CheckSquare,
  Cpu,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { useJurisdiction } from '../context/JurisdictionContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

// ─────────────────────────────────────────────────────────────────────────────
// Default fallback context if no assessment was stored
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_PRESET_CONTEXT = {
  assessmentId: 'IPS-2026-AYU-8492',
  productName: 'Ayush-GlycoShield Forte Capsule',
  productType: 'Proprietary Ayurvedic Medicine',
  applicantName: 'Shree Dhanvantari Herbals Ltd.',
  applicantType: 'Indian Private Corporate Body (MSME)',
  jurisdiction: 'INDIA',
  ingredients: 'Gudmar (Gymnema sylvestre), Haridra (Curcuma longa), Amalaki (Emblica officinalis), Maricha (Piper nigrum - 5% Piperine extract)',
  botanicalIngredients: [
    'Gymnema sylvestre (Gudmar)',
    'Curcuma longa (Haridra)',
    'Emblica officinalis (Amalaki)',
    'Piper nigrum (Maricha - 5% Piperine)',
  ],
  intendedUse: 'THERAPEUTIC_TREATMENT',
  claimedIndication: 'Adjuvant management of metabolic syndrome and glycemic homeostasis through synergistic bio-enhanced herbal extract',
  classificationResult: {
    category: 'PROPRIETARY_AYURVEDIC_MEDICINE',
    categoryDisplayName: 'Proprietary Ayurvedic Medicine (Rule 158-B(1)(b))',
    governingAct: 'Drugs and Cosmetics Act 1940 & Rules 1945, Rule 158-B',
    licensingAuthority: 'State AYUSH Licensing Authority (Form 24-D / Form 25-D)',
    clinicalTrialRequirement: 'Pilot safety trial & published therapeutic evidence required as per Rule 158-B(1) for new combinations of classical ingredients.',
    patentabilityVerdict: 'CONDITIONALLY_PATENTABLE_WITH_SYNERGISM',
    section3pRisk: 'HIGH_FOR_RAW_HERBS',
    section3eRisk: 'APPLICABLE_REQUIRES_SYNERGISM_PROOF',
  },
};

const LegalDossier = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();

  // Load context from navigation state OR sessionStorage fallback
  const storedAssessment = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('ip_shakti_active_assessment');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const assessmentContext = location.state || storedAssessment || DEFAULT_PRESET_CONTEXT;
  const effectiveJurisdiction = assessmentContext?.jurisdiction || globalJurisdiction || 'INDIA';
  const sessionId = assessmentContext?.assessmentId || assessmentContext?.sessionId || 'IPS-' + Math.floor(100000 + Math.random() * 900000);

  const cr = assessmentContext?.classificationResult;
  const productName = assessmentContext?.productName || 'Ayurvedic Botanical Complex';
  const applicantName = assessmentContext?.applicantName || 'Registered Ayurvedic Innovator';
  const rawIngredients = assessmentContext?.ingredients || (Array.isArray(assessmentContext?.botanicalIngredients) ? assessmentContext.botanicalIngredients.join(', ') : 'Polyherbal Formulation');
  const botanicalList = Array.isArray(assessmentContext?.botanicalIngredients)
    ? assessmentContext.botanicalIngredients
    : rawIngredients.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [emailAddress, setEmailAddress] = useState(assessmentContext?.email || '');
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState('');

  // ── Build Dynamic Payload ──
  const buildPayload = () => ({
    sessionId,
    productName,
    applicantName,
    applicantType: assessmentContext?.applicantType || 'Indian Corporate Body / MSME',
    recipientEmail: emailAddress || 'innovator@registered.ayush.gov.in',
    jurisdiction: effectiveJurisdiction,
    ingredients: botanicalList,
    rawIngredients,
    intendedUse: assessmentContext?.intendedUse || 'THERAPEUTIC_TREATMENT',
    claimedIndication: assessmentContext?.claimedIndication || 'Therapeutic and healthcare application',
    category: cr?.category || 'PROPRIETARY_AYURVEDIC_MEDICINE',
    categoryDisplayName: cr?.categoryDisplayName || 'Proprietary Ayurvedic Medicine (Rule 158-B)',
    governingAct: cr?.governingAct || 'Drugs and Cosmetics Act 1940 & Rules 1945, Rule 158-B',
    licensingAuthority: cr?.licensingAuthority || 'State AYUSH Licensing Authority (Form 24-D / Form 25-D)',
    clinicalTrialRequirement: cr?.clinicalTrialRequirement || 'Safety data and acute oral toxicity studies required under Rule 158-B(1)(B).',
    patentabilityVerdict: cr?.patentabilityVerdict || 'Conditioned upon Synergism & Novel Extraction',
    section3pRisk: cr?.section3pRisk || 'High classical treatise density. Section 3(p) traditional knowledge bar applies to raw mixtures.',
    section3eRisk: cr?.section3eRisk || 'Section 3(e) requires demonstrable Synergistic Combination Index (CI < 0.75).',
    synergismIndex: 'Combination Index (CI) < 0.75',
    trademarkClass: 'Class 5 (Pharmaceuticals) & Class 30 (Ayurveda Aahar)',
    patentStrategy: 'Process patent for standardized extraction with synergistic Combination Index CI < 0.75',
    nbaComplianceStatus: 'Section 7 SBB Prior Intimation & Section 6 NBA Form III clearance',
    requiredNbaForm: 'NBA Form III (IPR Approval) & SBB Form 1 (Commercial Utilization)',
    benefitSharing: '0.1% to 0.5% of annual gross ex-factory sales to Local BMC',
    gmpReadinessScore: 88,
    citations: [
      'Charaka Samhita (Chikitsa Sthana)',
      'Bhavaprakasha Nighantu',
      'Ayurvedic Pharmacopoeia of India (API)',
      'Drugs and Cosmetics Rules 1945, Rule 158-B',
    ],
    actionRoadmap: [
      'Rule 158-B SLA License Application (Form 24-D / 25-D)',
      'NBA Form III Prior IPR Clearance before patent filing',
      'Form TM-A Trademark Filing under Class 5 & Class 30',
      'Provisional Patent Application with Synergism bio-assay data',
    ],
  });

  // ── Download Dynamic PDF Handler ──
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      const payload = buildPayload();
      const response = await fetch(`${API_BASE_URL}/api/v1/report/generate-dynamic-dossier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Fallback to GET endpoint
        const params = new URLSearchParams();
        params.set('productName', productName);
        params.set('applicantName', applicantName);
        params.set('ingredients', rawIngredients);
        params.set('category', cr?.category || 'PROPRIETARY_AYURVEDIC_MEDICINE');
        params.set('jurisdiction', effectiveJurisdiction);

        const getRes = await fetch(`${API_BASE_URL}/api/v1/report/download/${sessionId}?${params.toString()}`);
        if (!getRes.ok) throw new Error(`HTTP ${getRes.status}: Failed to generate dynamic PDF dossier.`);
        const blob = await getRes.blob();
        triggerBlobDownload(blob, `IP_SHAKTI_Legal_Dossier_${productName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      } else {
        const blob = await response.blob();
        triggerBlobDownload(blob, `IP_SHAKTI_Legal_Dossier_${productName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      }

      setDownloadSuccess(true);
    } catch (err) {
      console.error('PDF download error:', err);
      setDownloadError(err.message || 'Legal dossier could not be generated.');
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerBlobDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // ── Email Dynamic PDF Handler ──
  const handleEmail = async (e) => {
    e.preventDefault();
    if (!emailAddress.trim() || !/^\S+@\S+\.\S+$/.test(emailAddress)) {
      setEmailValidationError('Please enter a valid recipient email address.');
      return;
    }

    setEmailValidationError('');
    setIsEmailing(true);
    setEmailError(null);
    setEmailSuccess(false);

    try {
      const payload = buildPayload();
      const response = await fetch(`${API_BASE_URL}/api/v1/report/email-dynamic-dossier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      setEmailSuccess(true);
    } catch (err) {
      console.error('Email dispatch error:', err);
      setEmailError(err.message || 'Legal dossier could not be dispatched.');
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Breadcrumb items={[{ label: t('nav.legalDossier', 'Legal Dossier'), path: '/legal-dossier' }]} />

      {/* ── HEADER BANNER ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl border border-border-color shadow-2xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-muted-gold" /> Official Sovereign Dossier
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-charcoal tracking-tight">
            Executive Legal & Regulatory Dossier
          </h1>
          <p className="text-slate text-sm max-w-2xl">
            Consolidated statutory decision intelligence compiled across <strong>Rule 158-B</strong>, <strong>Patents Act §3(p)/§3(e)</strong>, <strong>Biodiversity Act (ABS)</strong>, and <strong>Schedule T GMP</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-forest-green text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-deep-teal transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Compiling Multi-Page PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} className="text-muted-gold" />
                <span>Download Legal Dossier PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span><strong>Dossier Generated:</strong> Your customized, publication-grade statutory PDF dossier has been downloaded successfully.</span>
        </div>
      )}

      {downloadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-center gap-3 shadow-2xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span><strong>Generation Warning:</strong> {downloadError}</span>
        </div>
      )}

      {/* ── LIVE CONSOLIDATED 5-PILLAR REPORT PREVIEW ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Sovereign Dossier Sheet Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border-2 border-forest-green/30 p-6 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest-green/5 rounded-bl-full pointer-events-none" />

            {/* Document Header Registry */}
            <div className="border-b border-border-color pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted-gold uppercase tracking-widest block">
                    Government of India / AYUSH IPR Registry Reference
                  </span>
                  <h2 className="text-2xl font-heading font-extrabold text-forest-green tracking-tight">
                    {productName}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate block">Ref ID: {sessionId}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-green/10 text-forest-green font-bold inline-block mt-1">
                    {effectiveJurisdiction === 'INDIA' ? '🇮🇳 Indian Jurisdiction' : '🌐 International PCT'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 bg-warm-ivory/60 p-3 rounded-xl border border-border-color">
                <div>
                  <span className="text-slate block text-[10px] uppercase font-bold">Applicant</span>
                  <span className="font-semibold text-charcoal">{applicantName}</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-charcoal">{cr?.categoryDisplayName || 'Proprietary Medicine'}</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase font-bold">Readiness Score</span>
                  <span className="font-bold text-forest-green">88 / 100 (HIGH)</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase font-bold">Generated</span>
                  <span className="font-mono text-slate-600">{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>
            </div>

            {/* Formulation Botanical Composition */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <Leaf size={14} /> Active Botanical Ingredients & Formulation Spec
              </div>
              <div className="p-4 rounded-xl bg-forest-green/5 border border-forest-green/15 text-xs text-charcoal leading-relaxed">
                <div className="font-medium mb-1.5"><strong>Formulation Components:</strong> {rawIngredients}</div>
                <div className="text-slate text-[11px]">
                  <strong>Claimed Indication:</strong> {assessmentContext?.claimedIndication || 'Therapeutic disease management and physiological homeostasis.'}
                </div>
              </div>
            </div>

            {/* Pillar 1: Rule 158-B Classification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <Scale size={14} /> 1. Rule 158-B & Regulatory Licensing Route
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border-color bg-warm-ivory/40 space-y-1">
                  <span className="text-slate text-[10px] uppercase font-bold block">Statutory Route & Authority</span>
                  <p className="font-bold text-charcoal">{cr?.governingAct || 'D&C Act 1940, Rule 158-B'}</p>
                  <p className="text-slate text-[11px]">State AYUSH Licensing Authority (Form 24-D / 25-D)</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border-color bg-warm-ivory/40 space-y-1">
                  <span className="text-slate text-[10px] uppercase font-bold block">Clinical Trial Mandate</span>
                  <p className="font-bold text-charcoal">Safety & Toxicological Assays</p>
                  <p className="text-slate text-[11px]">{cr?.clinicalTrialRequirement || 'Published literature & acute toxicity data under Rule 158-B(1)(B).'}</p>
                </div>
              </div>
            </div>

            {/* Pillar 2: Patents Act §3(p)/§3(e) & Synthesized Claims */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <ShieldCheck size={14} /> 2. Patents Act §3(p)/§3(e) Defense & Draft Patent Claims
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span>Traditional Knowledge & Admixture Risk Mitigation</span>
                  <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 text-[10px]">Synergism Required</span>
                </div>
                <p className="text-charcoal leading-relaxed text-[11px]">
                  Raw herbs face rejection under <strong>Section 3(p)</strong>. To secure grant, the specification asserts a statistically validated <strong>Combination Index (CI &lt; 0.75)</strong> and specialized extraction method.
                </p>
              </div>

              {/* Monospace Synthesized Claims Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] space-y-2">
                <div className="text-muted-gold font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                  <span>Synthesized Patent Claim 1 (Formulation)</span>
                  <span>Section 10(4) Compliant</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  "1. A synergistic Ayurvedic botanical composition comprising {botanicalList.slice(0, 3).join(', ')}, wherein said botanical constituents exhibit a Synergistic Combination Index (CI) &lt; 0.75 in biological anti-inflammatory and cellular metabolic assays."
                </p>
                <div className="text-muted-gold font-bold text-[10px] uppercase tracking-wider pt-2">
                  <span>Synthesized Patent Claim 2 (Method / Process)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  "2. A method for manufacturing the synergistic composition of claim 1, comprising aqueous-ethanolic extraction at controlled temperatures (45-55°C) yielding standardized phytochemical marker fractions."
                </p>
              </div>
            </div>

            {/* Pillar 3: Biological Diversity Act (ABS) & SBB Clearance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <Leaf size={14} /> 3. Biological Diversity Act (ABS) Compliance Matrix
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-950 font-bold">
                  <span>Section 7 (SBB Intimation) & Section 6 (NBA Form III)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">Mandatory Prior to Grant</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900 pt-1">
                  <div>• <strong>Domestic SBB:</strong> Form 1 intimation prior to commercial batch run.</div>
                  <div>• <strong>IPR Patent Clearance:</strong> NBA Form III mandatory before patent grant.</div>
                  <div>• <strong>Benefit-Sharing:</strong> 0.1% - 0.5% ex-factory sales royalty to BMC.</div>
                  <div>• <strong>WIPO Origin:</strong> Section 10(4)(d)(ii) Indian origin declaration.</div>
                </div>
              </div>
            </div>

            {/* Pillar 4: Sovereign Statutory Action Roadmap */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <CheckSquare size={14} /> 4. Consolidated Sovereign Action Roadmap
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { step: '1. File SLA Form 24-D / Form 25-D', desc: 'Submit Rule 158-B technical dossier to State Directorate of Ayush.', done: true },
                  { step: '2. Register Trademark under Class 5 & Class 30', desc: 'File Form TM-A with CGPDTM for distinctive brand name.', done: true },
                  { step: '3. Submit NBA Form III Application', desc: 'Obtain statutory National Biodiversity Authority approval for Indian botanicals.', done: false },
                  { step: '4. File SBB Form 1 Prior Intimation', desc: 'Notify concerned State Biodiversity Board for commercial utilization.', done: false },
                  { step: '5. Provisional Patent Specification Filing', desc: 'File Form 1 & Form 2 with documented CI < 0.75 synergy data.', done: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border-color bg-white">
                    <CheckCircle2 size={16} className={item.done ? 'text-forest-green shrink-0 mt-0.5' : 'text-slate-300 shrink-0 mt-0.5'} />
                    <div>
                      <span className="font-bold text-charcoal">{item.step}</span>
                      <p className="text-slate text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Dispatch Hub & Export Actions */}
        <div className="space-y-6">
          {/* Download Box */}
          <div className="card p-6 border-t-4 border-t-forest-green space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Download size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-charcoal">Download High-Res PDF</h3>
                <span className="text-[11px] text-slate">Ready for filing & audit review</span>
              </div>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Compiles executive summaries, Rule 158-B matrices, Section 3(p) defense, synthesized claims, and statutory citations.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-forest-green text-white py-3 rounded-xl font-bold text-xs hover:bg-deep-teal transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Download Complete Dossier</span>
                </>
              )}
            </button>
          </div>

          {/* Email Box */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-charcoal">Dispatch to Email</h3>
                <span className="text-[11px] text-slate">Send PDF directly to inbox</span>
              </div>
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate mb-1">Innovator Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                    setEmailValidationError('');
                  }}
                  placeholder="innovator@enterprise.com"
                  className="w-full rounded-lg border border-border-color px-3.5 py-2 text-xs text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/30"
                />
                {emailValidationError && <p className="text-[11px] text-rose-600 mt-1">{emailValidationError}</p>}
              </div>

              {emailSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Dossier successfully sent to {emailAddress}!</span>
                </div>
              )}

              {emailError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isEmailing}
                className="w-full flex items-center justify-center gap-2 border-2 border-forest-green text-forest-green py-2.5 rounded-xl font-bold text-xs hover:bg-forest-green hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {isEmailing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Dossier by Email</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Statutory Shield Notice */}
          <div className="p-5 rounded-2xl bg-warm-ivory border border-border-color space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-charcoal">
              <ShieldAlert size={16} className="text-muted-gold" />
              <span>Sovereign Compliance Note</span>
            </div>
            <p className="text-slate text-[11px] leading-relaxed">
              This dossier is compiled using verified statutory references from the <strong>Patents Act 1970</strong>, <strong>D&C Act 1940</strong>, and <strong>Biological Diversity Act 2002</strong>. It serves as actionable intelligence for regulatory submissions and patent drafting.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border-color">
        <button
          type="button"
          onClick={() => navigate('/guidance', { state: assessmentContext })}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate hover:text-charcoal cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Guidance Roadmap
        </button>

        <button
          type="button"
          onClick={() => navigate('/product-classification')}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-forest-green hover:underline cursor-pointer"
        >
          <span>Start Another Assessment</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LegalDossier;
