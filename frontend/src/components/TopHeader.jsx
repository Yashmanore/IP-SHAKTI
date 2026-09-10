import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, UserCircle } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/ask-ip-sakti': 'Ask IP-SAKTI',
  '/product-classification': 'Product Classification',
  '/ip-protection': 'IP Protection',
  '/regulatory-check': 'Regulatory Check',
  '/abs-biodiversity': 'ABS & Biodiversity',
  '/tkdl-prior-art': 'TKDL / Prior Art',
  '/source-explorer': 'Source Explorer',
  '/my-cases': 'My Cases',
  '/expert-escalation': 'Expert Escalation',
  '/settings': 'Settings',
};

const TopHeader = () => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'IP-SAKTI';

  return (
    <header className="bg-white border-b border-border-color h-16 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm z-10">
      <h2 className="text-xl font-heading font-semibold text-charcoal">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-6">
        {/* Jurisdiction Selector */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-slate font-medium">Jurisdiction:</span>
          <button
            aria-label="Select jurisdiction"
            className="flex items-center gap-1 bg-warm-ivory border border-border-color rounded-md px-3 py-1.5 text-charcoal hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/20"
          >
            India <ChevronDown size={14} className="text-slate" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-slate font-medium">Language:</span>
          <button
            aria-label="Select language"
            className="flex items-center gap-1 bg-warm-ivory border border-border-color rounded-md px-3 py-1.5 text-charcoal hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/20"
          >
            English <ChevronDown size={14} className="text-slate" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 border-l border-border-color pl-6">
          <button
            aria-label="User profile"
            className="flex items-center gap-2 text-charcoal hover:text-forest-green transition-colors focus:outline-none rounded-full p-1 focus:ring-2 focus:ring-forest-green/20"
          >
            <UserCircle size={24} className="text-slate" />
            <span className="text-sm font-medium hidden sm:block">User Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
