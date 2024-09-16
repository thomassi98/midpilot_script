// retell-client.js
(function () {
  console.log('midpilot.js script is running'); // Debugging step 1

  document.addEventListener('DOMContentLoaded', function() {
    // Get the current script tag and extract the agentId
    const scriptTag = document.currentScript || document.querySelector('script[agent-id]');
    const agentId = scriptTag ? scriptTag.getAttribute('agent-id') : null;

    if (!agentId) {
      console.error('Agent ID not provided. Please include data-agent-id attribute in the script tag.');
      return;
    }

    // Function to initialize the Retell client
    function initializeRetellClient() {
      console.log('initializeRetellClient called'); // Debugging step 4

      // Create the call button
      const button = document.createElement('div');
      button.id = 'midpilot-chat-button';
      console.log('Button created:', button); // Debugging step 2

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
      let webClient = null;

      // SVG icons
      const phoneIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v2a2 2 0 0 1-2.18 2 19.84 19.84 0 0 1-8.63-2.91 19.5 19.5 0 0 1-6.18-6.18A19.84 19.84 0 0 1 3 4.18 2 2 0 0 1 5 2h2a2 2 0 0 1 2 1.72 12 12 0 0 0 .5 2.5 2 2 0 0 1-.45 2.11L7.1 10.7a16 16 0 0 0 6 6l1.39-1.39a2 2 0 0 1 2.11-.45 12 12 0 0 0 2.5.5A2 2 0 0 1 22 16.92z"></path>
      </svg>
      `;

      const phoneOffIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 2h4m-2 0v2m9.54 3.54a15.98 15.98 0 0 1-1.74 2.2M23 1L1 23m4.68-5.32A16 16 0 0 1 1 9.41M17.32 18.68A15.98 15.98 0 0 0 23 14.59M16.24 16.24A11.94 11.94 0 0 1 7.76 7.76"></path>
      </svg>
      `;

      const loaderIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      `;

      // Keyframes for spin animation
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleElement);

      const buttonIcon = document.createElement('div');
      buttonIcon.innerHTML = phoneIconSVG;
      button.appendChild(buttonIcon);

      button.addEventListener('click', () => {
        if (isConnecting) return;

        if (isCalling) {
          webClient.stopConversation();
          isCalling = false;
          updateButton();
        } else {
          isConnecting = true;
          updateButton();

          // Request call credentials from your server
          fetch('https://yourserver.com/api/register-call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ agentId: agentId }),
          })
            .then((response) => response.json())
            .then((data) => {
              isConnecting = false;
              if (data.call_id && data.access_token) {
                startConversation(data.call_id, data.access_token);
              } else {
                console.error('Failed to obtain call credentials');
                alert('Failed to start the call. Please try again later.');
              }
            })
            .catch((error) => {
              isConnecting = false;
              console.error('Error obtaining call credentials:', error);
              alert('An error occurred while starting the call.');
            });
        }
      });

      function startConversation(callId, accessToken) {
        webClient = new RetellWebClient();

        webClient.on('conversationStarted', () => {
          isCalling = true;
          isConnecting = false;
          updateButton();
        });

        webClient.on('conversationEnded', () => {
          isCalling = false;
          updateButton();
        });

        webClient.on('error', (error) => {
          console.error('An error occurred:', error);
          isCalling = false;
          isConnecting = false;
          updateButton();
          alert('An error occurred during the conversation.');
        });

        // Start the conversation with the call credentials
        webClient
          .startConversation({
            callId: callId,
            accessToken: accessToken,
            sampleRate: 48000,
            enableUpdate: true,
          })
          .catch((error) => {
            console.error('Error starting conversation:', error);
            isConnecting = false;
            updateButton();
            alert('Failed to start the conversation.');
          });
      }

      function updateButton() {
        if (isCalling) {
          buttonIcon.innerHTML = phoneOffIconSVG;
          button.style.backgroundColor = '#991b1b';
        } else if (isConnecting) {
          buttonIcon.innerHTML = loaderIconSVG;
          button.style.backgroundColor = '#000';
        } else {
          buttonIcon.innerHTML = phoneIconSVG;
          button.style.backgroundColor = '#000';
        }
      }

      // Mouse enter and leave effects
      button.addEventListener('mouseenter', () => {
        if (!isConnecting) {
          button.style.backgroundColor = isCalling ? '#000' : '#1f2937';
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = isCalling ? '#991b1b' : '#000';
      });

      document.body.appendChild(button);
      console.log('Button appended to body'); // Debugging step 3
    }

    // Load the Retell Frontend SDK if not already loaded
    if (typeof RetellWebClient === 'undefined') {
      console.log('Loading RetellWebClient SDK'); // Debugging step 5
      const sdkScript = document.createElement('script');
      sdkScript.src = 'https://www.npmjs.com/package/retell-client-js-sdk';
      sdkScript.onload = initializeRetellClient;
      document.head.appendChild(sdkScript);
    } else {
      console.log('RetellWebClient already defined'); // Debugging step 7
      initializeRetellClient();
    }
  });
})();
