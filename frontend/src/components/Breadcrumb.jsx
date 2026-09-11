import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_NAV_KEY_MAP = {
  '/': 'nav.dashboard',
  '/ask-ip-sakti': 'nav.askIpSakti',
  '/product-classification': 'nav.productClassification',
  '/ip-protection': 'nav.ipProtection',
  '/regulatory-check': 'nav.regulatoryCheck',
  '/abs-biodiversity': 'nav.absBiodiversity',
  '/tkdl-prior-art': 'nav.tkdlPriorArt',
  '/guidance': 'nav.guidance',
  '/legal-dossier': 'nav.legalDossier',
  '/source-explorer': 'nav.sourceExplorer',
  '/my-cases': 'nav.myCases',
  '/expert-escalation': 'nav.expertEscalation',
  '/settings': 'nav.settings',
};

/**
 * Reusable breadcrumb navigation component.
 * @param {Array} items - Array of { label, labelKey, path } objects.
 *   The last item is treated as the current page (no link).
 */
const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate mb-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 hover:text-forest-green transition-colors"
        aria-label="Go to Dashboard"
      >
        <Home size={14} />
        <span>{t('nav.dashboard', 'Dashboard')}</span>
      </button>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const key = item.labelKey || (item.path ? ROUTE_NAV_KEY_MAP[item.path] : null);
        const text = key ? t(key, item.label) : item.label;
        return (
          <React.Fragment key={item.path || idx}>
            <ChevronRight size={14} className="text-slate/50 shrink-0" />
            {isLast ? (
              <span className="text-charcoal font-medium" aria-current="page">
                {text}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="hover:text-forest-green transition-colors"
              >
                {text}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
