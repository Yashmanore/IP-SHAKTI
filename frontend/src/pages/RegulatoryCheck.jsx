import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Factory,
  FlaskConical,
  Tag,
  Megaphone,
  Apple,
  Sparkles,
  Stethoscope,
  Info,
  Scale,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import ActiveAssessmentBar from '../components/ActiveAssessmentBar';
import { useJurisdiction } from '../context/JurisdictionContext';

// Schedule T GMP Audit Items
const SCHEDULE_T_ITEMS = [
  { id: 'premises', label: 'Factory Location & Environmental Hygiene (Dust/pest-proof, non-flooding area)' },
  { id: 'water', label: 'Water Treatment System (RO/DM water conforming to Pharmacopoeial purity)' },
  { id: 'quarantine', label: 'Raw Material Quarantine, Botanical Identity Testing & TLC Fingerprinting' },
  { id: 'contactParts', label: 'Manufacturing Equipment SS-316 / Food-grade contact surfaces' },
  { id: 'airHandling', label: 'Adequate Ventilation / Positive Pressure Air Handling Units (AHUs)' },
  { id: 'bmr', label: 'Standard Operating Procedures (SOPs) & Batch Manufacturing Records (BMR)' },
  { id: 'qcLab', label: 'In-House Quality Control Lab (Heavy metals, microbial load, pesticide assays)' },
  { id: 'retention', label: 'Control Sample Storage Room (Retained for 1 year past expiry date)' },
];

export default function RegulatoryCheck() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();

  const [assessmentState, setAssessmentState] = useState(() => {
    if (location.state?.classificationResult) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem('ip_shakti_active_assessment');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // GMP Checklist State
  const [checkedGmp, setCheckedGmp] = useState({
    premises: true,
    water: true,
    quarantine: true,
    contactParts: true,
    airHandling: false,
    bmr: true,
    qcLab: true,
    retention: false,
  });

  const [activeTab, setActiveTab] = useState('rule158b');

  useEffect(() => {
    if (location.state?.classificationResult) {
      setAssessmentState(location.state);
      try {
        sessionStorage.setItem('ip_shakti_active_assessment', JSON.stringify(location.state));
      } catch (e) {}
    }
  }, [location.state]);

  const handleAssessmentChange = (newAssessment) => {
    setAssessmentState(newAssessment);
  };

  const cr = assessmentState?.classificationResult;
  const prodName = assessmentState?.productName || 'Ayurvedic Product';
  const botanicalList = assessmentState?.botanicalIngredients || 
    (assessmentState?.ingredients ? (Array.isArray(assessmentState.ingredients) ? assessmentState.ingredients : assessmentState.ingredients.split(',').map(s => s.trim())) : []);

  const gmpCheckedCount = Object.values(checkedGmp).filter(Boolean).length;
  const gmpPercentage = Math.round((gmpCheckedCount / SCHEDULE_T_ITEMS.length) * 100);

  const toggleGmp = (id) => {
    setCheckedGmp((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isClassical = cr?.category === 'CLASSICAL_AYURVEDIC_FORMULATION';
  const isProprietaryA = cr?.category === 'PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A';
  const isProprietaryB = cr?.category === 'PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B';
  const isPhyto = cr?.category === 'NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL';
  const isAahar = cr?.category === 'AYURVEDA_AAHAR';
  const isCosmetic = cr?.category === 'AYURVEDIC_COSMETIC';

  const handleBack = () => {
    navigate('/ip-protection', { state: assessmentState });
  };

  const handleContinue = () => {
    navigate('/abs-biodiversity', { state: assessmentState });
  };

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
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('regulatoryCheck.title', 'Regulatory Check & Manufacturing Compliance')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('regulatoryCheck.subtitle', 'Statutory compliance validation under Drugs & Cosmetics Act 1940 (Rule 158-B, Rule 161, Schedule T GMP) and FSSAI Ayurveda Aahar Regulations 2022.')}
        </p>
      </div>

      <AssessmentStepper activeKey="regulatory" />

      {/* Active Assessment Bar */}
      <ActiveAssessmentBar
        currentAssessment={assessmentState}
        onAssessmentChange={handleAssessmentChange}
        stepTitle="Active Regulatory Formulation"
      />

      {/* ── REGULATORY PATHWAY BANNER ───────────────────────────────────── */}
      <div className="card p-6 border-l-4 border-l-forest-green mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Scale className="text-forest-green" size={24} />
            <h2 className="text-xl font-heading font-bold text-charcoal">
              Statutory Licensing Pathway: {cr?.categoryDisplayName || 'Proprietary Ayurvedic Medicine'}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-green/15 text-forest-green border border-forest-green/30">
            {cr?.licensingAuthority || 'State AYUSH Licensing Authority (SLA)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-lg bg-warm-ivory/60 border border-border-color space-y-1.5">
            <span className="font-bold text-forest-green block">Licensing Procedure & Forms:</span>
            <p className="text-charcoal/90">
              {cr?.licensingProcedure ||
                'Apply for Manufacturing License with State AYUSH Licensing Authority under Form 25-D or Loan License under Form 24-D accompanied by technical dossier.'}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-warm-ivory/60 border border-border-color space-y-1.5">
            <span className="font-bold text-forest-green block">Clinical Trial & Safety Mandates:</span>
            <p className="text-charcoal/90">
              {cr?.clinicalTrialRequirement ||
                'Published authoritative safety data and acute oral toxicity reports required. Human clinical trials are conditionally determined by Rule 158-B.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate pt-2 border-t border-border-color">
          <Info size={14} className="text-forest-green shrink-0" />
          <span>Governing Statute: <strong>{cr?.governingAct || 'Drugs and Cosmetics Act, 1940 & Rules 1945'}</strong></span>
        </div>
      </div>

      {/* ── REGULATORY MODULE TABS ─────────────────────────────────────── */}
      <div className="flex border-b border-border-color mb-6 overflow-x-auto">
        {[
          { id: 'rule158b', label: 'Rule 158-B Pathway Matrix', icon: <FileText size={16} /> },
          { id: 'scheduleT', label: `Schedule T GMP Audit (${gmpPercentage}%)`, icon: <Factory size={16} /> },
          { id: 'rule161', label: 'Rule 161 Labeling & Packaging', icon: <Tag size={16} /> },
          { id: 'dmr', label: 'DMR(OA) Advertising Screen', icon: <Megaphone size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-forest-green text-forest-green bg-forest-green/5'
                : 'border-transparent text-slate hover:text-charcoal'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RULE 158-B DETAILED PATHWAY MATRIX */}
      {activeTab === 'rule158b' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Classical Formulation */}
            <div className={`p-5 rounded-xl border transition-all ${
              isClassical ? 'border-forest-green bg-forest-green/5 ring-2 ring-forest-green/30' : 'border-border-color bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <BookOpen size={16} className="text-forest-green" />
                  Classical Formulation (Section 3(a))
                </h3>
                {isClassical && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-green text-white">Active Class</span>}
              </div>
              <p className="text-xs text-slate mb-3 leading-relaxed">
                Manufactured strictly according to the recipe, method, and dosage in First Schedule authoritative texts (54 recognized treatises).
              </p>
              <ul className="text-xs space-y-1 text-charcoal/80 list-disc list-inside">
                <li>Form 25-D Manufacturing License (State AYUSH SLA)</li>
                <li><strong>Clinical Trials:</strong> 100% Exempt (Statutory presumption of safety)</li>
                <li><strong>Mandatory:</strong> Text name must be cited on the label</li>
              </ul>
            </div>

            {/* Proprietary Category A */}
            <div className={`p-5 rounded-xl border transition-all ${
              isProprietaryA ? 'border-forest-green bg-forest-green/5 ring-2 ring-forest-green/30' : 'border-border-color bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-forest-green" />
                  Proprietary Category A (Rule 158-B(1)(A))
                </h3>
                {isProprietaryA && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-green text-white">Active Class</span>}
              </div>
              <p className="text-xs text-slate mb-3 leading-relaxed">
                Ingredients from First Schedule books, with classical traditional therapeutic indications, but proprietary blend or ratio.
              </p>
              <ul className="text-xs space-y-1 text-charcoal/80 list-disc list-inside">
                <li>State AYUSH License under Rule 158-B</li>
                <li><strong>Clinical Trials:</strong> Full trials NOT required</li>
                <li><strong>Mandatory:</strong> Published safety citations & acute oral toxicity data</li>
              </ul>
            </div>

            {/* Proprietary Category B */}
            <div className={`p-5 rounded-xl border transition-all ${
              isProprietaryB ? 'border-forest-green bg-forest-green/5 ring-2 ring-forest-green/30' : 'border-border-color bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-warning" />
                  Proprietary Category B (Rule 158-B(1)(B))
                </h3>
                {isProprietaryB && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-green text-white">Active Class</span>}
              </div>
              <p className="text-xs text-slate mb-3 leading-relaxed">
                Ingredients from First Schedule books, but with altered dosage routes, modified excipients, or <strong>new claimed therapeutic indication</strong>.
              </p>
              <ul className="text-xs space-y-1 text-charcoal/80 list-disc list-inside">
                <li>State AYUSH License with Technical Committee vetting</li>
                <li><strong>Clinical Trials:</strong> MANDATORY Pilot Trial (min. 30 patients)</li>
                <li><strong>Mandatory:</strong> Sub-acute animal toxicity studies in GLP facility</li>
              </ul>
            </div>

            {/* Phytopharmaceutical Drug */}
            <div className={`p-5 rounded-xl border transition-all ${
              isPhyto ? 'border-forest-green bg-forest-green/5 ring-2 ring-forest-green/30' : 'border-border-color bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                  <FlaskConical size={16} className="text-forest-green" />
                  Phytopharmaceutical Drug (Rule 122-E)
                </h3>
                {isPhyto && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-forest-green text-white">Active Class</span>}
              </div>
              <p className="text-xs text-slate mb-3 leading-relaxed">
                Purified and standardized fractional botanical extract with minimum 4 active bioactive marker compounds.
              </p>
              <ul className="text-xs space-y-1 text-charcoal/80 list-disc list-inside">
                <li>CDSCO / DCGI Central Approval (New Drug)</li>
                <li><strong>Clinical Trials:</strong> Phase I, II, and III IND Clinical Trials</li>
                <li><strong>Mandatory:</strong> Chromatography HPLC/LC-MS fingerprint validation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE T GOOD MANUFACTURING PRACTICES (GMP) CHECKLIST */}
      {activeTab === 'scheduleT' && (
        <div className="card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-forest-green/10 border border-forest-green/20">
            <div>
              <h3 className="text-base font-bold text-forest-green">
                Schedule T GMP Readiness Score: {gmpPercentage}%
              </h3>
              <p className="text-xs text-slate">
                Statutory prerequisite under Section 33P of Drugs & Cosmetics Act for manufacturing license issuance
              </p>
            </div>
            <div className="w-48 bg-white rounded-full h-3.5 overflow-hidden border border-border-color">
              <div
                className={`h-full transition-all duration-500 ${
                  gmpPercentage >= 80 ? 'bg-success' : gmpPercentage >= 50 ? 'bg-warning' : 'bg-error'
                }`}
                style={{ width: `${gmpPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Interactive Schedule T GMP Audit Requirements:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SCHEDULE_T_ITEMS.map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleGmp(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    checkedGmp[item.id]
                      ? 'border-forest-green/40 bg-forest-green/5 text-charcoal'
                      : 'border-border-color bg-white text-slate hover:bg-warm-ivory'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedGmp[item.id]}
                    onChange={() => {}}
                    className="accent-forest-green mt-0.5"
                  />
                  <span className="text-xs font-medium leading-relaxed">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-warm-ivory border border-border-color text-xs text-slate leading-relaxed">
            <strong>Inspection Notice:</strong> State AYUSH Drug Inspectors conduct joint physical site audits to verify air locks, dust extraction hoods, water conductivity, and QA records before granting Certificate of Good Manufacturing Practices (Form 26-E1).
          </div>
        </div>
      )}

      {/* TAB 3: RULE 161 PACKAGING & LABELLING */}
      {activeTab === 'rule161' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statutory Requirements Checklist */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
              <Tag size={18} className="text-forest-green" />
              Rule 161 & 161C Mandatory Statements
            </h3>
            <p className="text-xs text-slate leading-relaxed">
              Every container and carton of an Ayurvedic formulation must carry specific statutory declarations in English, Hindi, or the regional language.
            </p>

            <ul className="space-y-2 text-xs text-charcoal">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-forest-green mt-0.5 shrink-0" />
                <span><strong>Ayurvedic Indicator:</strong> Prominent label `"AYURVEDIC MEDICINE"` or `"आयुर्वेदिक औषधि"`.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-forest-green mt-0.5 shrink-0" />
                <span><strong>Complete Formula:</strong> Official botanical Latin names with specific plant part used (e.g. Radix, Rhizome, Folium).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-forest-green mt-0.5 shrink-0" />
                <span><strong>Shelf Life (Rule 161C):</strong> Maximum expiry date calculated from manufacturing date.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-forest-green mt-0.5 shrink-0" />
                <span><strong>Dosage & Storage:</strong> "Store in a cool dry place away from direct sunlight."</span>
              </li>
            </ul>
          </div>

          {/* Interactive Compliant Carton Mockup */}
          <div className="card p-6 border-2 border-dashed border-forest-green/30 bg-warm-ivory/40 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border-color pb-2">
              <span className="font-bold text-forest-green uppercase text-[11px] tracking-wider">
                [STATUTORY CARTON MOCKUP]
              </span>
              <span className="bg-forest-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                AYURVEDIC MEDICINE
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-charcoal font-sans">{prodName}</h4>
              <p className="text-[11px] text-slate font-sans">Proprietary Ayurvedic Medicine / Rule 158-B</p>
            </div>

            <div className="bg-white p-2.5 rounded border border-border-color text-[11px] space-y-1">
              <strong>Composition (Each 500mg contains):</strong>
              {botanicalList.slice(0, 4).map((ing, i) => (
                <div key={i} className="text-slate flex justify-between">
                  <span>• {ing}</span>
                  <span>125 mg</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate space-y-0.5 pt-1">
              <div>Mfg. Lic. No.: AYUSH/MH/2026/SLA-108</div>
              <div>Batch No.: IPS-2609A | Mfg Date: 09/2026 | Exp Date: 08/2029</div>
              <div>Dosage: 1-2 tablets twice daily with warm water or as directed by Vaidya.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DMR(OA) ADVERTISING SCREEN */}
      {activeTab === 'dmr' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-warning">
            <Megaphone size={20} />
            <h3 className="text-base font-bold text-charcoal">
              Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 Screen
            </h3>
          </div>
          <p className="text-xs text-slate leading-relaxed">
            The DMR(OA) Act strictly prohibits advertising remedies or claiming miraculous cures for <strong>54 designated diseases and disorders</strong>. Any violation results in criminal prosecution and license suspension.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { name: 'Cancer / Malignancy', status: 'STRICTLY PROHIBITED' },
              { name: 'Diabetes (Reversal/Cure)', status: 'STRICTLY PROHIBITED' },
              { name: 'Hypertension / Heart Disease', status: 'STRICTLY PROHIBITED' },
              { name: 'Kidney Failure / Stones', status: 'STRICTLY PROHIBITED' },
              { name: 'Obesity (Permanent Cure)', status: 'STRICTLY PROHIBITED' },
              { name: 'Sexual Impotence / Virility', status: 'STRICTLY PROHIBITED' },
            ].map((d, i) => (
              <div key={i} className="p-3 rounded-lg bg-error/5 border border-error/20 text-xs">
                <span className="font-bold text-charcoal block mb-0.5">{d.name}</span>
                <span className="text-[10px] font-bold text-error">{d.status}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-forest-green/10 border border-forest-green/20 text-xs text-charcoal">
            <strong className="text-forest-green">Permitted Commercial Claims:</strong> You may lawfully claim <em>"Supports healthy joint mobility"</em>, <em>"Aids natural liver metabolic detox"</em>, or <em>"Ayurvedic rejuvenation (Rasayana)"</em>. Never use words like <em>"Cure"</em>, <em>"Eradicate"</em>, or <em>"100% Miracle Treatment"</em>.
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mt-8 border-t border-border-color">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-semibold text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to IP Protection
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-deep-teal transition-colors shadow-sm cursor-pointer"
        >
          Continue to ABS & Biodiversity <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
