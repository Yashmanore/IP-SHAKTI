import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Mail,
  Users,
  ShieldAlert,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Scale,
  Leaf,
  Library,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Printer,
  FolderPlus,
  Info,
  ChevronRight,
  CheckSquare,
  Square,
  Globe,
  MapPin,
  ExternalLink,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import { useJurisdiction } from '../context/JurisdictionContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

// ─────────────────────────────────────────────────────────────────────────────
// Sample Demo Context for direct visits or preview
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SAMPLE_CONTEXT = {
  assessmentId: 'IPS-2026-AYU-8492',
  productName: 'Ayush-GlycoShield Forte Capsule',
  productType: 'Proprietary Ayurvedic Medicine',
  applicantName: 'Shree Dhanvantari Herbals Ltd.',
  applicantType: 'Indian Private Entity (MSME)',
  jurisdiction: 'INDIA',
  destinationMarket: '',
  mainIngredients: 'Gudmar (Gymnema sylvestre), Haridra (Curcuma longa), Amalaki (Emblica officinalis), Maricha (Piper nigrum - 5% Piperine extract)',
  intendedUse: 'Adjuvant management of metabolic syndrome and glycemic homeostasis through synergistic bio-enhanced herbal extract',
  classicalTextReference: 'Bhavaprakasha Nighantu (Haritakyadi Varga) & Charaka Samhita (Cikitsasthana Ch. 6)',
  status: 'completed',
  hasPatentClaim: true,
  createdAt: new Date().toISOString(),
  classificationResult: {
    category: 'PROPRIETARY_AYURVEDIC_MEDICINE',
    categoryDisplayName: 'Proprietary Ayurvedic Medicine (Rule 158-B(1)(b))',
    regulatoryRoute: 'Drugs and Cosmetics Rules 1945 — Rule 158-B',
    statutoryForm: 'Form 24-D (State Licensing Authority - SLA)',
    classicalReferenceChecked: true,
    clinicalEvidenceRequired: true,
    clinicalEvidenceDetails: 'Pilot safety trial & published therapeutic evidence required as per Rule 158-B(1) for new combinations of classical ingredients.',
    nbaComplianceStatus: 'MANDATORY_FORM_III_PRIOR_TO_PATENT',
    requiredNbaForm: 'Form III (National Biodiversity Authority)',
    section3pRisk: 'HIGH_FOR_BASE_HERBS',
    section3eRisk: 'APPLICABLE_REQUIRES_SYNERGISM_PROOF',
    patentabilityStatus: 'CONDITIONALLY_PATENTABLE_WITH_SYNERGISM',
  },
  ipProtection: {
    trademarkRecommended: true,
    trademarkClass: 'Class 5 (Pharmaceuticals) & Class 30 (Dietary supplements)',
    tradeSecretFocus: 'Proprietary aqueous-ethanolic extraction ratio (4:1) and Piperine bio-enhancer nano-suspension protocol',
    patentStrategy: 'Process patent and synergistic formulation claim with combination index CI < 0.75',
  },
  regulatoryCheck: {
    authority: 'State Licensing Authority (SLA), Ministry of Ayush',
    mandatedTests: ['Heavy metal assay (Pb, Cd, As, Hg)', 'Pesticide residue screen', 'Microbial load as per API', 'Aflatoxin testing'],
    safetyStudy: 'OECD 423 Acute Oral Toxicity Protocol in rodent model',
  },
  absBiodiversity: {
    status: 'ABS_FORM_III_REQUIRED',
    sbbNotification: 'Form 1 intimation to State Biodiversity Board mandatory for commercial utilization',
    nbaApproval: 'Form III approval from NBA mandatory before filing Indian or PCT patent applications',
    benefitSharing: '0.1% to 0.5% of annual gross ex-factory sales to NBA Local Biodiversity Management Committee (BMC)',
  },
  tkdlAssessment: {
    tkRelevance: 'yes',
    citations: [
      { text: 'Charaka Samhita, Cikitsasthana, Prameha Cikitsa, Sloka 24-27', subject: 'Gymnema sylvestre & Curcuma longa in glycemic regulation' },
      { text: 'Bhavaprakasha Nighantu, Haritakyadi Varga, Sloka 142', subject: 'Haridra and Amalaki (Nisha-Amalaki combination for diabetes)' },
      { text: 'Ayurvedic Pharmacopoeia of India (API), Vol. 1, Monograph 34', subject: 'Standardized specifications for Piper nigrum fruits' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ScoreBadge = ({ score, statusText }) => {
  let bg = 'bg-emerald-500';
  let text = 'text-emerald-700';
  let border = 'border-emerald-200';
  let pillBg = 'bg-emerald-50';

  if (score < 60) {
    bg = 'bg-rose-500';
    text = 'text-rose-700';
    border = 'border-rose-200';
    pillBg = 'bg-rose-50';
  } else if (score < 80) {
    bg = 'bg-amber-500';
    text = 'text-amber-700';
    border = 'border-amber-200';
    pillBg = 'bg-amber-50';
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${border} ${pillBg}`}>
      <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm border border-border-color">
        <span className="font-heading font-bold text-base text-charcoal">{score}%</span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-slate">IP-SAKTI Readiness Index</div>
        <div className={`text-sm font-bold ${text}`}>{statusText}</div>
      </div>
    </div>
  );
};

const Guidance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();

  // Load context from state or fallback to default sample
  const rawContext = location.state;
  const isDemo = !rawContext;
  const [assessmentContext, setAssessmentContext] = useState(rawContext || DEFAULT_SAMPLE_CONTEXT);
  const effectiveJurisdiction = assessmentContext?.jurisdiction || globalJurisdiction || 'INDIA';

  const [activeTab, setActiveTab] = useState('ip-roadmap');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Checkbox state for actionable checklist
  const [completedSteps, setCompletedSteps] = useState({
    step1: true,
    step2: true,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
  });

  const toggleStep = (stepKey) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const cr = assessmentContext?.classificationResult || DEFAULT_SAMPLE_CONTEXT.classificationResult;
  const productName = assessmentContext?.productName || 'Ayurvedic Formulation';
  const sessionId = assessmentContext?.assessmentId || 'IPS-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  // Save to My Cases in localStorage
  const handleSaveCase = () => {
    try {
      const existing = localStorage.getItem('ip_sakti_cases');
      const cases = existing ? JSON.parse(existing) : [];

      const newCase = {
        id: sessionId,
        productName: productName,
        name: productName,
        category: cr?.category || 'PROPRIETARY',
        classificationDisplayName: cr?.categoryDisplayName || 'Proprietary Ayurvedic Medicine',
        jurisdiction: effectiveJurisdiction,
        status: 'completed',
        currentStage: 'Final Guidance',
        guidanceAvailable: true,
        sourceCount: 6,
        createdAt: assessmentContext?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assessmentState: {
          ...assessmentContext,
          jurisdiction: effectiveJurisdiction,
          assessmentId: sessionId,
        },
      };

      const filtered = cases.filter((c) => c.id !== sessionId);
      const updated = [newCase, ...filtered];
      localStorage.setItem('ip_sakti_cases', JSON.stringify(updated));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to save case to localStorage:', e);
    }
  };

  // Direct PDF Download
  const handleDirectDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const params = new URLSearchParams();
      params.set('productName', productName);
      params.set('applicantName', assessmentContext?.applicantName || 'Registered Ayurvedic Innovator');
      params.set('recipientEmail', assessmentContext?.email || 'user@example.com');
      params.set('jurisdiction', effectiveJurisdiction);

      const res = await fetch(`${API_BASE_URL}/api/v1/report/download/${sessionId}?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Download failed. Navigating to Legal Dossier page for full export suite.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IP_SHAKTI_Legal_Dossier_${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: navigate to legal-dossier page
      navigate('/legal-dossier', { state: { ...assessmentContext, assessmentId: sessionId } });
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: 'ip-roadmap', labelKey: 'guidance.tabs.ipRoadmap', label: 'Multi-Tier IP Roadmap', icon: <Award size={16} /> },
    { id: 'regulatory-158b', labelKey: 'guidance.tabs.regulatory158b', label: 'Rule 158-B & Licensing', icon: <Scale size={16} /> },
    { id: 'patentability-3p', labelKey: 'guidance.tabs.patentability3p', label: 'Sec 3(p) & 3(e) Defense', icon: <ShieldAlert size={16} /> },
    { id: 'biodiversity-nba', labelKey: 'guidance.tabs.biodiversityNba', label: 'ABS & Biodiversity Act', icon: <Leaf size={16} /> },
    { id: 'tkdl-analysis', labelKey: 'guidance.tabs.tkdlAnalysis', label: 'TKDL & Prior Art Risk', icon: <Library size={16} /> },
    { id: 'action-checklist', labelKey: 'guidance.tabs.actionChecklist', label: 'Filing Checklist & SLA', icon: <CheckSquare size={16} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Stepper & Breadcrumbs */}
      <Breadcrumb
        items={[
          { labelKey: 'nav.productClassification', label: 'Product Classification', path: '/product-classification' },
          { labelKey: 'nav.ipProtection', label: 'IP Protection', path: '/ip-protection' },
          { labelKey: 'nav.regulatoryCheck', label: 'Regulatory Check', path: '/regulatory-check' },
          { labelKey: 'nav.absBiodiversity', label: 'ABS & Biodiversity', path: '/abs-biodiversity' },
          { labelKey: 'nav.tkdlPriorArt', label: 'TKDL / Prior Art', path: '/tkdl-prior-art' },
          { labelKey: 'nav.guidance', label: 'Final Guidance', path: '/guidance' },
        ]}
      />

      <AssessmentStepper activeKey="guidance" />

      {/* Demo Banner if context was loaded from sample */}
      {isDemo && (
        <div className="mb-6 p-4 bg-muted-gold/10 border border-muted-gold/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-charcoal">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-muted-gold shrink-0" />
            <div>
              <span className="font-semibold text-forest-green">Sample Assessment Preview Active:</span>{' '}
              Displaying synthesized guidance for <em>{productName}</em>. You can customize, test exports, or start a new assessment.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/ask-ip-sakti')}
            className="text-xs font-semibold bg-forest-green text-white px-3 py-1.5 rounded-lg hover:bg-deep-teal transition-colors shrink-0"
          >
            Start New Assessment
          </button>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Assessment successfully saved to <strong>My Cases</strong>! You can revisit this guidance anytime.
          </div>
          <button
            type="button"
            onClick={() => navigate('/my-cases')}
            className="text-xs font-bold underline hover:text-emerald-950"
          >
            View in My Cases →
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-forest-green via-deep-teal to-forest-green text-white rounded-2xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-wider uppercase bg-white/20 text-warm-ivory px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
                Step 7 of 7 — Executive Synthesis
              </span>
              <span className="text-xs font-mono text-white/80 bg-black/20 px-2.5 py-1 rounded-full">
                ID: {sessionId}
              </span>
              <span className="text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                {effectiveJurisdiction === 'INTERNATIONAL' ? <Globe size={12} /> : <MapPin size={12} />}
                {effectiveJurisdiction === 'INTERNATIONAL' ? 'International' : 'India'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-warm-ivory leading-tight mb-2">
              Final Guidance & Strategic Assessment Report
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Unified sovereign advisory for <strong className="text-white font-semibold">{productName}</strong> combining
              Rule 158-B classification, Section 3(p)/3(e) patent defense, National Biodiversity Authority (NBA) compliance,
              and TKDL prior art circumvention.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/legal-dossier', { state: { ...assessmentContext, jurisdiction: effectiveJurisdiction, assessmentId: sessionId } })}
              className="flex items-center justify-center gap-2 bg-muted-gold text-forest-green font-heading font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-yellow-400 transition-all hover:scale-[1.02] focus:ring-2 focus:ring-white/50 text-sm"
            >
              <FileText size={18} />
              Open Legal Dossier Suite
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveCase}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg transition-colors"
                title="Save case to browser storage"
              >
                <FolderPlus size={15} /> Save to My Cases
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium px-3 py-2.5 rounded-lg transition-colors"
                title="Print guidance report"
              >
                <Printer size={15} /> Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 flex flex-col justify-between border-forest-green/20">
          <div>
            <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Product Category</div>
            <div className="text-sm font-bold text-charcoal leading-snug">
              {cr?.categoryDisplayName || 'Proprietary Ayurvedic Medicine'}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-forest-green font-medium">
            <Scale size={13} /> SLA Route: Rule 158-B
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between border-forest-green/20">
          <div>
            <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Patent Bar Status</div>
            <div className="text-sm font-bold text-charcoal leading-snug">
              Sec 3(p) Barred for Raw Herbs
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 font-medium">
            <ShieldAlert size={13} /> Exception via Synergism (3(e))
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-between border-forest-green/20">
          <div>
            <div className="text-xs font-semibold text-slate uppercase tracking-wider mb-1">Biodiversity (ABS)</div>
            <div className="text-sm font-bold text-charcoal leading-snug">
              NBA Form III Mandated
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-forest-green font-medium">
            <Leaf size={13} /> Biological Diversity Act Sec 6
          </div>
        </div>

        <div className="card p-4 flex flex-col justify-center border-forest-green/20">
          <ScoreBadge score={84} statusText="Ready for Trademark & SLA Filing" />
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="border-b border-border-color mb-6 flex overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-forest-green text-forest-green bg-forest-green/5 rounded-t-lg'
                : 'border-transparent text-slate hover:text-charcoal hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {t(tab.labelKey, tab.label)}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MULTI-TIER IP ROADMAP ─────────────────────────────────── */}
      {activeTab === 'ip-roadmap' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Award size={22} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-charcoal">
                  Multi-Tier Intellectual Property Protection Architecture
                </h2>
                <p className="text-xs text-slate">
                  Ayurvedic formulations require a composite multi-regime strategy to establish commercial exclusivity without violating statutory traditional knowledge prohibitions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Layer 1: Trademark */}
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Priority 1 — Critical
                  </span>
                  <span className="text-xs font-semibold text-slate">Form TM-A</span>
                </div>
                <h3 className="font-heading font-bold text-charcoal text-base mb-1">
                  Brand & Wordmark Exclusivity (Trademark)
                </h3>
                <p className="text-xs text-slate mb-3 leading-relaxed">
                  Trademarks offer instantaneous, renewable 10-year statutory monopolies immune to Section 3(p) traditional knowledge invalidation.
                </p>
                <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
                  <li><strong>Class 5:</strong> Ayurvedic pharmaceutical preparations and therapeutic syrups/capsules.</li>
                  <li><strong>Class 3:</strong> Topical skincare, herbal hair oils, and external Lepas.</li>
                  <li><strong>Class 30:</strong> Medicated confectionery, herbal tea infusions, and dietary adjuncts.</li>
                  <li><strong>Strategy:</strong> Ensure trademark is coined/fanciful (e.g., "GlycoShield") rather than purely descriptive Sanskrit botanical names.</li>
                </ul>
              </div>

              {/* Layer 2: Trade Secret */}
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/50 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Priority 1 — Critical
                  </span>
                  <span className="text-xs font-semibold text-slate">DPDP 2023 Compliant</span>
                </div>
                <h3 className="font-heading font-bold text-charcoal text-base mb-1">
                  Trade Secrets & Extraction Know-How
                </h3>
                <p className="text-xs text-slate mb-3 leading-relaxed">
                  Traditional formulations are published in classical texts, but high-yield standardized extraction protocols remain protectable proprietary secrets.
                </p>
                <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
                  <li><strong>Protected Know-How:</strong> Supercritical CO2 extraction parameters, precise maceration temperatures, solvent retention ratios.</li>
                  <li><strong>Legal Mechanism:</strong> Binding Non-Disclosure Agreements (NDAs), employee confidentiality clauses, restricted clean-room batch records.</li>
                  <li><strong>Indefinite Term:</strong> No expiration date so long as operational secrecy is maintained.</li>
                </ul>
              </div>

              {/* Layer 3: Patent Strategy */}
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Priority 2 — Conditional
                  </span>
                  <span className="text-xs font-semibold text-slate">Form 1 & Form 2</span>
                </div>
                <h3 className="font-heading font-bold text-charcoal text-base mb-1">
                  Patent Protection with Synergistic Efficacy
                </h3>
                <p className="text-xs text-slate mb-3 leading-relaxed">
                  Section 3(p) bars patents on known traditional herbs. Patentability is strictly conditioned on proving synergistic interaction under Section 3(e).
                </p>
                <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
                  <li><strong>Claim Scope:</strong> Focus claims on synergistic combination ratios (e.g. 4:1 Gymnemic acid to Curcuminoid ratio) showing Combination Index CI &lt; 0.75.</li>
                  <li><strong>Novel Delivery System:</strong> Nano-emulsion, liposomal encapsulation, or bioavailability-enhanced phytosomes.</li>
                  <li><strong>Prerequisite:</strong> Mandatory Form III clearance from the National Biodiversity Authority prior to patent grant.</li>
                </ul>
              </div>

              {/* Layer 4: Defensive Publication */}
              <div className="p-5 rounded-xl border border-purple-200 bg-purple-50/50 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    Priority 3 — Strategic
                  </span>
                  <span className="text-xs font-semibold text-slate">Anti-Biopiracy</span>
                </div>
                <h3 className="font-heading font-bold text-charcoal text-base mb-1">
                  Defensive Publication & TKDL Prior Art Shield
                </h3>
                <p className="text-xs text-slate mb-3 leading-relaxed">
                  Prevent competitors and foreign multinational entities from securing illegitimate patents on traditional polyherbal permutations.
                </p>
                <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
                  <li><strong>TKDL Coordination:</strong> Verify citations in the Traditional Knowledge Digital Library to proactively invalidate conflicting foreign filings (USPTO / EPO).</li>
                  <li><strong>Defensive Disclosure:</strong> Publish non-proprietary dosage ranges in Ayush journals to establish unambiguous prior art date.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RULE 158-B & REGULATORY LICENSING ─────────────────────── */}
      {activeTab === 'regulatory-158b' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Scale size={22} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-charcoal">
                  Regulatory Classification & State Licensing Pathway
                </h2>
                <p className="text-xs text-slate">
                  Governed by Rule 158-B of the Drugs and Cosmetics Rules 1945 for Ayurvedic, Siddha, and Unani (ASU) medicines.
                </p>
              </div>
            </div>

            <div className="bg-warm-ivory/60 border border-border-color rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate block uppercase tracking-wider mb-1">Assigned Category</span>
                  <span className="font-bold text-forest-green text-sm">{cr?.categoryDisplayName || 'Proprietary Ayurvedic Medicine'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate block uppercase tracking-wider mb-1">Statutory Licensing Body</span>
                  <span className="font-medium text-charcoal">State Licensing Authority (SLA), Directorate of Ayush</span>
                </div>
                <div>
                  <span className="font-semibold text-slate block uppercase tracking-wider mb-1">Prescribed Application Form</span>
                  <span className="font-mono font-bold text-charcoal bg-white px-2 py-0.5 rounded border border-border-color inline-block">
                    Form 24-D / Form 25-D
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-heading font-semibold text-charcoal text-sm mb-3">
              Mandatory Regulatory Dossier Submissions:
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border-color bg-white flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-charcoal mb-0.5">Schedule I Classical Literature Citation (Authoritative Texts)</div>
                  <div className="text-slate">
                    All individual herbal ingredients must be documented in one of the 56 authoritative classical treatises enumerated in the First Schedule of the Drugs and Cosmetics Act 1940.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border-color bg-white flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-charcoal mb-0.5">Pilot Clinical & Safety Data Obligation (Rule 158-B(1))</div>
                  <div className="text-slate">
                    Because this is a proprietary formulation featuring specific extraction ratios, acute oral toxicity data (OECD 423) and pilot clinical safety validation across a minimum sample cohort (n=30) is required by the SLA.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border-color bg-white flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-charcoal mb-0.5">Pharmacopoeial Quality Standards (API Compliance)</div>
                  <div className="text-slate">
                    Batch analysis reports must confirm compliance with Ayurvedic Pharmacopoeia of India (API) limits: Heavy metals (Lead &lt; 10ppm, Arsenic &lt; 3ppm, Cadmium &lt; 0.3ppm, Mercury &lt; 1ppm), pesticide residues, and absence of pathogenic microbes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEC 3(P) & 3(E) STATUTORY PATENT DEFENSE ────────────── */}
      {activeTab === 'patentability-3p' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-charcoal">
                  Section 3(p) & 3(e) Patentability Bar Analysis
                </h2>
                <p className="text-xs text-slate">
                  Navigating statutory bars under the Indian Patents Act, 1970 for plant-based formulations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
                  <AlertTriangle size={16} /> Section 3(p) Statutory Bar
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  <strong>"An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components."</strong>
                </p>
                <p className="text-xs text-slate mt-2">
                  → Directly bars claiming therapeutic indications for Gudmar, Turmeric, or Amla that are already described in ancient Ayurvedic texts.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                  <AlertTriangle size={16} /> Section 3(e) Mere Admixture Bar
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  <strong>"A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance."</strong>
                </p>
                <p className="text-xs text-slate mt-2">
                  → Simply mixing multiple herbs is deemed unpatentable unless there is scientifically verified synergism.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/60">
              <h3 className="font-heading font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700" />
                Prescribed Patent Claim Defense Strategy
              </h3>
              <p className="text-xs text-emerald-950 mb-3 leading-relaxed">
                To overcome Section 3(p) and 3(e) objections from the Indian Patent Office (IPO) and foreign patent examiners, the specification must incorporate:
              </p>
              <div className="space-y-2 text-xs text-emerald-900">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">1.</span>
                  <span><strong>Synergistic Quantitative Index:</strong> File comparative bio-assay data demonstrating that Combination Index (CI &lt; 0.8) yields a statistically significant improvement (p &lt; 0.01) over the mathematical sum of the individual herbs.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">2.</span>
                  <span><strong>Bioavailability Enhancement:</strong> Frame claims around the specific role of 5% Piperine extract in amplifying the systemic bioavailability of Curcuminoids and Gymnemic acids.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">3.</span>
                  <span><strong>Narrow Method & Extract Claims:</strong> Draft process claims emphasizing specialized chromatographic extraction parameters rather than broad botanical combinations.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: BIODIVERSITY & NBA CLEARANCES ─────────────────────────── */}
      {activeTab === 'biodiversity-nba' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Leaf size={22} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-charcoal">
                  Biological Diversity Act (2002) & Access & Benefit Sharing (ABS)
                </h2>
                <p className="text-xs text-slate">
                  Mandatory statutory permissions from the National Biodiversity Authority (NBA) and State Biodiversity Boards (SBB).
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-charcoal">
              <div className="p-4 rounded-xl border border-border-color bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-green text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Section 6 — Prior Approval for Patent Applications
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal bg-warm-ivory px-2 py-0.5 rounded border">
                    NBA Form III
                  </span>
                </div>
                <p className="text-slate leading-relaxed">
                  No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining prior approval of the National Biodiversity Authority.
                </p>
                <div className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                  Critical: Filing a patent without NBA Form III approval is punishable under Section 55 with imprisonment up to 5 years or fine up to ₹10 Lakhs.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border-color bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-green text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Section 7 — Intimation to State Biodiversity Board (SBB)
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal bg-warm-ivory px-2 py-0.5 rounded border">
                    Form 1 (SBB)
                  </span>
                </div>
                <p className="text-slate leading-relaxed">
                  Indian citizens and Indian registered corporate bodies accessing biological resources for commercial utilization must give prior intimation to the concerned State Biodiversity Board.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border-color bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-green text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Benefit Sharing Levies (ABS Regulations 2014)
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal bg-warm-ivory px-2 py-0.5 rounded border">
                    0.1% - 0.5%
                  </span>
                </div>
                <p className="text-slate leading-relaxed">
                  The applicant shall pay between 0.1% to 0.5% of the annual gross ex-factory sale price of the commercialized product to the Biodiversity Management Committee (BMC) through the NBA.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: TKDL & PRIOR ART ANALYSIS ─────────────────────────────── */}
      {activeTab === 'tkdl-analysis' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                <Library size={22} />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-charcoal">
                  Traditional Knowledge Digital Library (TKDL) Prior Art Citations
                </h2>
                <p className="text-xs text-slate">
                  Authoritative ancient treatise references mapped to prevent anticipatory rejections.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {DEFAULT_SAMPLE_CONTEXT.tkdlAssessment.citations.map((cite, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border-color bg-warm-ivory/40 flex items-start gap-3">
                  <BookOpen size={18} className="text-forest-green shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-charcoal mb-0.5">{cite.text}</div>
                    <div className="text-slate">{cite.subject}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 text-xs text-blue-900 leading-relaxed">
              <strong>TKDL Examiner Defense Guideline:</strong> When responding to First Examination Reports (FER) citing TKDL accession numbers, argue that the present invention does not claim the herb per se, but rather an unprecedented, non-obvious combination ratio with verifiable pharmacokinetic bio-enhancement.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: FILING CHECKLIST & SLA ─────────────────────────────────── */}
      {activeTab === 'action-checklist' && (
        <div className="space-y-6">
          <div className="card p-6 border-forest-green/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center">
                  <CheckSquare size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-charcoal">
                    Step-by-Step Filing Checklist & Statutory Roadmap
                  </h2>
                  <p className="text-xs text-slate">
                    Track your preparation milestones across intellectual property and regulatory bodies.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'step1', title: '1. Rule 158-B Classification Evaluation', desc: 'Verify product routing under Proprietary Ayurvedic Medicine.', completed: true, locked: true },
                { key: 'step2', title: '2. Ayurvedic Pharmacopoeia of India (API) Quality Testing', desc: 'Complete heavy metals, pesticide residues, microbial contamination assays.', completed: true, locked: false },
                { key: 'step3', title: '3. Form TM-A Trademark Filing under Class 5 & Class 3', desc: 'Secure brand name monopoly with the Controller General of Patents, Designs & Trade Marks.', completed: false, locked: false },
                { key: 'step4', title: '4. NBA Form III Application for Patent Clearance', desc: 'Submit statutory request to National Biodiversity Authority before filing patent specification.', completed: false, locked: false },
                { key: 'step5', title: '5. SBB Form 1 Prior Intimation', desc: 'Notify the State Biodiversity Board regarding commercial utilization of biological resources.', completed: false, locked: false },
                { key: 'step6', title: '6. SLA Form 24-D Manufacturing License Application', desc: 'Submit complete regulatory dossier with pilot safety data to State Directorate of Ayush.', completed: false, locked: false },
                { key: 'step7', title: '7. Provisional Patent Application (Form 1 & Form 2)', desc: 'File provisional specification with documented synergy index (CI < 0.8) and extract ratios.', completed: false, locked: false },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => !item.locked && toggleStep(item.key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    completedSteps[item.key]
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-white border-border-color hover:border-forest-green/40'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {completedSteps[item.key] ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <Square size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className={`font-bold ${completedSteps[item.key] ? 'text-emerald-950 line-through' : 'text-charcoal'}`}>
                      {item.title}
                    </div>
                    <div className="text-slate mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER NAVIGATION & ACTIONS ──────────────────────────────────── */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border-color">
        <button
          type="button"
          onClick={() => navigate('/tkdl-prior-art', { state: assessmentContext })}
          className="flex items-center justify-center gap-2 text-sm font-medium text-slate hover:text-charcoal transition-colors px-4 py-2.5 rounded-lg border border-border-color bg-white hover:bg-warm-ivory"
        >
          <ArrowLeft size={16} /> Back to TKDL Search
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/expert-escalation', { state: { ...assessmentContext, assessmentId: sessionId } })}
            className="flex items-center justify-center gap-2 text-sm font-medium text-deep-teal hover:bg-deep-teal/10 transition-colors px-4 py-2.5 rounded-lg border border-deep-teal/30"
          >
            <Users size={16} /> Consult IP Facilitator
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal-dossier', { state: { ...assessmentContext, assessmentId: sessionId } })}
            className="flex items-center justify-center gap-2 bg-forest-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            Open Legal Dossier & Exports <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Guidance;
