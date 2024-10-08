import { RetellWebClient } from 'retell-client-js-sdk';
import { createElement, createIcons, Phone, PhoneOff, Loader } from 'lucide';

(function () {
  console.log('midpilot.js script is running V3.4'); // Updated version number

  // Function to get the agent ID
  function getAgentId(): string | null {
    const scriptTag = document.currentScript || document.querySelector('script[agent-id]');
    return scriptTag ? scriptTag.getAttribute('agent-id') : null;
  }

  // Main initialization function
  function initialize() {
    console.log("Initializing midpilot script");
    const agentId = getAgentId();
    if (!agentId) {
      console.error('Agent ID not provided. Please include agent-id attribute in the script tag.');
      return;
    }
    console.log("Agent ID", agentId);
    initializeRetellClient(agentId);
  }

  // Function to ensure the DOM is ready
  function domReady(fn: () => void) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  // Run initialization when DOM is ready
  domReady(initialize);
})();

function initializeRetellClient(agentId: string) {
  console.log('initializeRetellClient called with agentId:', agentId);

  // Create the call button
  const button = document.createElement('div');
  button.id = 'midpilot-chat-button';
  console.log('Button created:', button);

  // Set button styles
  Object.assign(button.style, {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    height: '64px',
    width: '64px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: '#000',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    userSelect: 'none',
  });

  let isCalling = false;
  let isConnecting = false;
  let webClient: RetellWebClient | null = null;

  const phoneIcon = createElement(Phone).outerHTML;
  const phoneOffIcon = createElement(PhoneOff).outerHTML;
  const loaderIcon = createElement(Loader).outerHTML;

  // Add this CSS rule for the spinning animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    #midpilot-chat-button .spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);

  // Update the updateButton function
  function updateButton() {
    if (isConnecting) {
      buttonIcon.innerHTML = loaderIcon;
      buttonIcon.classList.add('spin');
      button.style.backgroundColor = '#000';
    } else if (isCalling) {
      buttonIcon.innerHTML = phoneOffIcon;
      buttonIcon.classList.remove('spin');
      button.style.backgroundColor = '#991b1b';
    } else {
      buttonIcon.innerHTML = phoneIcon;
      buttonIcon.classList.remove('spin');
      button.style.backgroundColor = '#000';
    }
    button.style.pointerEvents = isConnecting ? 'none' : 'auto';
  }

  // Initial button setup
  const buttonIcon = document.createElement('div');
  buttonIcon.innerHTML = phoneIcon;
  button.appendChild(buttonIcon);

  button.addEventListener('click', () => {
    if (isConnecting) return;
    
    if (isCalling) {
      console.log('Ending call');
      if (webClient) {
        webClient.stopCall();
      }
      return;
    }

    console.log('Starting call');
    isConnecting = true;
    updateButton();

    // Request call credentials from your server
    fetch('https://midpilot-call-server-434813.ew.r.appspot.com/api/register-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId: agentId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.call_id && data.access_token) {
          startConversation(data.call_id, data.access_token);
        } else {
          throw new Error('Failed to obtain call credentials');
        }
      })
      .catch((error) => {
        console.error('Error obtaining call credentials:', error);
        alert('An error occurred while starting the call.');
        isConnecting = false;
        updateButton();
      });
  });

  function startConversation(callId: string, accessToken: string) {
    if (webClient) {
      webClient.stopCall();
    }
    webClient = new RetellWebClient();

    webClient.on('call_started', () => {
      isCalling = true;
      isConnecting = false;
      updateButton();
    });

    webClient.on('call_ended', () => {
      isCalling = false;
      isConnecting = false;
      updateButton();
    });

    webClient.on('error', (error: Error) => {
      console.error('An error occurred:', error);
      isCalling = false;
      isConnecting = false;
      updateButton();
      alert('An error occurred during the conversation.');
    });

    // Start the conversation with the call credentials
    webClient
      .startCall({
        //callId: callId,
        accessToken: accessToken,
        //call_type: 'web',
        //enableUpdate: true,
        //emitRawAudioSamples: true, // This can be used for animation!
      })
      .catch((error: Error) => {
        console.error('Error starting conversation:', error);
        isConnecting = false;
        updateButton();
        alert('Failed to start the conversation.');
      });
  }

  // Mouse enter and leave effects
  button.addEventListener('mouseenter', () => {
    if (!isConnecting) {
      if (isCalling) {
        button.style.backgroundColor = '#7f1d1d'; // Darker red when hovering during a call
      } else {
        button.style.backgroundColor = '#1f2937';
      }
    }
  });

  button.addEventListener('mouseleave', () => {
    if (isCalling) {
      button.style.backgroundColor = '#991b1b'; // Return to original red when not hovering during a call
    } else {
      button.style.backgroundColor = '#000';
    }
  });

  document.body.appendChild(button);
  console.log('Button appended to body');
}