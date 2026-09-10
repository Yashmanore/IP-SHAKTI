import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  X,
  AlertCircle,
  Loader2,
  Folder,
  FolderOpen,
  ArrowLeft,
  RefreshCw,
  Globe,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  in_progress:   'bg-warning/10 text-warning border-warning/30',
  completed:     'bg-success/10 text-success border-success/30',
  needs_review:  'bg-muted-gold/10 text-muted-gold border-muted-gold/30',
  expert_review: 'bg-deep-teal/10 text-deep-teal border-deep-teal/20',
};

const STATUS_LABELS = {
  in_progress:   'In Progress',
  completed:     'Completed',
  needs_review:  'Needs Review',
  expert_review: 'Expert Review',
};

const STAGE_ROUTES = {
  'Ask IP-SAKTI':        '/ask-ip-sakti',
  'Product Classification': '/product-classification',
  'IP Protection':       '/ip-protection',
  'Regulatory Check':    '/regulatory-check',
  'ABS & Biodiversity':  '/abs-biodiversity',
  'TKDL / Prior Art':    '/tkdl-prior-art',
  'Final Guidance':      '/guidance',
};

const FILTER_STATUSES = ['All', 'in_progress', 'completed', 'needs_review', 'expert_review'];
const JURISDICTION_OPTIONS = ['All', 'INDIA', 'INTERNATIONAL'];
const JURISDICTION_LABELS = { INDIA: 'India', INTERNATIONAL: 'International' };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function classifyError(err) {
  return err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
    ? 'service_unavailable'
    : err.message || 'Unknown error';
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Skeleton loading row */
const SkeletonRow = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-border-color shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-border-color rounded w-2/5" />
        <div className="h-3 bg-warm-ivory rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-20 bg-warm-ivory rounded-full" />
          <div className="h-5 w-16 bg-warm-ivory rounded-full" />
        </div>
      </div>
      <div className="h-8 w-28 bg-border-color rounded-lg shrink-0" />
    </div>
  </div>
);

/** Status badge */
const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-slate/10 text-slate border-slate/20';
  const label = STATUS_LABELS[status] || status || 'Unknown';
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${style}`}>
      {label}
    </span>
  );
};

/** Jurisdiction badge */
const JurBadge = ({ jurisdiction }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border
    ${jurisdiction === 'INDIA'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : jurisdiction === 'INTERNATIONAL'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-warm-ivory text-slate border-border-color'
    }`}>
    {jurisdiction === 'INDIA' ? <MapPin size={10} /> : <Globe size={10} />}
    {JURISDICTION_LABELS[jurisdiction] || jurisdiction || 'Unknown'}
  </span>
);

/** Individual case card */
const CaseCard = ({ caseItem, onOpen }) => {
  const updatedLabel = formatDate(caseItem.lastUpdated || caseItem.updatedAt);
  const createdLabel = formatDate(caseItem.createdAt);

  return (
    <div className="card p-5 hover:border-forest-green/30 hover:shadow-md transition-all duration-150">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-forest-green/5 border border-forest-green/15 flex items-center justify-center text-forest-green shrink-0">
          <Folder size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-charcoal truncate mb-1">
            {caseItem.productName || caseItem.name || `Assessment ${caseItem.id}`}
          </h3>

          {caseItem.classificationDisplayName && (
            <p className="text-xs text-slate mb-2 truncate">{caseItem.classificationDisplayName}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {caseItem.jurisdiction && <JurBadge jurisdiction={caseItem.jurisdiction} />}
            {caseItem.status && <StatusBadge status={caseItem.status} />}
            {caseItem.currentStage && (
              <span className="text-xs text-slate bg-warm-ivory border border-border-color px-2 py-0.5 rounded-full">
                Stage: {caseItem.currentStage}
              </span>
            )}
          </div>

          {(updatedLabel || createdLabel) && (
            <p className="text-xs text-slate/70 mt-2 flex items-center gap-1">
              <Clock size={10} />
              {updatedLabel ? `Updated ${updatedLabel}` : `Created ${createdLabel}`}
            </p>
          )}

          {caseItem.id && (
            <p className="text-xs text-slate/50 mt-1 font-mono">ID: {caseItem.id}</p>
          )}
        </div>

        {/* Action */}
        <div className="shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => onOpen(caseItem)}
            aria-label={`Open assessment: ${caseItem.productName || caseItem.id}`}
            className="flex items-center gap-2 bg-forest-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-deep-teal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 whitespace-nowrap"
          >
            Open <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/** Case detail side panel */
const CaseDetailPanel = ({ caseItem, onClose, onOpen }) => {
  if (!caseItem) return null;
  const updatedLabel = formatDate(caseItem.lastUpdated || caseItem.updatedAt);
  const createdLabel = formatDate(caseItem.createdAt);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Assessment details`} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl border border-border-color max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border-color px-6 py-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest-green/5 border border-forest-green/15 flex items-center justify-center text-forest-green shrink-0">
              <FolderOpen size={16} />
            </div>
            <div>
              <h2 className="text-base font-heading font-semibold text-charcoal leading-snug">
                {caseItem.productName || caseItem.name || `Assessment ${caseItem.id}`}
              </h2>
              {caseItem.id && <p className="text-xs text-slate/60 font-mono">ID: {caseItem.id}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-full p-1 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <dl className="divide-y divide-border-color">
            {caseItem.classificationDisplayName && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Classification</dt>
                <dd className="text-sm text-charcoal">{caseItem.classificationDisplayName}</dd>
              </div>
            )}
            {caseItem.jurisdiction && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Jurisdiction</dt>
                <dd><JurBadge jurisdiction={caseItem.jurisdiction} /></dd>
              </div>
            )}
            {caseItem.status && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Status</dt>
                <dd><StatusBadge status={caseItem.status} /></dd>
              </div>
            )}
            {caseItem.currentStage && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Current Stage</dt>
                <dd className="text-sm text-charcoal">{caseItem.currentStage}</dd>
              </div>
            )}
            {updatedLabel && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Last Updated</dt>
                <dd className="text-sm text-charcoal">{updatedLabel}</dd>
              </div>
            )}
            {createdLabel && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Created</dt>
                <dd className="text-sm text-charcoal">{createdLabel}</dd>
              </div>
            )}
          </dl>

          {/* Guidance availability */}
          <div className="p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
            <p className="font-medium text-charcoal mb-1">Final Guidance</p>
            {caseItem.guidanceAvailable
              ? <p className="text-success text-xs">Guidance is available for this assessment.</p>
              : <p className="text-slate text-xs italic">Final guidance is not available yet.</p>
            }
          </div>

          {/* Source records */}
          <div className="p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
            <p className="font-medium text-charcoal mb-1">Sources</p>
            {caseItem.sourceCount > 0
              ? <p className="text-success text-xs">{caseItem.sourceCount} source record(s) available.</p>
              : <p className="text-slate text-xs italic">No source records are currently associated.</p>
            }
          </div>

          {/* Expert review */}
          {caseItem.expertReviewStatus && (
            <div className="p-4 bg-warm-ivory border border-border-color rounded-lg text-sm">
              <p className="font-medium text-charcoal mb-1">Expert Review</p>
              <StatusBadge status={caseItem.expertReviewStatus} />
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-slate border-t border-border-color pt-4 leading-relaxed">
            Saved assessment information is source-grounded guidance and does not constitute legal advice or regulatory approval.
          </p>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-border-color px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={() => { onClose(); onOpen(caseItem); }}
            className="flex-1 flex items-center justify-center gap-2 bg-forest-green text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-deep-teal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
          >
            <FolderOpen size={15} /> Open Assessment
          </button>
          {caseItem.guidanceAvailable && (
            <button
              type="button"
              className="flex items-center gap-2 border border-forest-green/40 text-forest-green text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              View Guidance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
const MyCases = () => {
  const navigate = useNavigate();

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Data — no backend cases endpoint exists; correct empty state shown
  const [cases] = useState(null);       // null = not yet loaded / not connected
  const [loading] = useState(false);
  const [error] = useState(null);

  // Detail panel
  const [selectedCase, setSelectedCase] = useState(null);

  const searchRef = useRef(null);

  /** Open a saved case: navigate to the correct stage route carrying its session state */
  const handleOpen = (caseItem) => {
    const route = caseItem.currentStage
      ? (STAGE_ROUTES[caseItem.currentStage] || '/ask-ip-sakti')
      : '/ask-ip-sakti';
    navigate(route, { state: caseItem.assessmentState || null });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setJurisdictionFilter('All');
  };

  // Client-side filtering (will be used once a backend endpoint exists)
  const filtered = (cases || []).filter((c) => {
    const matchSearch = !searchQuery || [c.productName, c.name, c.id]
      .some((v) => v?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchJur = jurisdictionFilter === 'All' || c.jurisdiction === jurisdictionFilter;
    return matchSearch && matchStatus && matchJur;
  });

  const hasActiveFilters = statusFilter !== 'All' || jurisdictionFilter !== 'All' || !!searchQuery;

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb items={[{ label: 'My Cases', path: '/my-cases' }]} />

      {/* Page title + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">My Cases</h1>
          <p className="text-slate text-base leading-relaxed">
            View and continue assessments saved in IP-SAKTI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/ask-ip-sakti')}
          aria-label="Start a new assessment"
          className="flex items-center gap-2 bg-forest-green text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50 shrink-0 self-start"
        >
          <Plus size={16} /> New Assessment
        </button>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
      <div className="mb-5">
        <label htmlFor="case-search" className="block text-sm font-medium text-charcoal mb-2">
          Search Cases
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
            <input
              id="case-search"
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product or assessment"
              className="w-full rounded-lg border border-border-color pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 shadow-sm transition-shadow"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors focus:outline-none">
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="button"
            disabled
            className="flex items-center gap-2 bg-forest-green text-white px-5 py-3 rounded-lg text-sm font-medium shadow-sm opacity-50 cursor-not-allowed focus:outline-none shrink-0"
            title="Search will be available when the cases backend is connected"
          >
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex items-center gap-2 text-sm font-medium text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-lg px-3 py-2 border border-border-color bg-white"
        >
          <SlidersHorizontal size={15} /> Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-forest-green" aria-label="Filters active" />}
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-warm-ivory border border-border-color rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {FILTER_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    aria-pressed={statusFilter === s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50
                      ${statusFilter === s
                        ? 'bg-forest-green text-white border-forest-green'
                        : 'bg-white text-charcoal border-border-color hover:border-deep-teal'
                      }`}
                  >
                    {s === 'All' ? 'All' : STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Jurisdiction */}
            <div>
              <p className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Jurisdiction</p>
              <div className="flex flex-wrap gap-2">
                {JURISDICTION_OPTIONS.map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setJurisdictionFilter(j)}
                    aria-pressed={jurisdictionFilter === j}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50
                      ${jurisdictionFilter === j
                        ? 'bg-forest-green text-white border-forest-green'
                        : 'bg-white text-charcoal border-border-color hover:border-deep-teal'
                      }`}
                  >
                    {j === 'All' ? 'All' : JURISDICTION_LABELS[j]}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-medium text-forest-green hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── RESULTS AREA ────────────────────────────────────────────── */}
      <section aria-label="Saved assessments">
        <h2 className="text-xl font-heading font-semibold text-charcoal mb-5">Saved Assessments</h2>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <p className="text-sm text-slate flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Loading saved assessments…
            </p>
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-error/30 rounded-xl text-sm">
            <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-charcoal mb-1">Saved assessments could not be loaded.</p>
              <p className="text-slate">{error}</p>
            </div>
            <button type="button" className="text-sm font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none">
              <RefreshCw size={14} className="inline mr-1" />Retry
            </button>
          </div>
        )}

        {/* No cases backend — empty state */}
        {!loading && !error && cases === null && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-warm-ivory flex items-center justify-center mb-4 border border-border-color">
              <Folder size={28} className="text-muted-gold" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-charcoal mb-2">
              No saved assessments yet
            </h3>
            <p className="text-sm text-slate max-w-sm leading-relaxed mb-6">
              Your saved assessments will appear here once you save an assessment. Assessment persistence will be available when the cases backend is connected.
            </p>
            <button
              type="button"
              onClick={() => navigate('/ask-ip-sakti')}
              className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              <Plus size={16} /> Start New Assessment
            </button>
          </div>
        )}

        {/* Cases loaded but empty array */}
        {!loading && !error && cases !== null && cases.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Folder size={28} className="text-muted-gold mb-3" />
            <p className="text-base font-semibold text-charcoal mb-1">No saved assessments yet</p>
            <p className="text-sm text-slate mb-5">Your saved assessments will appear here once you save one.</p>
            <button
              type="button"
              onClick={() => navigate('/ask-ip-sakti')}
              className="flex items-center gap-2 bg-forest-green text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              <Plus size={16} /> Start New Assessment
            </button>
          </div>
        )}

        {/* Cases present but filters/search yield nothing */}
        {!loading && !error && cases !== null && cases.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Filter size={24} className="text-slate mb-3" />
            <p className="text-base font-semibold text-charcoal mb-1">
              {searchQuery
                ? 'No assessments matched your search.'
                : 'No assessments match the selected filters.'}
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-3 text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              {searchQuery ? 'Clear Search' : 'Clear Filters'}
            </button>
          </div>
        )}

        {/* Case cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((c) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </section>

      {/* Back to Dashboard */}
      <div className="mt-12 pt-6 border-t border-border-color">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Back to Dashboard"
          className="flex items-center gap-2 text-sm font-medium text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-lg"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Case detail panel */}
      {selectedCase && (
        <CaseDetailPanel
          caseItem={selectedCase}
          onClose={() => setSelectedCase(null)}
          onOpen={handleOpen}
        />
      )}
    </div>
  );
};

export default MyCases;
