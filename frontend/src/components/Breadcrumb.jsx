import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable breadcrumb navigation component.
 * @param {Array} items - Array of { label, path } objects.
 *   The last item is treated as the current page (no link).
 */
const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate mb-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 hover:text-forest-green transition-colors"
        aria-label="Go to Dashboard"
      >
        <Home size={14} />
        <span>Dashboard</span>
      </button>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            <ChevronRight size={14} className="text-slate/50 shrink-0" />
            {isLast ? (
              <span className="text-charcoal font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="hover:text-forest-green transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
