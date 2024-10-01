import React, { createContext, useContext } from 'react';
// import './styles/shadowGlobals.css';

const ShadowRootContext = createContext<ShadowRoot | null>(null);

export const ShadowRootProvider: React.FC<{ shadowRoot: ShadowRoot; children: React.ReactNode }> = ({ shadowRoot, children }) => {
  return (
    <ShadowRootContext.Provider value={shadowRoot}>
      {children}
    </ShadowRootContext.Provider>
  );
};

export const useShadowRoot = () => {
  const context = useContext(ShadowRootContext);
  if (!context) {
    throw new Error('useShadowRoot must be used within a ShadowRootProvider');
  }
  return context;
};
