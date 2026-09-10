import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MessageSquareQuote, 
  PackageSearch, 
  ShieldCheck, 
  FileCheck2,
  BookOpenCheck,
  Scale,
  Search,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-xl border border-border-color shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-forest-green mb-3">
            {t('dashboard.title')}
          </h1>
          <p className="text-lg text-slate leading-relaxed">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button 
          onClick={() => navigate('/ask-ip-sakti')}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-base whitespace-nowrap self-start md:self-auto"
        >
          <Plus size={20} />
          {t('dashboard.startAssessment')}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 2 — QUICK ACTIONS */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-forest-green mb-4">
              {t('dashboard.quickActions.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionCard 
                title={t('dashboard.quickActions.askIpSakti')}
                description={t('dashboard.quickActions.askIpSaktiDesc')}
                icon={<MessageSquareQuote size={24} className="text-forest-green" />}
                onClick={() => navigate('/ask-ip-sakti')}
              />
              <QuickActionCard 
                title={t('dashboard.quickActions.productClassification')}
                description={t('dashboard.quickActions.productClassificationDesc')}
                icon={<PackageSearch size={24} className="text-forest-green" />}
                onClick={() => navigate('/product-classification')}
              />
              <QuickActionCard 
                title={t('dashboard.quickActions.ipProtection')}
                description={t('dashboard.quickActions.ipProtectionDesc')}
                icon={<ShieldCheck size={24} className="text-forest-green" />}
                onClick={() => navigate('/ip-protection')}
              />
              <QuickActionCard 
                title={t('dashboard.quickActions.regulatoryCheck')}
                description={t('dashboard.quickActions.regulatoryCheckDesc')}
                icon={<FileCheck2 size={24} className="text-forest-green" />}
                onClick={() => navigate('/regulatory-check')}
              />
            </div>
          </section>

          {/* SECTION 3 — RECENT ASSESSMENTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-forest-green">
                {t('dashboard.recentAssessments.title')}
              </h2>
            </div>
            <div className="card p-12 flex flex-col items-center justify-center text-center bg-white/50 border-dashed">
              <div className="w-16 h-16 bg-warm-ivory rounded-full flex items-center justify-center mb-4 text-slate">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-medium text-charcoal mb-2">
                {t('dashboard.recentAssessments.empty')}
              </h3>
              <p className="text-slate mb-6 max-w-sm">
                {t('dashboard.recentAssessments.supporting')}
              </p>
              <button 
                onClick={() => navigate('/ask-ip-sakti')}
                className="btn-secondary"
              >
                {t('dashboard.recentAssessments.action')}
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Info & Snapshots */}
        <div className="space-y-8">
          
          {/* SECTION 1 — TODAY'S SNAPSHOT */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-forest-green mb-4">
              {t('dashboard.snapshot.title')}
            </h2>
            <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[160px] bg-gradient-to-br from-white to-warm-ivory/50">
              <p className="text-slate font-medium">
                {t('dashboard.snapshot.empty')}
              </p>
            </div>
          </section>

          {/* SECTION 4 — KNOWLEDGE INTELLIGENCE */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-forest-green mb-4">
              {t('dashboard.knowledgeIntelligence.title')}
            </h2>
            <div className="card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <BookOpenCheck className="text-muted-gold shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-charcoal leading-relaxed">
                  {t('dashboard.knowledgeIntelligence.description')}
                </p>
              </div>
              <div className="pt-4 border-t border-border-color">
                <div className="flex items-center justify-center p-3 bg-slate-50 rounded-lg text-sm text-slate italic">
                  {t('dashboard.knowledgeIntelligence.emptySource')}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* SECTION 5 — WHY TRUST IP-SAKTI */}
      <section className="pt-8 mt-8 border-t border-border-color">
        <h2 className="text-2xl font-heading font-semibold text-forest-green mb-8 text-center">
          {t('dashboard.trust.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrustPrinciple 
            icon={<BookOpenCheck size={28} />}
            title={t('dashboard.trust.sourceGrounded')}
            description={t('dashboard.trust.sourceGroundedDesc')}
          />
          <TrustPrinciple 
            icon={<Scale size={28} />}
            title={t('dashboard.trust.jurisdictionAware')}
            description={t('dashboard.trust.jurisdictionAwareDesc')}
          />
          <TrustPrinciple 
            icon={<Search size={28} />}
            title={t('dashboard.trust.transparent')}
            description={t('dashboard.trust.transparentDesc')}
          />
          <TrustPrinciple 
            icon={<Users size={28} />}
            title={t('dashboard.trust.humanEscalation')}
            description={t('dashboard.trust.humanEscalationDesc')}
          />
        </div>
      </section>

      {/* SECTION 6 — IMPORTANT DISCLAIMER */}
      <section className="mt-12 pt-6 border-t border-border-color/60 text-center">
        <p className="text-xs text-slate max-w-4xl mx-auto leading-relaxed">
          <strong>Disclaimer:</strong> {t('dashboard.disclaimer')}
        </p>
      </section>

    </div>
  );
};

// Subcomponents for the dashboard
const QuickActionCard = ({ title, description, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="card p-5 flex flex-col text-left hover:border-deep-teal hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-forest-green/50"
  >
    <div className="w-12 h-12 rounded-lg bg-warm-ivory flex items-center justify-center mb-4 group-hover:bg-forest-green/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-forest-green transition-colors">
      {title}
    </h3>
    <p className="text-sm text-slate leading-relaxed">
      {description}
    </p>
  </button>
);

const TrustPrinciple = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="w-14 h-14 rounded-full bg-forest-green/5 text-forest-green flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-charcoal mb-2">{title}</h3>
    <p className="text-sm text-slate leading-relaxed">{description}</p>
  </div>
);

export default Dashboard;
