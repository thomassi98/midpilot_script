import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@containers/App';
import { domReady } from '@utils/domReady';

// Ensure the DOM is fully loaded before running the script
domReady(() => {
  // Create a root element dynamically
  let rootElement = document.getElementById('midpilot-root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'midpilot-root';
    document.body.appendChild(rootElement);
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
});
