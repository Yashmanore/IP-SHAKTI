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

const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    { name: t('nav.dashboard'), path: '/', icon: <LayoutDashboard size={18} /> },
    { name: t('nav.askIpSakti'), path: '/ask-ip-sakti', icon: <MessageSquareQuote size={18} /> },
    { name: t('nav.productClassification'), path: '/product-classification', icon: <PackageSearch size={18} /> },
    { name: t('nav.ipProtection'), path: '/ip-protection', icon: <ShieldCheck size={18} /> },
    { name: t('nav.regulatoryCheck'), path: '/regulatory-check', icon: <FileCheck2 size={18} /> },
    { name: t('nav.absBiodiversity'), path: '/abs-biodiversity', icon: <Leaf size={18} /> },
    { name: t('nav.tkdlPriorArt'), path: '/tkdl-prior-art', icon: <Library size={18} /> },
    { name: t('nav.sourceExplorer'), path: '/source-explorer', icon: <Globe size={18} /> },
    { name: t('nav.myCases'), path: '/my-cases', icon: <FolderOpen size={18} /> },
    { name: t('nav.expertEscalation'), path: '/expert-escalation', icon: <Users size={18} /> },
    { name: t('nav.legalDossier'), path: '/legal-dossier', icon: <FileText size={18} /> },
  ];

  return (
    <aside className="w-64 bg-forest-green text-white flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-warm-ivory tracking-tight leading-tight">
          IP-SAKTI
          <span className="block text-sm font-sans font-medium text-muted-gold mt-1">Sahayak</span>
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {navItems.map((item) => (
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
                  {item.icon}
                </span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
