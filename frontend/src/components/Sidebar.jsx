import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  MessageSquareQuote, 
  PackageSearch, 
  ShieldCheck, 
  FileCheck2, 
  Leaf, 
  Library, 
  Globe, 
  FolderOpen, 
  Users,
  FileText 
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'landing', path: '/', icon: Globe, labelDefault: 'Portal Overview' },
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'askIpSakti', path: '/ask-ip-sakti', icon: MessageSquareQuote },
  { key: 'productClassification', path: '/product-classification', icon: PackageSearch },
  { key: 'ipProtection', path: '/ip-protection', icon: ShieldCheck },
  { key: 'regulatoryCheck', path: '/regulatory-check', icon: FileCheck2 },
  { key: 'absBiodiversity', path: '/abs-biodiversity', icon: Leaf },
  { key: 'tkdlPriorArt', path: '/tkdl-prior-art', icon: Library },
  { key: 'sourceExplorer', path: '/source-explorer', icon: Globe },
  { key: 'myCases', path: '/my-cases', icon: FolderOpen },
  { key: 'expertEscalation', path: '/expert-escalation', icon: Users },
  { key: 'legalDossier', path: '/legal-dossier', icon: FileText },
];

const Sidebar = () => {
  const { t, i18n } = useTranslation();

  return (
    <aside className="w-64 bg-forest-green text-white flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-warm-ivory tracking-tight leading-tight">
          IP-SAKTI
          <span className="block text-sm font-sans font-medium text-muted-gold mt-1">
            {t('common.sahayak', 'Sahayak')}
          </span>
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-deep-teal text-white shadow-sm'
                    : 'text-slate-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-muted-gold' : 'text-slate-300 opacity-80'}>
                    <Icon size={18} />
                  </span>
                  <span>{t(`nav.${item.key}`, item.labelDefault || item.key)}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
