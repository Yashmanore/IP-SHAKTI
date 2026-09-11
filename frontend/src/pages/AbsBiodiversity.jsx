import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Users,
  Globe,
  MapPin,
  FileText,
  DollarSign,
  Scale,
  ShieldAlert,
  Info,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import ActiveAssessmentBar from '../components/ActiveAssessmentBar';
import { useJurisdiction } from '../context/JurisdictionContext';

// Notified NTAC (Normally Traded as Commodities) Species List under Section 40
const NTAC_COMMODITY_SPECIES = [
  { name: 'Turmeric (Haldi)', botanical: 'Curcuma longa', ntacStatus: 'Notified NTAC (MoEFCC S.O. 135(E))' },
  { name: 'Black Pepper (Maricha)', botanical: 'Piper nigrum', ntacStatus: 'Notified NTAC' },
  { name: 'Ginger (Shunthi)', botanical: 'Zingiber officinale', ntacStatus: 'Notified NTAC' },
  { name: 'Cardamom (Ela)', botanical: 'Elettaria cardamomum', ntacStatus: 'Notified NTAC' },
  { name: 'Cumin (Jeera)', botanical: 'Cuminum cyminum', ntacStatus: 'Notified NTAC' },
  { name: 'Fenugreek (Methi)', botanical: 'Trigonella foenum-graecum', ntacStatus: 'Notified NTAC' },
  { name: 'Clove (Lavanga)', botanical: 'Syzygium aromaticum', ntacStatus: 'Notified NTAC' },
  { name: 'Coriander (Dhanyaka)', botanical: 'Coriandrum sativum', ntacStatus: 'Notified NTAC' },
];

export default function AbsBiodiversity() {
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

  // Entity & Calculation State
  const [applicantType, setApplicantType] = useState('INDIAN_COMPANY');
  const [turnoverLakhs, setTurnoverLakhs] = useState(250); // ₹2.5 Crores
  const [activeTab, setActiveTab] = useState('entity');

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

  // NTAC check
  const detectedNtac = NTAC_COMMODITY_SPECIES.filter((sp) =>
    botanicalList.some((ing) => ing.toLowerCase().includes(sp.name.toLowerCase()) || ing.toLowerCase().includes(sp.botanical.toLowerCase()))
  );

  // ABS Benefit Sharing Royalty Calculation
  // Turnover in Lakhs (₹):
  // Up to 100 Lakhs (1 Cr): 0.1%
  // 100 to 320 Lakhs (1 to 3.2 Cr): 0.2%
  // Above 320 Lakhs (> 3.2 Cr): 0.5%
  let absRoyaltyRate = 0.1;
  if (turnoverLakhs > 320) {
    absRoyaltyRate = 0.5;
  } else if (turnoverLakhs > 100) {
    absRoyaltyRate = 0.2;
  }

  const annualTurnoverInRupees = turnoverLakhs * 100000;
  const statutoryAbsRoyaltyRupees = Math.round(annualTurnoverInRupees * (absRoyaltyRate / 100));

  const isForeignEntity = applicantType === 'FOREIGN_ENTITY_OR_NRI';

  const handleBack = () => {
    navigate('/regulatory-check', { state: assessmentState });
  };

  const handleContinue = () => {
    navigate('/tkdl-prior-art', { state: assessmentState });
  };

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
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('absBiodiversity.title', 'ABS & Biological Diversity Act Compliance')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('absBiodiversity.subtitle', 'Statutory compliance analysis under Biological Diversity Act 2002 & 2023 Amendment (Section 3 vs Section 7, Section 6 IPR Approval, and ABS Benefit Sharing Royalty).')}
        </p>
      </div>

      <AssessmentStepper activeKey="abs" />

      {/* Active Assessment Bar */}
      <ActiveAssessmentBar
        currentAssessment={assessmentState}
        onAssessmentChange={handleAssessmentChange}
        stepTitle="Active Biodiversity Assessment"
      />

      {/* ── STATUTORY SUMMARY CARD ──────────────────────────────────────── */}
      <div className="card p-6 border-l-4 border-l-forest-green mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Scale className="text-forest-green" size={24} />
            <h2 className="text-xl font-heading font-bold text-charcoal">
              Statutory ABS Regime: {isForeignEntity ? 'Section 3 (Prior Approval of NBA)' : 'Section 7 (Prior Intimation to SBB)'}
            </h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isForeignEntity
              ? 'bg-error/15 text-error border border-error/30'
              : 'bg-forest-green/15 text-forest-green border border-forest-green/30'
          }`}>
            {isForeignEntity ? 'National Authority (NBA)' : 'State Board (SBB)'}
          </span>
        </div>

        <p className="text-sm text-charcoal leading-relaxed mb-4">
          {isForeignEntity
            ? 'Because the entity has foreign shareholding or non-Indian directors, Section 3 applies: Accessing Indian biological resources without prior written approval of the National Biodiversity Authority (NBA) is strictly prohibited.'
            : 'For Indian entities, commercial utilization of biological resources requires prior intimation to the State Biodiversity Board (SBB) under Section 7. Registered AYUSH practitioners enjoy exemption under the 2023 Amendment.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-warm-ivory/60 border border-border-color space-y-1">
            <strong className="text-forest-green block">Applicable Mandatory Form:</strong>
            <p className="text-charcoal/90 font-medium">
              {isForeignEntity ? 'NBA Form I (Access to Biological Resources) + Form III for Patenting' : 'State Biodiversity Board (SBB) Commercial Utilization Intimation Form'}
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-warm-ivory/60 border border-border-color space-y-1">
            <strong className="text-forest-green block">Patents Act Nexus (Section 6 Mandate):</strong>
            <p className="text-charcoal/90">
              Form III approval from NBA is mandatory <strong>prior to the grant of any Indian patent</strong> claiming Indian biological resources.
            </p>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ────────────────────────────────────────────── */}
      <div className="flex border-b border-border-color mb-6 overflow-x-auto">
        {[
          { id: 'entity', label: 'Section 3 vs Section 7 Determination', icon: <Users size={16} /> },
          { id: 'calculator', label: 'Live ABS Royalty Calculator', icon: <Calculator size={16} /> },
          { id: 'ntac', label: `Section 40 NTAC Commodity Check (${detectedNtac.length})`, icon: <Leaf size={16} /> },
          { id: 'forms', label: 'Statutory NBA Form Roadmap', icon: <FileText size={16} /> },
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

      {/* TAB 1: SECTION 3 VS SECTION 7 DETERMINATION */}
      {activeTab === 'entity' && (
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Select Applicant Entity Legal Status:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'INDIAN_COMPANY', label: 'Indian Company / LLP', sub: '100% Indian shareholding & management' },
                { id: 'INDIAN_INDIVIDUAL', label: 'Indian Citizen / Vaidya', sub: 'Sole proprietor / AYUSH practitioner' },
                { id: 'FOREIGN_ENTITY_OR_NRI', label: 'Foreign Entity / NRI / FDI', sub: 'Entity with any foreign ownership/directors' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setApplicantType(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    applicantType === opt.id
                      ? 'border-forest-green bg-forest-green/5 ring-2 ring-forest-green/30'
                      : 'border-border-color bg-white hover:bg-warm-ivory'
                  }`}
                >
                  <span className="font-bold text-sm text-charcoal block mb-0.5">{opt.label}</span>
                  <span className="text-[11px] text-slate block">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-warm-ivory/60 border border-border-color space-y-3 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-forest-green flex items-center gap-2">
              <Scale size={16} />
              Statutory Roadmap under Biological Diversity Act:
            </h3>

            {isForeignEntity ? (
              <div className="space-y-2 text-charcoal">
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error">
                  <strong>Section 3 Triggered (National Biodiversity Authority - NBA):</strong>
                  <p className="text-xs text-charcoal/90 mt-1">
                    Non-Indian individuals, NRIs, and Indian companies with any foreign capital (even 1% FDI) or foreign directors are classified as "Section 3 persons". You MUST submit <strong>NBA Form I</strong> in Chennai and execute an Access & Benefit Sharing agreement <strong>before obtaining or collecting any Indian herbs or bio-resources</strong>.
                  </p>
                </div>
                <div className="text-slate">
                  • <strong>Processing Time:</strong> Approximately 180 days.<br />
                  • <strong>Statutory Fee:</strong> ₹10,000 application fee + ABS contribution.<br />
                  • <strong>Penal Warning:</strong> Section 55 imposes imprisonment up to 5 years for non-compliance.
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-charcoal">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success">
                  <strong>Section 7 Governed (State Biodiversity Board - SBB):</strong>
                  <p className="text-xs text-charcoal/90 mt-1">
                    Indian citizens and domestic entities are governed under Section 7. Prior intimation must be submitted to the concerned State Biodiversity Board (e.g. Maharashtra SBB, Kerala SBB) where the biological resource is procured or processed for commercial utilization.
                  </p>
                </div>
                <div className="text-slate">
                  • <strong>2023 Amendment Relief:</strong> Codified traditional knowledge users and local vaidyas are granted exemptions from commercial intimation fees.<br />
                  • <strong>Benefit Sharing:</strong> Fair and equitable benefit sharing applies to commercial manufacturers based on annual ex-factory turnover.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ABS ROYALTY CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-color pb-3">
            <div>
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <Calculator size={18} className="text-forest-green" />
                Statutory Access & Benefit Sharing (ABS) Royalty Calculator
              </h3>
              <p className="text-xs text-slate">
                Calculated strictly in accordance with NBA ABS Guidelines 2014 & Amended Framework
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-forest-green text-white">
              Official Formula
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-charcoal mb-2">
                <span>Annual Ex-Factory Product Turnover (in Lakhs ₹):</span>
                <span className="text-forest-green text-sm">₹{turnoverLakhs} Lakhs (₹{(turnoverLakhs / 100).toFixed(2)} Crores)</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={turnoverLakhs}
                onChange={(e) => setTurnoverLakhs(Number(e.target.value))}
                className="w-full accent-forest-green cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate mt-1">
                <span>₹10 Lakhs (0.1% Rate)</span>
                <span>₹100 Lakhs (1 Cr)</span>
                <span>₹320 Lakhs (3.2 Cr, 0.5% Rate)</span>
                <span>₹1,000 Lakhs (10 Cr)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-warm-ivory/50 border border-border-color">
                <span className="text-xs text-slate block mb-1">Applicable ABS Slab Rate</span>
                <span className="text-2xl font-bold text-forest-green font-sans">{absRoyaltyRate}%</span>
                <p className="text-[10px] text-slate mt-1">
                  {turnoverLakhs <= 100 ? 'Turnover ≤ ₹1 Cr (0.1%)' : turnoverLakhs <= 320 ? 'Turnover ₹1-3.2 Cr (0.2%)' : 'Turnover > ₹3.2 Cr (0.5%)'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-forest-green/10 border border-forest-green/30 sm:col-span-2">
                <span className="text-xs text-slate block mb-1">Estimated Annual ABS Contribution Liability</span>
                <span className="text-2xl font-bold text-forest-green font-sans">
                  ₹{statutoryAbsRoyaltyRupees.toLocaleString('en-IN')} / year
                </span>
                <p className="text-[10px] text-charcoal/80 mt-1">
                  95% directed to local Biodiversity Management Committees (BMCs) for herbal conservation; 5% retained by SBB/NBA.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION 40 NTAC COMMODITY CHECK */}
      {activeTab === 'ntac' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border-color pb-3">
            <div>
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <Leaf size={18} className="text-forest-green" />
                Section 40: Normally Traded as Commodities (NTAC) Scanner
              </h3>
              <p className="text-xs text-slate">
                Exemptions under Ministry of Environment, Forest & Climate Change (MoEFCC) Official Gazette
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-muted-gold/20 text-muted-gold">
              400+ Notified Species
            </span>
          </div>

          <div className="p-4 rounded-xl bg-warm-ivory/60 border border-border-color text-xs text-charcoal space-y-2">
            <strong className="text-forest-green block text-sm">Critical Legal Nuance (Judge-Proof Rule):</strong>
            <p className="text-slate leading-relaxed">
              Under Section 40, biological resources traded normally as agricultural commodities (e.g., Turmeric, Black Pepper, Ginger) are exempt from NBA approval <strong>ONLY when traded purely as agricultural commodities in market yards</strong>.
            </p>
            <p className="text-error font-medium leading-relaxed">
              ⚠️ The moment an enterprise utilizes these commodities for <strong>commercial bioprospecting, patented pharmaceutical formulations, or active extract manufacturing</strong>, the Section 40 exemption CEASES, and full SBB/NBA compliance is statutorily triggered.
            </p>
          </div>

          {detectedNtac.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                Detected Formulation Ingredients with NTAC Status:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {detectedNtac.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-border-color flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-charcoal block">{item.name}</span>
                      <span className="text-slate italic text-[11px]">{item.botanical}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success">
                      {item.ntacStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-warm-ivory text-xs text-slate">
              None of the active ingredients in this formulation are listed in the common spice NTAC commodity list. Standard Section 3/7 compliance applies.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STATUTORY NBA FORM ROADMAP */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'NBA Form I: Access to Biological Resources',
              statute: 'Section 3 & Rule 14',
              target: 'Foreign entities, NRIs, and foreign-participating Indian firms',
              purpose: 'Mandatory prior approval before collecting or purchasing Indian herbs for research or commercial use.',
              timeline: '180 days statutory review window',
            },
            {
              title: 'NBA Form II: Transfer of Research Results',
              statute: 'Section 4 & Rule 16',
              target: 'Indian researchers transferring data to foreign entities',
              purpose: 'Approval required before transferring clinical or laboratory research results on Indian bio-resources to foreign collaborators.',
              timeline: '90 days statutory review window',
            },
            {
              title: 'NBA Form III: Application for Patent / IPR',
              statute: 'Section 6 & Rule 18',
              target: 'ANY person (Indian or Foreign) filing a patent',
              purpose: 'Mandatory approval from NBA BEFORE grant of any Indian or PCT patent claiming Indian biological resources.',
              timeline: '90 days statutory review window',
            },
            {
              title: 'SBB Intimation: Commercial Utilization Form',
              statute: 'Section 7 & State Rules',
              target: 'Indian companies and citizens',
              purpose: 'Prior intimation to the State Biodiversity Board of the state where bio-resources are collected or processed.',
              timeline: '30-60 days acknowledgment',
            },
          ].map((f, i) => (
            <div key={i} className="card p-5 space-y-2 text-xs border border-border-color">
              <div className="flex items-center justify-between border-b border-border-color pb-1.5">
                <h4 className="font-bold text-sm text-forest-green">{f.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate/10 text-slate">{f.statute}</span>
              </div>
              <p className="text-charcoal/90"><strong>Applies to:</strong> {f.target}</p>
              <p className="text-slate"><strong>Purpose:</strong> {f.purpose}</p>
              <p className="text-forest-green font-semibold"><strong>Timeline:</strong> {f.timeline}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 mt-8 border-t border-border-color">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-semibold text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Regulatory Check
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-deep-teal transition-colors shadow-sm cursor-pointer"
        >
          Continue to TKDL Prior Art <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
