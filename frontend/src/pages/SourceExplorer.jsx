import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  AlertCircle,
  Loader2,
  BookOpen,
  ExternalLink,
  Globe,
  MapPin,
  SlidersHorizontal,
  RefreshCw,
  ChevronDown,
  FileText,
  Filter,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ─────────────────────────────────────────────────────────────────────────────
// Constants — structural only, not fake data
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'ip', label: 'IP' },
  { key: 'regulatory', label: 'Regulatory' },
  { key: 'biodiversity', label: 'Biodiversity' },
  { key: 'abs', label: 'ABS' },
  { key: 'traditional_knowledge', label: 'Traditional Knowledge' },
  { key: 'international', label: 'International' },
];

// Category → search query mapping (used when a category tab is clicked)
const CATEGORY_QUERIES = {
  all: 'intellectual property ayurveda regulatory biodiversity',
  ip: 'intellectual property patent trademark geographical indication design',
  regulatory: 'regulatory ayurveda drugs cosmetics licensing',
  biodiversity: 'biological diversity biodiversity conservation',
  abs: 'access benefit sharing traditional knowledge biological resources',
  traditional_knowledge: 'traditional knowledge TKDL classical ayurveda texts',
  international: 'international treaties TRIPS CBD nagoya convention',
};

const JURISDICTION_OPTIONS = ['All', 'INDIA', 'INTERNATIONAL'];

const SOURCE_TYPE_OPTIONS = [
  'All',
  'STATUTE',
  'RULE',
  'REGULATION',
  'TREATY',
  'STATUTORY_FORM',
];

const SOURCE_TYPE_LABELS = {
  STATUTE: 'Statute',
  RULE: 'Rule',
  REGULATION: 'Regulation',
  TREATY: 'Treaty',
  STATUTORY_FORM: 'Statutory Form',
};

const JURISDICTION_LABELS = {
  INDIA: 'India',
  INTERNATIONAL: 'International',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function classifyError(err) {
  return err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
    ? 'service_unavailable'
    : err.message || 'Unknown error';
}

/** Derive a display title from a RAG result's metadata */
function deriveTitle(result) {
  const meta = result.metadata || {};
  return meta.title || meta.file_name?.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') || 'Untitled Source';
}

/** Derive source type label */
function deriveTypeLabel(result) {
  const meta = result.metadata || {};
  const raw = meta.authority_type || meta.source_type || '';
  return SOURCE_TYPE_LABELS[raw] || raw || 'Source';
}

/** Derive jurisdiction label */
function deriveJurisdiction(result) {
  const j = result.metadata?.jurisdiction || '';
  return JURISDICTION_LABELS[j] || j || 'Unknown';
}

/** Source type badge color */
function typeBadgeStyle(result) {
  const t = result.metadata?.authority_type;
  switch (t) {
    case 'STATUTE': return 'bg-forest-green/10 text-forest-green border-forest-green/20';
    case 'RULE': return 'bg-deep-teal/10 text-deep-teal border-deep-teal/20';
    case 'REGULATION': return 'bg-muted-gold/10 text-muted-gold border-muted-gold/30';
    case 'TREATY': return 'bg-success/10 text-success border-success/30';
    case 'STATUTORY_FORM': return 'bg-slate/10 text-slate border-slate/20';
    default: return 'bg-warm-ivory text-slate border-border-color';
  }
}

/** Jurisdiction badge color */
function jurisdictionBadgeStyle(result) {
  return result.metadata?.jurisdiction === 'INDIA'
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Skeleton card while loading */
const SkeletonCard = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-16 h-5 bg-border-color rounded-full" />
      <div className="w-12 h-5 bg-border-color rounded-full" />
    </div>
    <div className="mt-3 h-4 bg-border-color rounded w-3/4" />
    <div className="mt-2 h-3 bg-border-color rounded w-1/2" />
    <div className="mt-3 space-y-1.5">
      <div className="h-3 bg-warm-ivory rounded w-full" />
      <div className="h-3 bg-warm-ivory rounded w-5/6" />
      <div className="h-3 bg-warm-ivory rounded w-4/6" />
    </div>
  </div>
);

/** Individual source card in the list */
const SourceCard = ({ result, onClick }) => {
  const title = deriveTitle(result);
  const typeLabel = deriveTypeLabel(result);
  const jurisdiction = deriveJurisdiction(result);
  const score = typeof result.score === 'number' ? result.score.toFixed(3) : null;
  const meta = result.metadata || {};
  const hasUrl = !!(meta.url || meta.sourceUrl);

  return (
    <button
      type="button"
      onClick={() => onClick(result)}
      aria-label={`View details for ${title}`}
      className="card p-5 text-left w-full hover:border-forest-green/40 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-green/50 group"
    >
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${typeBadgeStyle(result)}`}>
          {typeLabel}
        </span>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${jurisdictionBadgeStyle(result)}`}>
          {result.metadata?.jurisdiction === 'INDIA'
            ? <MapPin size={10} />
            : <Globe size={10} />
          }
          {jurisdiction}
        </span>
        {score && (
          <span className="ml-auto text-xs text-slate bg-warm-ivory border border-border-color px-2 py-0.5 rounded-full font-mono">
            {score}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-charcoal group-hover:text-forest-green transition-colors mb-1 leading-snug">
        {title}
      </h3>

      {/* File name if different from title */}
      {meta.file_name && (
        <p className="text-xs text-slate mb-2 font-mono">{meta.file_name}</p>
      )}

      {/* Text excerpt */}
      <p className="text-xs text-slate leading-relaxed line-clamp-3">{result.text}</p>

      {/* Open source indicator */}
      {hasUrl && (
        <p className="text-xs text-forest-green mt-2 flex items-center gap-1">
          <ExternalLink size={11} /> View original source
        </p>
      )}
    </button>
  );
};

/** Source detail modal/drawer */
const SourceDetailPanel = ({ result, onClose }) => {
  if (!result) return null;
  const title = deriveTitle(result);
  const typeLabel = deriveTypeLabel(result);
  const jurisdiction = deriveJurisdiction(result);
  const meta = result.metadata || {};
  const sourceUrl = meta.url || meta.sourceUrl || null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Source details: ${title}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-xl border border-border-color max-w-lg w-full max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border-color px-6 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-1.5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${typeBadgeStyle(result)}`}>
                {typeLabel}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${jurisdictionBadgeStyle(result)}`}>
                {jurisdiction}
              </span>
            </div>
            <h2 className="text-base font-heading font-semibold text-charcoal leading-snug">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close source detail"
            className="text-slate hover:text-charcoal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded-full p-1 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Metadata fields */}
          <dl className="divide-y divide-border-color">
            {meta.authority_type && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Source Type</dt>
                <dd className="text-sm text-charcoal">{typeLabel}</dd>
              </div>
            )}
            <div className="py-3">
              <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Jurisdiction</dt>
              <dd className="text-sm text-charcoal">{jurisdiction}</dd>
            </div>
            {meta.file_name && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">File / Identifier</dt>
                <dd className="text-sm text-charcoal font-mono">{meta.file_name}</dd>
              </div>
            )}
            {typeof result.score === 'number' && (
              <div className="py-3">
                <dt className="text-xs font-semibold text-slate uppercase tracking-wide mb-1">Relevance Score</dt>
                <dd className="text-sm text-charcoal font-mono">{result.score.toFixed(4)}</dd>
              </div>
            )}
          </dl>

          {/* Text content */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal mb-2">Relevant Extract</h3>
            <p className="text-sm text-slate leading-relaxed bg-warm-ivory p-3 rounded-lg border border-border-color whitespace-pre-wrap">
              {result.text}
            </p>
          </div>

          {/* Relevance to IP-SAKTI */}
          <div className="p-3 bg-forest-green/5 border border-forest-green/20 rounded-lg text-sm text-slate leading-relaxed">
            <p className="font-medium text-forest-green text-xs uppercase tracking-wide mb-1">Relevance to IP-SAKTI</p>
            This source record was returned by the IP-SAKTI source repository based on its semantic relevance to the search query. Source records support guidance provided by the system.
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate border-t border-border-color pt-4 leading-relaxed">
            This source record is provided for information and reference. It does not constitute legal advice.
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border-color px-6 py-4">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-forest-green text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50 w-fit"
            >
              <ExternalLink size={15} /> Open Original Source
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 bg-border-color text-slate px-5 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
              aria-disabled="true"
            >
              <ExternalLink size={15} /> Original source link unavailable
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
const SourceExplorer = () => {
  const navigate = useNavigate();

  // ── Search & filter state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // ── Data state ──
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // ── Detail panel ──
  const [selectedResult, setSelectedResult] = useState(null);

  const searchInputRef = useRef(null);

  // Compute which jurisdiction param to pass to the RAG API
  const getJurisdictionParam = () => {
    if (jurisdictionFilter === 'INDIA') return 'INDIA';
    if (jurisdictionFilter === 'INTERNATIONAL') return 'INTERNATIONAL';
    return 'INDIA'; // RAG requires a single jurisdiction — default to INDIA; we run both when "All" is selected
  };

  // Run the RAG search with a given query + jurisdiction
  const runRagSearch = useCallback(async (query, jurisdiction) => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/rag/search?query=${encodeURIComponent(query)}&jurisdiction=${jurisdiction}&maxResults=10&minScore=0.55`
    );
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
  }, []);

  const executeSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setHasSearched(true);

    try {
      let data;
      if (jurisdictionFilter === 'All') {
        // Run both jurisdictions and merge, deduplicating by text
        const [india, international] = await Promise.all([
          runRagSearch(query, 'INDIA'),
          runRagSearch(query, 'INTERNATIONAL'),
        ]);
        const seen = new Set();
        data = [...india, ...international].filter((r) => {
          const key = r.text?.slice(0, 80);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        // Sort by score descending
        data.sort((a, b) => (b.score || 0) - (a.score || 0));
      } else {
        data = await runRagSearch(query, getJurisdictionParam());
      }

      // Apply source type filter on the frontend (RAG has no type filter param)
      const filtered = sourceTypeFilter === 'All'
        ? data
        : data.filter((r) => r.metadata?.authority_type === sourceTypeFilter);

      setResults(filtered);
    } catch (err) {
      setError(classifyError(err));
    } finally {
      setLoading(false);
    }
  }, [jurisdictionFilter, sourceTypeFilter, runRagSearch]);

  // Category tab click — use category query
  const handleCategoryClick = (catKey) => {
    setActiveCategory(catKey);
    const q = CATEGORY_QUERIES[catKey] || catKey;
    setSearchQuery(q);
    executeSearch(q);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    executeSearch(searchQuery);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setJurisdictionFilter('All');
    setSourceTypeFilter('All');
    setResults(null);
    setHasSearched(false);
    setError(null);
    searchInputRef.current?.focus();
  };

  // Close detail on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedResult(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Count results per jurisdiction for display
  const indiaCount = results?.filter((r) => r.metadata?.jurisdiction === 'INDIA').length || 0;
  const intlCount = results?.filter((r) => r.metadata?.jurisdiction === 'INTERNATIONAL').length || 0;

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <Breadcrumb items={[{ label: 'Source Explorer', path: '/source-explorer' }]} />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-forest-green mb-2">Source Explorer</h1>
        <p className="text-slate text-base leading-relaxed">
          Explore the authoritative sources behind IP-SAKTI guidance.
        </p>
      </div>

      {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="source-search" className="block text-sm font-medium text-charcoal mb-2">
          Search Sources
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
            <input
              id="source-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search authoritative sources by keyword or topic"
              className="w-full rounded-lg border border-border-color pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-slate/50 bg-white focus:outline-none focus:ring-2 focus:ring-forest-green/40 shadow-sm transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal transition-colors focus:outline-none"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            aria-label="Search sources"
            className="flex items-center gap-2 bg-forest-green text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-deep-teal transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest-green/50 shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </div>
      </form>

      {/* ── CATEGORY TABS ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-border-color">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => handleCategoryClick(cat.key)}
            aria-current={activeCategory === cat.key ? 'true' : undefined}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50
              ${activeCategory === cat.key
                ? 'bg-forest-green text-white'
                : 'text-slate hover:text-charcoal hover:bg-warm-ivory'
              }`}
          >
            {cat.label}
          </button>
        ))}
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
          {(jurisdictionFilter !== 'All' || sourceTypeFilter !== 'All') && (
            <span className="w-2 h-2 rounded-full bg-forest-green ml-1" aria-label="Filters active" />
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-3 p-4 bg-warm-ivory border border-border-color rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Jurisdiction */}
            <div>
              <label htmlFor="filter-jurisdiction" className="block text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                Jurisdiction
              </label>
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

            {/* Source Type */}
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                Source Type
              </label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSourceTypeFilter(t)}
                    aria-pressed={sourceTypeFilter === t}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50
                      ${sourceTypeFilter === t
                        ? 'bg-forest-green text-white border-forest-green'
                        : 'bg-white text-charcoal border-border-color hover:border-deep-teal'
                      }`}
                  >
                    {t === 'All' ? 'All' : (SOURCE_TYPE_LABELS[t] || t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-medium text-forest-green hover:underline focus:outline-none focus:ring-2 focus:ring-forest-green/50 rounded"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RESULTS AREA ────────────────────────────────────────────── */}
      <section aria-label="Source results">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-charcoal">Sources</h2>
          {results && (
            <div className="flex items-center gap-3 text-xs text-slate">
              {jurisdictionFilter === 'All' && (
                <>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-orange-600" /> India: {indiaCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={11} className="text-blue-600" /> International: {intlCount}
                  </span>
                </>
              )}
              <span>{results.length} record{results.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <p className="text-sm text-slate flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> Loading authoritative sources…
            </p>
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Service unavailable */}
        {!loading && error === 'service_unavailable' && (
          <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-charcoal mb-1">Authoritative sources could not be loaded.</p>
              <p className="text-slate">The source repository service is not reachable. Source records will appear when the backend is running.</p>
            </div>
            <button
              type="button"
              onClick={() => executeSearch(searchQuery || CATEGORY_QUERIES[activeCategory])}
              disabled={!searchQuery.trim() && activeCategory === 'all'}
              className="text-sm font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none disabled:opacity-40"
            >
              <RefreshCw size={14} className="inline mr-1" />Retry
            </button>
          </div>
        )}

        {/* Other error */}
        {!loading && error && error !== 'service_unavailable' && (
          <div className="flex items-start gap-3 p-5 bg-red-50 border border-error/30 rounded-xl text-sm">
            <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-charcoal mb-1">Authoritative sources could not be loaded.</p>
              <p className="text-slate">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => executeSearch(searchQuery)}
              className="text-sm font-medium text-forest-green hover:underline whitespace-nowrap focus:outline-none"
            >
              Retry
            </button>
          </div>
        )}

        {/* Not yet searched — show empty state */}
        {!loading && !error && !hasSearched && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-warm-ivory flex items-center justify-center mb-4 border border-border-color">
              <BookOpen size={24} className="text-muted-gold" />
            </div>
            <h3 className="text-base font-semibold text-charcoal mb-2">No authoritative sources are available yet.</h3>
            <p className="text-sm text-slate max-w-sm leading-relaxed mb-6">
              Connect the authoritative source repository to explore the sources used by IP-SAKTI guidance. Use the search bar or select a category above to begin.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryClick(cat.key)}
                  className="text-xs font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Searched but no results */}
        {!loading && !error && hasSearched && results?.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-warm-ivory flex items-center justify-center mb-3 border border-border-color">
              <Search size={20} className="text-slate" />
            </div>
            <p className="text-base font-semibold text-charcoal mb-1">No sources matched your search.</p>
            <p className="text-sm text-slate mb-4">
              Try different keywords, or check whether the source repository is connected.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-forest-green border border-forest-green/40 px-4 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-forest-green/50"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && results && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <SourceCard
                key={i}
                result={r}
                onClick={setSelectedResult}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── SOURCE TRACEABILITY ───────────────────────────────────────── */}
      <aside className="mt-12 p-6 bg-warm-ivory border border-border-color rounded-xl">
        <h2 className="text-base font-heading font-semibold text-charcoal mb-2">
          Why source traceability matters
        </h2>
        <p className="text-sm text-slate leading-relaxed">
          IP-SAKTI is designed to provide source-grounded guidance. Source Explorer helps users inspect the authoritative material behind the information presented by the system. When the source repository is connected, results reference actual legal, regulatory, biodiversity, and traditional-knowledge documents.
        </p>
      </aside>

      {/* ── DETAIL MODAL ──────────────────────────────────────────────── */}
      {selectedResult && (
        <SourceDetailPanel
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default SourceExplorer;
