import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Leaf,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Search,
  FlaskConical,
  BookOpen,
  Info,
  Layers,
} from 'lucide-react';
import { classifyProduct } from '../services/api';

const PRESET_FORMULATIONS = [
  {
    id: 'nirogam-vati',
    name: 'Nirogam Vati (Anti-Inflammatory Herbal Complex)',
    ingredients: ['Curcuma longa (Haridra)', 'Zingiber officinale (Shunthi)', 'Piper nigrum (Maricha)'],
    intendedUse: 'THERAPEUTIC_TREATMENT',
    claimedIndication: 'Joint mobility support and chronic systemic inflammation management',
    matchesScheduleIBook: true,
    scheduleIBookName: 'Siddha Yoga Sangraha',
    formulaOrRatioModified: false,
    newIndicationOrDosageRoute: false,
    purifiedPhytochemicalExtract: false,
    synergisticDataAvailable: false,
    applicantType: 'INDIAN_COMPANY',
    commercialUtilization: true,
  },
  {
    id: 'kutaki-kalmegh',
    name: 'Kutaki-Kalmegh Hepatoprotective Synergistic Extract',
    ingredients: ['Picrorhiza kurroa (Kutaki rhizome)', 'Andrographis paniculata (Kalmegh whole plant)'],
    intendedUse: 'THERAPEUTIC_TREATMENT',
    claimedIndication: 'Synergistic hepatoprotection against chemical and viral hepatic injury',
    matchesScheduleIBook: true,
    scheduleIBookName: 'Bhavaprakasha Nighantu',
    formulaOrRatioModified: true,
    newIndicationOrDosageRoute: false,
    purifiedPhytochemicalExtract: false,
    synergisticDataAvailable: true,
    applicantType: 'INDIAN_COMPANY',
    commercialUtilization: true,
  },
  {
    id: 'classical-triphala',
    name: 'Classical Triphala Churna (First Schedule)',
    ingredients: ['Emblica officinalis (Amalaki)', 'Terminalia chebula (Haritaki)', 'Terminalia bellirica (Bibhitaki)'],
    intendedUse: 'THERAPEUTIC_TREATMENT',
    claimedIndication: 'Deepana, Pachana, Rasayana, mild bowel regulation',
    matchesScheduleIBook: true,
    scheduleIBookName: 'Charaka Samhita (Chikitsa Sthana)',
    formulaOrRatioModified: false,
    newIndicationOrDosageRoute: false,
    purifiedPhytochemicalExtract: false,
    synergisticDataAvailable: false,
    applicantType: 'INDIAN_INDIVIDUAL',
    commercialUtilization: true,
  },
  {
    id: 'nano-curcumin',
    name: 'Phytopharmaceutical Nano-Curcuminoid Complex',
    ingredients: ['Purified Curcuminoids (95%)', 'Phospholipid-based lipid carrier', 'Bio-enhancing Piperine (98%)'],
    intendedUse: 'THERAPEUTIC_TREATMENT',
    claimedIndication: 'Targeted bioavailability-enhanced adjuvant therapeutic agent',
    matchesScheduleIBook: false,
    scheduleIBookName: null,
    formulaOrRatioModified: true,
    newIndicationOrDosageRoute: true,
    purifiedPhytochemicalExtract: true,
    synergisticDataAvailable: true,
    applicantType: 'INDIAN_COMPANY',
    commercialUtilization: true,
  },
];

export default function ActiveAssessmentBar({
  currentAssessment,
  onAssessmentChange,
  stepTitle = 'Assessment Context',
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(!currentAssessment?.classificationResult);
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customCategory, setCustomCategory] = useState('THERAPEUTIC_TREATMENT');
  const [customSynergy, setCustomSynergy] = useState(false);
  const [customExtract, setCustomExtract] = useState(false);
  const [customApplicant, setCustomApplicant] = useState('INDIAN_COMPANY');

  const cr = currentAssessment?.classificationResult;
  const prodName = currentAssessment?.productName || 'Active Formulation';
  const ingredientsList = currentAssessment?.botanicalIngredients || 
    (currentAssessment?.ingredients ? (Array.isArray(currentAssessment.ingredients) ? currentAssessment.ingredients : currentAssessment.ingredients.split(',').map(s => s.trim())) : []);

  const handleApplyPreset = async (preset) => {
    setLoading(true);
    try {
      const req = {
        productName: preset.name,
        botanicalIngredients: preset.ingredients,
        matchesScheduleIBook: preset.matchesScheduleIBook,
        scheduleIBookName: preset.scheduleIBookName,
        formulaOrRatioModified: preset.formulaOrRatioModified,
        intendedUse: preset.intendedUse,
        claimedIndication: preset.claimedIndication,
        newIndicationOrDosageRoute: preset.newIndicationOrDosageRoute,
        purifiedPhytochemicalExtract: preset.purifiedPhytochemicalExtract,
        synergisticDataAvailable: preset.synergisticDataAvailable,
        applicantType: preset.applicantType,
        commercialUtilization: preset.commercialUtilization,
      };

      const result = await classifyProduct(req);
      const newAssessment = {
        productName: preset.name,
        botanicalIngredients: preset.ingredients,
        ingredients: preset.ingredients.join(', '),
        intendedUse: preset.intendedUse,
        applicantType: preset.applicantType,
        commercialUtilization: preset.commercialUtilization,
        jurisdiction: 'INDIA',
        classificationResult: result,
      };

      try {
        sessionStorage.setItem('ip_shakti_active_assessment', JSON.stringify(newAssessment));
      } catch (err) {}

      if (onAssessmentChange) {
        onAssessmentChange(newAssessment);
      }
      setIsOpen(false);
    } catch (err) {
      console.error('Error applying preset formulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customName.trim() || !customIngredients.trim()) return;

    setLoading(true);
    try {
      const ingList = customIngredients.split(',').map((s) => s.trim()).filter(Boolean);
      const req = {
        productName: customName.trim(),
        botanicalIngredients: ingList,
        matchesScheduleIBook: !customExtract,
        scheduleIBookName: customExtract ? null : 'Ayurvedic Pharmacopoeia of India (API)',
        formulaOrRatioModified: customSynergy || customExtract,
        intendedUse: customCategory,
        claimedIndication: 'Therapeutic and healthcare application',
        newIndicationOrDosageRoute: customExtract,
        purifiedPhytochemicalExtract: customExtract,
        synergisticDataAvailable: customSynergy,
        applicantType: customApplicant,
        commercialUtilization: true,
      };

      const result = await classifyProduct(req);
      const newAssessment = {
        productName: customName.trim(),
        botanicalIngredients: ingList,
        ingredients: customIngredients.trim(),
        intendedUse: customCategory,
        applicantType: customApplicant,
        commercialUtilization: true,
        jurisdiction: 'INDIA',
        classificationResult: result,
      };

      try {
        sessionStorage.setItem('ip_shakti_active_assessment', JSON.stringify(newAssessment));
      } catch (err) {}

      if (onAssessmentChange) {
        onAssessmentChange(newAssessment);
      }
      setIsOpen(false);
    } catch (err) {
      console.error('Error evaluating custom formulation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-forest-green/20 bg-forest-green/5 shadow-xs transition-all">
      {/* Active context summary header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-green/10 flex items-center justify-center text-forest-green shrink-0">
            <FlaskConical size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-forest-green uppercase tracking-wide">
                {stepTitle}
              </span>
              {cr && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-forest-green text-white font-medium">
                  <CheckCircle2 size={11} /> {cr.categoryDisplayName || 'Assessed'}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-charcoal leading-snug">
              {cr ? prodName : 'No Formulation Selected — Choose a Preset or Enter Custom'}
            </h3>
            {ingredientsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ingredientsList.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-white border border-border-color text-charcoal/80"
                  >
                    <Leaf size={10} className="mr-1 text-forest-green" />
                    {ing}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-forest-green hover:text-deep-teal bg-white border border-forest-green/30 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-forest-green/5 transition-all"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            {isOpen ? 'Close Evaluator' : cr ? 'Change / Re-evaluate Formulation' : 'Open Formulation Evaluator'}
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandable evaluation drawer */}
      {isOpen && (
        <div className="p-5 border-t border-forest-green/15 bg-white/90 backdrop-blur-xs rounded-b-xl space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-muted-gold" />
                Select a Standard Test Formulation (Instant Assessment)
              </span>
              <span className="text-xs text-slate">One-click statutory evaluation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_FORMULATIONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-3 rounded-lg border border-border-color bg-warm-ivory/40 hover:border-forest-green hover:bg-forest-green/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-charcoal group-hover:text-forest-green">
                      {preset.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate/10 text-slate">
                      {preset.purifiedPhytochemicalExtract
                        ? 'Phytopharmaceutical'
                        : preset.formulaOrRatioModified
                        ? 'Proprietary Cat B'
                        : preset.matchesScheduleIBook
                        ? 'Classical / Cat A'
                        : 'Ayush Medicine'}
                    </span>
                  </div>
                  <p className="text-xs text-slate truncate">
                    {preset.ingredients.join(' • ')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom formulation input */}
          <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-border-color">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-forest-green" />
                Or Evaluate Any Custom Herbal Product
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate mb-1">
                  Product / Formulation Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., AyurShakti Joint Care Liquid"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border-color bg-white focus:outline-none focus:ring-1 focus:ring-forest-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">
                  Active Botanical Ingredients (Comma separated)
                </label>
                <input
                  type="text"
                  value={customIngredients}
                  onChange={(e) => setCustomIngredients(e.target.value)}
                  placeholder="e.g., Withania somnifera, Boswellia serrata, Guggulu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border-color bg-white focus:outline-none focus:ring-1 focus:ring-forest-green"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customSynergy}
                    onChange={(e) => setCustomSynergy(e.target.checked)}
                    className="accent-forest-green rounded"
                  />
                  <span>Experimental Synergy Data Available (§3(e))</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customExtract}
                    onChange={(e) => setCustomExtract(e.target.checked)}
                    className="accent-forest-green rounded"
                  />
                  <span>Standardized / Purified Bioactive Extract</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !customName.trim() || !customIngredients.trim()}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-forest-green hover:bg-deep-teal px-4 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Evaluating...' : 'Run Real-Time Statutory Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
