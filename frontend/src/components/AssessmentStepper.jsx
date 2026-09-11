import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

export const ASSESSMENT_STEPS = [
  { key: 'ask', label: 'Ask', path: '/ask-ip-sakti' },
  { key: 'classify', label: 'Classify', path: '/product-classification' },
  { key: 'ip', label: 'IP Protection', path: '/ip-protection' },
  { key: 'regulatory', label: 'Regulatory', path: '/regulatory-check' },
  { key: 'abs', label: 'ABS', path: '/abs-biodiversity' },
  { key: 'tkdl', label: 'TKDL', path: '/tkdl-prior-art' },
  { key: 'guidance', label: 'Guidance', path: '/guidance' },
];

/**
 * Reusable 7-step assessment progress stepper.
 * @param {string} activeKey - The key of the active step.
 */
const AssessmentStepper = ({ activeKey }) => {
  const { t } = useTranslation();
  const activeIdx = ASSESSMENT_STEPS.findIndex((s) => s.key === activeKey);

  return (
    <div className="hidden lg:flex items-center gap-1 overflow-x-auto pb-1 mb-8">
      {ASSESSMENT_STEPS.map((step, idx) => {
        const isActive = step.key === activeKey;
        const isPast = idx < activeIdx;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors
                ${isActive
                  ? 'bg-forest-green text-white border-forest-green'
                  : isPast
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-white text-slate border-border-color'
                }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${isActive
                    ? 'bg-white text-forest-green'
                    : isPast
                      ? 'bg-success text-white'
                      : 'bg-border-color text-slate'
                  }`}
              >
                {isPast ? '✓' : idx + 1}
              </span>
              {t(`stepper.${step.key}`, step.label)}
            </div>
            {idx < ASSESSMENT_STEPS.length - 1 && (
              <ChevronRight size={14} className="text-border-color shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default AssessmentStepper;
