import React, { createContext, useContext, useState, useEffect } from 'react';

const JurisdictionContext = createContext(null);

export const JURISDICTIONS = [
  { code: 'INDIA', labelKey: 'common.india', defaultLabel: 'India' },
  { code: 'INTERNATIONAL', labelKey: 'common.international', defaultLabel: 'International' },
];

export const JurisdictionProvider = ({ children }) => {
  const [jurisdiction, setJurisdictionState] = useState(() => {
    try {
      const saved = localStorage.getItem('ip_sakti_jurisdiction');
      return saved === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'INDIA';
    } catch {
      return 'INDIA';
    }
  });

  const setJurisdiction = (val) => {
    const clean = val === 'INTERNATIONAL' ? 'INTERNATIONAL' : 'INDIA';
    setJurisdictionState(clean);
    try {
      localStorage.setItem('ip_sakti_jurisdiction', clean);
    } catch {
      // ignore
    }
  };

  return (
    <JurisdictionContext.Provider value={{ jurisdiction, setJurisdiction, JURISDICTIONS }}>
      {children}
    </JurisdictionContext.Provider>
  );
};

export const useJurisdiction = () => {
  const ctx = useContext(JurisdictionContext);
  if (!ctx) {
    return {
      jurisdiction: 'INDIA',
      setJurisdiction: () => {},
      JURISDICTIONS,
    };
  }
  return ctx;
};
