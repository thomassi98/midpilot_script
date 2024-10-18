import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@containers/App';
import { domReady } from '@utils/domReady';
import { ShadowRootProvider } from '@/ShadowRootContext';
import { checkUserAccess, isScriptHostedOn } from '@utils/plaaceUtils';
//import ChatButton from '@components/ChatButton';

// Import the compiled CSS as a string
import outputCSS from './output.css?inline';

// Ensure the DOM is fully loaded before running the script
domReady(() => {
  try {
    // Create a root element dynamically
    let hostElement = document.getElementById('midpilot-root');
    if (!hostElement) {
      hostElement = document.createElement('div');
      hostElement.id = 'midpilot-root';
      
      document.body.appendChild(hostElement);
    }

    // Create a Shadow Root
    const shadowRoot = hostElement.attachShadow({ mode: 'open' }); // Use 'open' for debugging

    // Inject styles into the Shadow Root
    const styleElement = document.createElement('style');
    styleElement.textContent = outputCSS;
    shadowRoot.appendChild(styleElement);

    // Create a React root within the Shadow DOM
    const root = ReactDOM.createRoot(shadowRoot);

    if (isScriptHostedOn('plaace')) {
      console.log("Script is hosted on plaace")
      checkUserAccess({allowAll: true}).then((hasAccess) => {
        if (hasAccess) {
          root.render(
            <ShadowRootProvider shadowRoot={shadowRoot}>
              <App />
            </ShadowRootProvider>
          );
        } else {
          console.log('Access to Midpilot denied');
        }
      });
    } else {
      root.render(
        <ShadowRootProvider shadowRoot={shadowRoot}>
          <App />
        </ShadowRootProvider>
      );
    }
  } catch (error) {
    console.error('Error initializing the React application:', error);
  }
});
