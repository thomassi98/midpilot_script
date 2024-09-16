// retell-client.js
(function () {
  // Function to initialize the Retell client after the SDK is loaded
  function initializeRetellClient() {
    // Retrieve the customer token if provided
    const scriptTag = document.currentScript || document.querySelector('script[data-customer-token]');
    const customerToken = scriptTag ? scriptTag.getAttribute('data-customer-token') : null;

    // Create the call button
    const button = document.createElement('div');
    // Set button styles
    button.style.position = 'fixed';
    button.style.bottom = '16px';
    button.style.left = '16px';
    button.style.height = '64px';
    button.style.width = '64px';
    button.style.borderRadius = '50%';
    button.style.color = 'white';
    button.style.backgroundColor = '#000';
    button.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.zIndex = '999';
    button.style.userSelect = 'none';

    let isCalling = false;
    let isConnecting = false;
    let webClient = null;

    const phoneIcon = '📞';
    const phoneOffIcon = '🔴';
    const loaderIcon = '⏳';

    const buttonText = document.createElement('span');
    buttonText.textContent = phoneIcon;
    button.appendChild(buttonText);

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
          body: JSON.stringify({ customerToken: customerToken }),
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
        updateButton();
      });

      webClient.on('conversationEnded', () => {
        isCalling = false;
        updateButton();
      });

      webClient.on('error', (error) => {
        console.error('An error occurred:', error);
        isCalling = false;
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
        buttonText.textContent = phoneOffIcon;
        button.style.backgroundColor = '#991b1b';
      } else if (isConnecting) {
        buttonText.textContent = loaderIcon;
        button.style.backgroundColor = '#000';
      } else {
        buttonText.textContent = phoneIcon;
        button.style.backgroundColor = '#000';
      }
    }

    document.body.appendChild(button);
  }

  // Check if the Retell Frontend SDK is already loaded
  if (typeof RetellWebClient === 'undefined') {
    // Create a script tag to load the SDK
    const sdkScript = document.createElement('script');
    sdkScript.src = 'https://cdn.retellai.com/client-sdk/retell-client-js-sdk.js';
    sdkScript.onload = initializeRetellClient;
    document.head.appendChild(sdkScript);
  } else {
    // SDK is already loaded, initialize the client immediately
    initializeRetellClient();
  }
})();
