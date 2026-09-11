import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Scale,
  Leaf,
  FileCheck2,
  PackageSearch,
  MessageSquareQuote,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Globe,
  Database,
  Lock,
  Layers,
  FileText,
  Activity,
  Cpu,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useJurisdiction } from '../context/JurisdictionContext';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { jurisdiction, setJurisdiction } = useJurisdiction();

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="min-h-screen bg-warm-ivory text-charcoal flex flex-col selection:bg-forest-green selection:text-white">
      {/* ── TOP NAV BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border-color shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-forest-green flex items-center justify-center text-white shadow-xs">
              <ShieldCheck size={22} className="text-muted-gold" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-forest-green tracking-tight flex items-center gap-1.5">
                IP-SHAKTI
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest-green/10 text-forest-green font-sans font-semibold">
                  Sahayak v1.0
                </span>
              </span>
              <span className="text-[11px] text-slate font-medium block">
                Ayurvedic IPR & Regulatory Decision Intelligence Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-warm-ivory border border-border-color rounded-lg p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  i18n.language === 'en' ? 'bg-forest-green text-white shadow-2xs' : 'text-slate hover:text-charcoal'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('hi')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  i18n.language === 'hi' ? 'bg-forest-green text-white shadow-2xs' : 'text-slate hover:text-charcoal'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('mr')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  i18n.language === 'mr' ? 'bg-forest-green text-white shadow-2xs' : 'text-slate hover:text-charcoal'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Quick Links to Services */}
            <button
              type="button"
              onClick={() => navigate('/ask-ip-sakti')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-forest-green border border-forest-green/30 bg-forest-green/5 hover:bg-forest-green hover:text-white px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              <Cpu size={14} /> AI Copilot
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="hidden md:inline-flex items-center gap-2 text-xs font-bold text-charcoal border border-border-color bg-white hover:bg-warm-ivory px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              <Activity size={14} className="text-forest-green" /> Core Services Hub
            </button>

            <button
              type="button"
              onClick={() => navigate('/product-classification')}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-forest-green hover:bg-deep-teal px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <span>Start Assessment</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-border-color bg-linear-to-b from-white via-warm-ivory/50 to-warm-ivory">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#145A32_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-green/10 border border-forest-green/20 text-forest-green text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles size={14} className="text-muted-gold animate-pulse" />
            <span>AI-Powered Statutory IPR & AYUSH Compliance Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-charcoal tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Evidence-Grounded <span className="text-forest-green">IPR & Regulatory Intelligence</span> for Ayurvedic Formulations
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate max-w-3xl mx-auto leading-relaxed">
            Eliminating guesswork for herbal innovators, researchers, and enterprises. Instantly evaluate patentability under <strong>Patents Act §3(p)/§3(e)</strong>, classify under <strong>D&C Act Rule 158-B</strong>, and verify <strong>Biological Diversity Act (ABS)</strong> compliance with judge-proof statutory citations.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/product-classification')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-sm font-bold text-white bg-forest-green hover:bg-deep-teal px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center"
            >
              <PackageSearch size={18} className="text-muted-gold" />
              <span>Start Statutory Assessment Protocol</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 text-sm font-bold text-charcoal bg-white hover:bg-forest-green/5 border border-border-color hover:border-forest-green px-7 py-4 rounded-xl transition-all shadow-2xs cursor-pointer text-center"
            >
              <Activity size={18} className="text-forest-green" />
              <span>Head to Main Core Services & Console</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/ask-ip-sakti')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-slate hover:text-forest-green px-5 py-4 transition-colors cursor-pointer text-center"
            >
              <Cpu size={16} />
              <span>AI Legal Copilot</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate border-t border-border-color/60 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-forest-green" />
              <span>54 First Schedule Treatises Indexed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-forest-green" />
              <span>400+ NTAC Species Mapped (§40)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-forest-green" />
              <span>Native Hindi & Marathi Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-forest-green" />
              <span>Exportable Legal PDF Dossiers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 CORE STATUTORY PILLARS ───────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-forest-green uppercase tracking-widest">
              Architectural Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-charcoal">
              The 5 Pillars of Statutory Decision Intelligence
            </h2>
            <p className="text-slate text-sm sm:text-base leading-relaxed">
              Every query and formulation is systematically verified against Indian statutory acts, regulatory matrices, and traditional knowledge registers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="card p-6 border border-border-color hover:border-forest-green transition-all hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center mb-4 group-hover:bg-forest-green group-hover:text-white transition-colors">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gold block mb-1">
                  Pillar 01 • Patentability
                </span>
                <h3 className="text-lg font-bold text-charcoal mb-2">
                  Patents Act §3(p) & §3(e) Gatekeeper
                </h3>
                <p className="text-xs text-slate leading-relaxed mb-4">
                  Evaluates traditional knowledge bars (§3(p)), mere admixture bars (§3(e)), and identifies legitimate patentable carve-outs (Novel Drug Delivery Systems & Supercritical Extraction Processes).
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ip-protection')}
                className="text-xs font-bold text-forest-green flex items-center gap-1 group-hover:underline cursor-pointer pt-2"
              >
                Access IP Protection Engine →
              </button>
            </div>

            {/* Pillar 2 */}
            <div className="card p-6 border border-border-color hover:border-forest-green transition-all hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center mb-4 group-hover:bg-forest-green group-hover:text-white transition-colors">
                  <FileCheck2 size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gold block mb-1">
                  Pillar 02 • Regulation
                </span>
                <h3 className="text-lg font-bold text-charcoal mb-2">
                  D&C Act Rule 158-B Decision Matrix
                </h3>
                <p className="text-xs text-slate leading-relaxed mb-4">
                  Deterministic classification across Classical Ayurvedic Medicine, Proprietary Category A/B, Phytopharmaceuticals (CDSCO), and FSSAI Ayurveda Aahar 2022 with clinical trial requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/regulatory-check')}
                className="text-xs font-bold text-forest-green flex items-center gap-1 group-hover:underline cursor-pointer pt-2"
              >
                Run Regulatory Audit →
              </button>
            </div>

            {/* Pillar 3 */}
            <div className="card p-6 border border-border-color hover:border-forest-green transition-all hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center mb-4 group-hover:bg-forest-green group-hover:text-white transition-colors">
                  <Leaf size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gold block mb-1">
                  Pillar 03 • Biodiversity
                </span>
                <h3 className="text-lg font-bold text-charcoal mb-2">
                  Biological Diversity Act (ABS)
                </h3>
                <p className="text-xs text-slate leading-relaxed mb-4">
                  Maps Section 3 (Foreign Entity Prior NBA Approval) vs Section 7 (Domestic SBB Intimation), Section 6 IPR patent mandates, Section 40 NTAC exemptions, and calculates live ABS royalty dues.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/abs-biodiversity')}
                className="text-xs font-bold text-forest-green flex items-center gap-1 group-hover:underline cursor-pointer pt-2"
              >
                Calculate ABS Liability →
              </button>
            </div>

            {/* Pillar 4 */}
            <div className="card p-6 border border-border-color hover:border-forest-green transition-all hover:shadow-md group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center mb-4 group-hover:bg-forest-green group-hover:text-white transition-colors">
                  <Layers size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gold block mb-1">
                  Pillar 04 • Commercial IPR
                </span>
                <h3 className="text-lg font-bold text-charcoal mb-2">
                  Trademark (Class 5/3/30) & GI Scanner
                </h3>
                <p className="text-xs text-slate leading-relaxed mb-4">
                  Identifies Nice Classification classes, flags Section 9(1)(b) generic Sanskrit word trademark refusal bars, and verifies registered Indian Geographical Indications (e.g. Kashmir Saffron, Malabar Pepper).
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ip-protection')}
                className="text-xs font-bold text-forest-green flex items-center gap-1 group-hover:underline cursor-pointer pt-2"
              >
                View Trademark Strategy →
              </button>
            </div>

            {/* Pillar 5 */}
            <div className="card p-6 border border-border-color hover:border-forest-green transition-all hover:shadow-md group flex flex-col justify-between lg:col-span-2">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center mb-4 group-hover:bg-forest-green group-hover:text-white transition-colors">
                  <Lock size={24} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gold block mb-1">
                  Pillar 05 • Evidence Grounding & Traceability
                </span>
                <h3 className="text-lg font-bold text-charcoal mb-2">
                  Source-Grounded Explainability & Safe Abstention
                </h3>
                <p className="text-xs text-slate leading-relaxed mb-4">
                  Eliminates LLM hallucinations. Every response provides support badges (<code>DIRECTLY_SUPPORTED</code>, <code>AI_INFERENCE</code>, <code>STATUTORY_EXTRAPOLATION</code>) and exercises safe abstention when statutory evidence is insufficient.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/source-explorer')}
                className="text-xs font-bold text-forest-green flex items-center gap-1 group-hover:underline cursor-pointer pt-2"
              >
                Inspect Legal Source Corpus →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAST-TRACK ASSESSMENT TRIGGER ────────────────────────────── */}
      <section className="py-12 bg-forest-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted-gold/20 text-muted-gold text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Ready for Evaluation
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-warm-ivory">
                Start 5-Pillar Statutory Assessment Protocol
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Seamlessly evaluate botanical ingredient composition across <strong>D&C Act Rule 158-B</strong>, <strong>Patents Act §3(p)/§3(e)</strong>, and <strong>Biological Diversity Act (ABS)</strong> compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => navigate('/product-classification')}
                className="flex items-center justify-center gap-2 bg-white text-forest-green hover:bg-warm-ivory px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <PackageSearch size={16} />
                <span>Start Assessment Page</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Activity size={16} />
                <span>Head to Main Services & Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE CONSOLE MODULE LAUNCHER ─────────────────────────── */}
      <section className="py-16 bg-warm-ivory/60 border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-forest-green uppercase tracking-widest">
                Service Navigation
              </span>
              <h2 className="text-3xl font-heading font-bold text-charcoal mt-1">
                Explore Main IP-SHAKTI Services
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-green bg-white border border-forest-green/30 px-3.5 py-2 rounded-lg hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
              >
                <Activity size={14} /> Operations Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate('/product-classification')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-forest-green px-3.5 py-2 rounded-lg hover:bg-deep-teal transition-colors cursor-pointer shadow-2xs"
              >
                Start Assessment <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Ask IP-SAKTI (AI Copilot)',
                desc: 'Conversational legal query orchestrator with multilingual Devanagari translation.',
                path: '/ask-ip-sakti',
                icon: MessageSquareQuote,
                badge: 'Conversational',
              },
              {
                title: 'Product Classification',
                desc: 'Rule 158-B deterministic tree assessing Classical vs Proprietary status.',
                path: '/product-classification',
                icon: PackageSearch,
                badge: 'Rule 158-B',
              },
              {
                title: 'IP Protection Analyzer',
                desc: 'Patentability bars, Section 3(p)/3(e) risk scores, and trademark classes.',
                path: '/ip-protection',
                icon: ShieldCheck,
                badge: 'Patents & TM',
              },
              {
                title: 'Regulatory & GMP Audit',
                desc: 'Schedule T GMP readiness audit, Rule 161 labeling, and DMR(OA) advertising screen.',
                path: '/regulatory-check',
                icon: FileCheck2,
                badge: 'Schedule T',
              },
              {
                title: 'ABS Biodiversity Portal',
                desc: 'Section 3/7 compliance analyzer and live statutory ABS royalty calculator.',
                path: '/abs-biodiversity',
                icon: Leaf,
                badge: 'NBA / SBB',
              },
              {
                title: 'TKDL & Prior Art Search',
                desc: 'Traditional knowledge prior art search across classical Ayurvedic canon.',
                path: '/tkdl-prior-art',
                icon: BookOpen,
                badge: 'TKDL Canon',
              },
              {
                title: 'Source Statute Explorer',
                desc: 'Authoritative repository of acts, gazettes, rules, and court precedents.',
                path: '/source-explorer',
                icon: Globe,
                badge: 'Statute Matrix',
              },
              {
                title: 'Legal Dossier Generator',
                desc: 'Export comprehensive 5-pillar assessment reports in printable PDF format.',
                path: '/legal-dossier',
                icon: FileText,
                badge: 'PDF Export',
              },
            ].map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(srv.path)}
                  className="card p-5 border border-border-color hover:border-forest-green hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center group-hover:bg-forest-green group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-warm-ivory text-slate border border-border-color">
                        {srv.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-charcoal mb-1.5 group-hover:text-forest-green transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-forest-green mt-4 group-hover:translate-x-1 transition-transform">
                    <span>Open Service</span>
                    <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-forest-green text-white py-12 border-t border-forest-green/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-heading font-bold text-warm-ivory">
                IP-SHAKTI Sahayak
              </h2>
              <p className="text-xs text-slate-200 mt-1 max-w-md">
                Statutory IPR & Regulatory Intelligence Engine dedicated to Ayurveda, AYUSH, and Indian Biological Resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/ask-ip-sakti')}
                className="text-xs font-bold bg-white text-forest-green hover:bg-warm-ivory px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Launch IPR Engine →
              </button>
              <button
                type="button"
                onClick={() => navigate('/source-explorer')}
                className="text-xs font-bold bg-transparent border border-white/40 text-white hover:bg-white/10 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Statute Explorer
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <p>
              © 2026 IP-SHAKTI. Developed for Smart India Hackathon (SIH) AYUSH Problem Statement.
            </p>
            <p className="text-[11px] text-slate-400">
              Disclaimer: IP-SHAKTI provides statutory guidance and evidence-grounded decision intelligence, not formal legal counsel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
