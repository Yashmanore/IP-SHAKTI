import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Tag,
  MapPin,
  Palette,
  PenLine,
  Lock,
  Sprout,
  BookOpen,
  Info,
  Scale,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AssessmentStepper from '../components/AssessmentStepper';
import ActiveAssessmentBar from '../components/ActiveAssessmentBar';
import { useJurisdiction } from '../context/JurisdictionContext';

// Registered Indian Geographical Indications (GI) for Botanicals & Spices
const REGISTERED_GI_BOTANICALS = [
  { name: 'Saffron', botanical: 'Crocus sativus', giTitle: 'Kashmir Saffron (GI No. 635)', state: 'Jammu & Kashmir' },
  { name: 'Pepper', botanical: 'Piper nigrum', giTitle: 'Malabar Pepper (GI No. 49)', state: 'Kerala' },
  { name: 'Cardamom', botanical: 'Elettaria cardamomum', giTitle: 'Alleppey Green Cardamom (GI No. 55)', state: 'Kerala/Tamil Nadu' },
  { name: 'Turmeric', botanical: 'Curcuma longa', giTitle: 'Erode Turmeric (GI No. 279) / Kandhamal Haldi (GI No. 610)', state: 'Tamil Nadu / Odisha' },
  { name: 'Ginger', botanical: 'Zingiber officinale', giTitle: 'Wayanad Cardamom & Ginger / Assam Karbi Anglong Ginger (GI No. 435)', state: 'Kerala / Assam' },
  { name: 'Chilli', botanical: 'Capsicum annuum', giTitle: 'Guntur Sannam Chilli (GI No. 80) / Naga Mircha (GI No. 109)', state: 'Andhra Pradesh / Nagaland' },
  { name: 'Tea', botanical: 'Camellia sinensis', giTitle: 'Kangra Tea (GI No. 41) / Darjeeling Tea (GI No. 1)', state: 'Himachal Pradesh / West Bengal' },
  { name: 'Makhana', botanical: 'Euryale ferox', giTitle: 'Mithila Makhana (GI No. 696)', state: 'Bihar' },
];

export default function IpProtection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { jurisdiction: globalJurisdiction } = useJurisdiction();

  // Load from location.state OR sessionStorage
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

  const [expandedSection, setExpandedSection] = useState('patent');
  const [showClaimsModal, setShowClaimsModal] = useState(false);

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

  // Detect GIs in ingredients
  const detectedGIs = REGISTERED_GI_BOTANICALS.filter((gi) =>
    botanicalList.some((ing) => ing.toLowerCase().includes(gi.name.toLowerCase()) || ing.toLowerCase().includes(gi.botanical.toLowerCase()))
  );

  // Patentability status calculation
  const isPatentable = cr?.formulationPatentableInIndia ?? false;
  const isProprietaryCatB = cr?.category === 'PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B';
  const isPhytopharmaceutical = cr?.category === 'NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL';
  const isClassical = cr?.category === 'CLASSICAL_AYURVEDIC_FORMULATION';

  const handleBack = () => {
    navigate('/product-classification', { state: assessmentState });
  };

  const handleContinue = () => {
    navigate('/regulatory-check', { state: assessmentState });
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb
        items={[
          { label: 'Product Classification', path: '/product-classification' },
          { label: 'IP Protection', path: '/ip-protection' },
        ]}
      />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">
          {t('ipProtection.title', 'IP Protection & Patentability Analysis')}
        </h1>
        <p className="text-slate text-base leading-relaxed">
          {t('ipProtection.subtitle', 'Rigorous statutory evaluation of patentability, trademark classification, traditional knowledge bars, and geographical indications under Indian IP law.')}
        </p>
      </div>

      <AssessmentStepper activeKey="ip" />

      {/* Unified Formulation Evaluator Bar */}
      <ActiveAssessmentBar
        currentAssessment={assessmentState}
        onAssessmentChange={handleAssessmentChange}
        stepTitle="Active IPR Assessment"
      />

      {/* ── STATUTORY IPR DASHBOARD ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Patentability Verdict Card */}
        <div className="lg:col-span-2 card p-6 border-l-4 border-l-forest-green">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-forest-green" size={24} />
              <h2 className="text-xl font-heading font-bold text-charcoal">
                Indian Patents Act, 1970 Statutory Verdict
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPatentable
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-error/15 text-error border border-error/30'
              }`}
            >
              {isPatentable ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {isPatentable ? 'Potentially Patentable' : 'Statutory Bar (§3(p) / §3(e))'}
            </span>
          </div>

          <p className="text-sm text-charcoal leading-relaxed mb-4">
            {cr?.patentabilityVerdict ||
              'Formulation based on classical botanical ingredients faces statutory non-patentability barriers under Section 3(p) and 3(e) unless non-obvious synergistic efficacy or novel delivery technology is proven.'}
          </p>

          <div className="bg-warm-ivory/60 rounded-lg p-4 border border-border-color mb-4 space-y-2 text-xs text-charcoal">
            <div className="flex items-start gap-2">
              <strong className="text-forest-green shrink-0">Recommended Strategy:</strong>
              <span>{cr?.recommendedIprStrategy || 'Protect brand via Trademark (Class 5). Secure proprietary extraction ratios as Trade Secrets. Avoid filing crude herbal mixture claims.'}</span>
            </div>
            {cr?.relevantPatentSections && cr.relevantPatentSections.length > 0 && (
              <div className="flex items-start gap-2 pt-1 border-t border-border-color/60">
                <strong className="text-forest-green shrink-0">Statutory Sections Triggered:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {cr.relevantPatentSections.map((sec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white font-medium border border-border-color text-charcoal">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate">
              Governed by Indian Patent Office (IPO) Guidelines for Traditional Knowledge Inventions
            </span>
            <button
              type="button"
              onClick={() => setShowClaimsModal(true)}
              className="text-xs font-bold text-forest-green hover:text-deep-teal flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FileText size={14} /> View Claims Drafting Guidance →
            </button>
          </div>
        </div>

        {/* IPR Summary Sidebar Widget */}
        <div className="card p-5 space-y-4 bg-linear-to-b from-white to-warm-ivory/30">
          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
            <Scale size={16} className="text-forest-green" />
            IP Protection Snapshot
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-border-color">
              <span className="text-slate font-medium">Patent Formulation</span>
              <span className={`font-bold ${isPatentable ? 'text-success' : 'text-error'}`}>
                {isPatentable ? 'Eligible (Process/Synergy)' : 'Barred (§3(p))'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-border-color">
              <span className="text-slate font-medium">Trademark Class</span>
              <span className="font-bold text-forest-green">Class 5 (Pharmaceuticals)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-border-color">
              <span className="text-slate font-medium">GI Status</span>
              <span className={`font-bold ${detectedGIs.length > 0 ? 'text-muted-gold' : 'text-slate'}`}>
                {detectedGIs.length > 0 ? `${detectedGIs.length} GI Botanical(s)` : 'None Detected'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-border-color">
              <span className="text-slate font-medium">NBA §6 Approval</span>
              <span className="font-bold text-error">Mandatory Before Patent</span>
            </div>
          </div>

          <div className="p-3 bg-forest-green/10 rounded-lg border border-forest-green/20 text-[11px] text-forest-green leading-tight">
            <strong>Judge-Proof Rule:</strong> A patent on traditional medicinal herbs cannot be granted in India even if foreign jurisdictions grant it, due to §3(p) and TKDL prior art pre-grant oppositions.
          </div>
        </div>
      </div>

      {/* ── DETAILED IP ROUTES ACCORDION ───────────────────────────────── */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-heading font-bold text-forest-green">
          Statutory Route-by-Route Deep Dive
        </h2>

        {/* 1. SECTION 3(p) TRADITIONAL KNOWLEDGE BAR */}
        <div className="card overflow-hidden border border-border-color">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'patent' ? null : 'patent')}
            className="w-full flex items-center justify-between p-5 bg-warm-ivory/20 hover:bg-warm-ivory/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  1. Patent Protection & Section 3 Statutory Bars
                </h3>
                <p className="text-xs text-slate">
                  Patents Act 1970: §3(p) Traditional Knowledge Bar, §3(e) Synergism Bar, §3(d) Enhanced Efficacy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isPatentable ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
              }`}>
                {isPatentable ? 'Process/Synergy Path' : 'Hard Statutory Bar'}
              </span>
              {expandedSection === 'patent' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {expandedSection === 'patent' && (
            <div className="p-6 border-t border-border-color space-y-4 text-sm text-charcoal leading-relaxed bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-error/20 bg-error/5">
                  <h4 className="font-bold text-error flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider">
                    <XCircle size={15} /> What Is Strictly Prohibited (§3(p) & §3(e))
                  </h4>
                  <ul className="space-y-1.5 text-xs text-charcoal/90 list-disc list-inside">
                    <li><strong>Mere Mixtures:</strong> Combining known classical herbs (e.g. Ashwagandha + Turmeric) without synergistic proof is barred under Section 3(e).</li>
                    <li><strong>Known Indications:</strong> Using plants for indications documented in classical treatises (Charaka, Sushruta, API) is barred under Section 3(p).</li>
                    <li><strong>Crude Extracts:</strong> Aqueous or alcohol crude extracts possessing known bioactivity cannot be patented as novel compounds.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-success/20 bg-success/5">
                  <h4 className="font-bold text-success flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider">
                    <CheckCircle2 size={15} /> Legally Viable Patenting Routes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-charcoal/90 list-disc list-inside">
                    <li><strong>Novel Process Claims (§2(1)(j)):</strong> Proprietary extraction methods, such as supercritical CO2 fractionation with specific temperature/pressure parameters.</li>
                    <li><strong>Novel Delivery Systems (NDDS):</strong> Liposomes, phytosomes, or nano-emulsions enhancing targeted bio-availability.</li>
                    <li><strong>Proven Synergistic Compositions:</strong> Specific non-obvious ratios with experimental proof (Combination Index CI &lt; 0.8 in clinical/cell assays).</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-warm-ivory border border-border-color text-xs space-y-2">
                <p className="font-bold text-forest-green flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-warning" /> Mandatory Requirement: NBA Section 6 Prior Approval
                </p>
                <p className="text-slate">
                  Under <strong>Section 6 of the Biological Diversity Act, 2002</strong>, no person can apply for an Indian or international patent based on Indian biological resources without obtaining prior approval from the <strong>National Biodiversity Authority (NBA)</strong> via <strong>Form III</strong> before patent grant. Failure to comply constitutes a cognizable criminal offense under Section 55.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. TRADEMARK PROTECTION (TRADE MARKS ACT 1999) */}
        <div className="card overflow-hidden border border-border-color">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'trademark' ? null : 'trademark')}
            className="w-full flex items-center justify-between p-5 bg-warm-ivory/20 hover:bg-warm-ivory/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green shrink-0">
                <Tag size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  2. Trademark Strategy (Trade Marks Act, 1999)
                </h3>
                <p className="text-xs text-slate">
                  Nice Classification (Class 5, Class 3, Class 30) & Section 9 Absolute Grounds for Refusal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-green/10 text-forest-green">
                Primary IPR Asset
              </span>
              {expandedSection === 'trademark' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {expandedSection === 'trademark' && (
            <div className="p-6 border-t border-border-color space-y-4 text-sm text-charcoal leading-relaxed bg-white">
              <p className="text-xs text-slate leading-relaxed">
                Because herbal formulations face severe patentability thresholds, <strong>Brand Equity (Trademark)</strong> is the strongest and most commercializable IP asset for Ayurvedic products.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-border-color bg-warm-ivory/30">
                  <span className="text-xs font-bold text-forest-green block mb-1">Class 5 (Recommended)</span>
                  <p className="text-xs text-slate">
                    Ayurvedic medicines, medicinal herbal preparations, pharmaceutical products, medicated oils.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-border-color bg-warm-ivory/30">
                  <span className="text-xs font-bold text-forest-green block mb-1">Class 3 (Cosmetics)</span>
                  <p className="text-xs text-slate">
                    Herbal soaps, Ayurvedic skin care lotions, hair oils, shampoos, beauty serums.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg border border-border-color bg-warm-ivory/30">
                  <span className="text-xs font-bold text-forest-green block mb-1">Class 30 / 32 (Aahar)</span>
                  <p className="text-xs text-slate">
                    Ayurveda Aahar food supplements, herbal teas, infused spices, herbal functional beverages.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-error/5 border border-error/20 text-xs">
                <strong className="text-error block mb-1">Critical Section 9(1)(b) Refusal Bar:</strong>
                <p className="text-charcoal/90">
                  Generic Sanskrit classical terms such as <em>"Chyawanprash"</em>, <em>"Triphala"</em>, <em>"Brahmi Ghrita"</em>, or <em>"Kwath"</em> cannot be registered as individual exclusive trademarks because they are publici juris. Applicants must adopt distinctive, coined, or fanciful composite marks (e.g. <em>"NirogShakti™"</em> or <em>"Dabur Chyawanprash™"</em>).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. GEOGRAPHICAL INDICATIONS (GI ACT 1999) */}
        <div className="card overflow-hidden border border-border-color">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'gi' ? null : 'gi')}
            className="w-full flex items-center justify-between p-5 bg-warm-ivory/20 hover:bg-warm-ivory/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  3. Geographical Indications (GI of Goods Act, 1999)
                </h3>
                <p className="text-xs text-slate">
                  Authorized User rights under Section 7(3) & Origin Verification
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                detectedGIs.length > 0 ? 'bg-muted-gold/20 text-muted-gold' : 'bg-slate/10 text-slate'
              }`}>
                {detectedGIs.length > 0 ? `${detectedGIs.length} Detected` : 'Standard Botanicals'}
              </span>
              {expandedSection === 'gi' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {expandedSection === 'gi' && (
            <div className="p-6 border-t border-border-color space-y-4 text-sm text-charcoal leading-relaxed bg-white">
              {detectedGIs.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted-gold/10 border border-muted-gold/30 text-xs">
                    <strong className="text-charcoal block mb-1">
                      Registered GI Botanicals Detected in Formulation:
                    </strong>
                    <div className="space-y-2 mt-2">
                      {detectedGIs.map((gi, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-white border border-border-color">
                          <span className="font-semibold text-forest-green">{gi.giTitle}</span>
                          <span className="text-slate font-medium">{gi.state}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate leading-relaxed">
                    <strong>Statutory Compliance Requirement:</strong> If your product advertises or packages these ingredients with their GI names (e.g. <em>"Contains Certified Malabar Pepper"</em>), the enterprise must be registered as an <strong>Authorized User under Section 7(3)</strong> with the GI Registry in Chennai. Using registered GI titles without certification constitutes infringement under Section 22.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-warm-ivory text-xs text-slate">
                  No registered GI botanical triggers detected for this specific ingredient composition. Standard pharmacopoeial specifications (API) apply.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. TRADE SECRETS VS PATENTING STRATEGY */}
        <div className="card overflow-hidden border border-border-color">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'tradesecret' ? null : 'tradesecret')}
            className="w-full flex items-center justify-between p-5 bg-warm-ivory/20 hover:bg-warm-ivory/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  4. Trade Secret Protection vs Patent Disclosure
                </h3>
                <p className="text-xs text-slate">
                  Protecting proprietary extraction ratios, fermentation microorganisms & temperature profiles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-green/10 text-forest-green">
                Commercial Defense
              </span>
              {expandedSection === 'tradesecret' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {expandedSection === 'tradesecret' && (
            <div className="p-6 border-t border-border-color space-y-4 text-xs text-charcoal leading-relaxed bg-white">
              <p className="text-slate leading-relaxed">
                Filing a patent application mandates complete specification disclosure under Section 10 of the Patents Act. If the patent is subsequently refused under §3(p), the proprietary formulation enters the public domain without monopoly protection.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-border-color text-xs">
                  <thead>
                    <tr className="bg-warm-ivory text-charcoal font-bold">
                      <th className="p-2.5 border border-border-color">Parameter</th>
                      <th className="p-2.5 border border-border-color">Patent Protection</th>
                      <th className="p-2.5 border border-border-color">Trade Secret Protection</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 border border-border-color font-semibold">Duration</td>
                      <td className="p-2.5 border border-border-color">20 years from filing date</td>
                      <td className="p-2.5 border border-border-color text-success font-semibold">Perpetual (as long as secret is kept)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border border-border-color font-semibold">Disclosure</td>
                      <td className="p-2.5 border border-border-color text-error">Mandatory public disclosure</td>
                      <td className="p-2.5 border border-border-color text-success font-semibold">Confidential under NDAs & SOPs</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border border-border-color font-semibold">Best Applied For</td>
                      <td className="p-2.5 border border-border-color">Novel nano-delivery systems, synthetic analogs</td>
                      <td className="p-2.5 border border-border-color">Proprietary blending ratios, fermentation strains</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border-color">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-semibold text-forest-green border border-forest-green/40 px-5 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Product Classification
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-deep-teal transition-colors shadow-sm cursor-pointer"
        >
          Continue to Regulatory Check <ArrowRight size={16} />
        </button>
      </div>

      {/* Claims Drafting Guidance Modal */}
      {showClaimsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-3">
              <h3 className="text-lg font-bold text-forest-green flex items-center gap-2">
                <FileText size={20} />
                IPO Claims Drafting Strategy Roadmap
              </h3>
              <button
                type="button"
                onClick={() => setShowClaimsModal(false)}
                className="text-slate hover:text-charcoal text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-charcoal leading-relaxed">
              <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                <strong className="text-error block mb-1">Claim Type 1: Crude Botanical Formulation (DO NOT DRAFT)</strong>
                <code className="text-[11px] block bg-white p-2 rounded border border-border-color text-charcoal/90">
                  "A medicinal composition comprising 50% Curcuma longa and 50% Zingiber officinale for treating arthritis."
                </code>
                <p className="mt-1 text-slate">
                  <strong>IPO Examiner Objection:</strong> Section 3(p) absolute rejection; cited against TKDL references and Charaka Samhita.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <strong className="text-success block mb-1">Claim Type 2: Standardized Process & Synergistic Fraction (PATENTABLE)</strong>
                <code className="text-[11px] block bg-white p-2 rounded border border-border-color text-charcoal/90">
                  "A process for preparing an enriched bioactive phyto-complex comprising: (a) supercritical CO2 extraction at 280 bar and 45°C to isolate Fraction A; (b) micro-encapsulating said Fraction A in a phospholipid matrix to achieve a dissolution rate exceeding 85% in 30 minutes..."
                </code>
                <p className="mt-1 text-slate">
                  <strong>IPO Examiner Disposition:</strong> Novel process under Section 2(1)(j). Overcomes §3(p) if experimental bio-availability data is provided.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowClaimsModal(false)}
                className="px-4 py-2 bg-forest-green text-white rounded-lg text-xs font-bold hover:bg-deep-teal cursor-pointer"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
