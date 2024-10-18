import React from 'react';
import { createPortal } from 'react-dom';
import { useShadowRoot } from '../ShadowRootContext';

interface ShadowPortalProps {
  children: React.ReactNode;
}

const ShadowPortal: React.FC<ShadowPortalProps> = ({ children }) => {
  const shadowRoot = useShadowRoot();
  return createPortal(children, shadowRoot);
};

export default ShadowPortal;
