import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, UserCircle, Globe, MapPin } from 'lucide-react';
import { useJurisdiction } from '../context/JurisdictionContext';

const PAGE_TITLE_KEYS = {
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

const PAGE_TITLES_FALLBACK = {
  '/': 'Dashboard',
  '/ask-ip-sakti': 'Ask IP-SAKTI',
  '/product-classification': 'Product Classification',
  '/ip-protection': 'IP Protection',
  '/regulatory-check': 'Regulatory Check',
  '/abs-biodiversity': 'ABS & Biodiversity',
  '/tkdl-prior-art': 'TKDL / Prior Art',
  '/guidance': 'Final Guidance',
  '/legal-dossier': 'Legal Dossier',
  '/source-explorer': 'Source Explorer',
  '/my-cases': 'My Cases',
  '/expert-escalation': 'Expert Escalation',
  '/settings': 'Settings',
};

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

const TopHeader = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { jurisdiction, setJurisdiction, JURISDICTIONS } = useJurisdiction();
  const [langOpen, setLangOpen] = useState(false);
  const [jurisdictionOpen, setJurisdictionOpen] = useState(false);

  const langRef = useRef(null);
  const jurisdictionRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (jurisdictionRef.current && !jurisdictionRef.current.contains(e.target)) {
        setJurisdictionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const titleKey = PAGE_TITLE_KEYS[location.pathname];
  const pageTitle = titleKey ? t(titleKey) : (PAGE_TITLES_FALLBACK[location.pathname] || 'IP-SAKTI');

  const currentLang = LANGUAGES.find((l) => l.code === (i18n.language?.substring(0, 2) || 'en')) || LANGUAGES[0];

  const handleSelectLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const handleSelectJurisdiction = (code) => {
    setJurisdiction(code);
    setJurisdictionOpen(false);
  };

  return (
    <header className="bg-white border-b border-border-color h-16 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm z-10">
      <h2 className="text-xl font-heading font-semibold text-charcoal">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-6">
        {/* Interactive Jurisdiction Selector */}
        <div ref={jurisdictionRef} className="relative flex items-center gap-2 text-sm">
          <span className="text-slate font-medium hidden md:inline">{t('common.jurisdiction', 'Jurisdiction:')}</span>
          <button
            type="button"
            aria-label="Select jurisdiction"
            aria-expanded={jurisdictionOpen}
            onClick={() => {
              setJurisdictionOpen(!jurisdictionOpen);
              setLangOpen(false);
            }}
            className="flex items-center gap-1.5 bg-warm-ivory border border-border-color rounded-md px-3 py-1.5 text-charcoal hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/20 font-medium"
          >
            <MapPin size={14} className="text-forest-green" />
            <span>{jurisdiction === 'INTERNATIONAL' ? t('common.international', 'International') : t('common.india', 'India')}</span>
            <ChevronDown size={14} className={`text-slate transition-transform ${jurisdictionOpen ? 'rotate-180' : ''}`} />
          </button>

          {jurisdictionOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border-color rounded-lg shadow-lg py-1 z-50">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j.code}
                  type="button"
                  onClick={() => handleSelectJurisdiction(j.code)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                    jurisdiction === j.code
                      ? 'bg-forest-green/10 text-forest-green font-bold'
                      : 'text-charcoal hover:bg-warm-ivory'
                  }`}
                >
                  <span>{t(j.labelKey, j.defaultLabel)}</span>
                  {jurisdiction === j.code && <span className="text-forest-green text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Language Selector */}
        <div ref={langRef} className="relative flex items-center gap-2 text-sm">
          <span className="text-slate font-medium hidden md:inline">{t('common.language', 'Language:')}</span>
          <button
            type="button"
            aria-label="Select language"
            aria-expanded={langOpen}
            onClick={() => {
              setLangOpen(!langOpen);
              setJurisdictionOpen(false);
            }}
            className="flex items-center gap-1.5 bg-warm-ivory border border-border-color rounded-md px-3 py-1.5 text-charcoal hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/20 font-medium"
          >
            <Globe size={14} className="text-forest-green" />
            <span>{currentLang.native}</span>
            <ChevronDown size={14} className={`text-slate transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border-color rounded-lg shadow-lg py-1 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                    currentLang.code === lang.code
                      ? 'bg-forest-green/10 text-forest-green font-bold'
                      : 'text-charcoal hover:bg-warm-ivory'
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-slate text-[10px] uppercase">{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 border-l border-border-color pl-6">
          <button
            aria-label="User profile"
            className="flex items-center gap-2 text-charcoal hover:text-forest-green transition-colors focus:outline-none rounded-full p-1 focus:ring-2 focus:ring-forest-green/20"
          >
            <UserCircle size={24} className="text-slate" />
            <span className="text-sm font-medium hidden sm:block">{t('common.userProfile', 'User Profile')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
