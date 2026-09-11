import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AskIpSakti from './pages/AskIpSakti';
import ProductClassification from './pages/ProductClassification';
import IpProtection from './pages/IpProtection';
import RegulatoryCheck from './pages/RegulatoryCheck';
import AbsBiodiversity from './pages/AbsBiodiversity';
import TkdlPriorArt from './pages/TkdlPriorArt';
import SourceExplorer from './pages/SourceExplorer';
import MyCases from './pages/MyCases';
import ExpertEscalation from './pages/ExpertEscalation';
import LegalDossier from './pages/LegalDossier';
import Guidance from './pages/Guidance';
import { JurisdictionProvider } from './context/JurisdictionContext';
import './i18n';

function App() {
  return (
    <JurisdictionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/* Placeholder routes */}
          <Route path="ask-ip-sakti" element={<AskIpSakti />} />
          <Route path="product-classification" element={<ProductClassification />} />
          <Route path="ip-protection" element={<IpProtection />} />
          <Route path="regulatory-check" element={<RegulatoryCheck />} />
          <Route path="abs-biodiversity" element={<AbsBiodiversity />} />
          <Route path="tkdl-prior-art" element={<TkdlPriorArt />} />
          <Route path="guidance" element={<Guidance />} />
          <Route path="source-explorer" element={<SourceExplorer />} />
          <Route path="my-cases" element={<MyCases />} />
          <Route path="expert-escalation" element={<ExpertEscalation />} />
          <Route path="legal-dossier" element={<LegalDossier />} />
        </Route>
      </Routes>
    </Router>
  </JurisdictionProvider>
  );
}

export default App;
