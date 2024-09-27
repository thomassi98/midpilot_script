import React, { useState, useEffect } from 'react';
import { RetellClientService } from '../services/retellClient';
import { Phone, PhoneOff, Loader } from 'lucide-react';

const ChatButton: React.FC = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [retellService, setRetellService] = useState<RetellClientService | null>(null);

  const getAgentId = (): string | null => {
    const scriptTag = document.currentScript || document.querySelector('script[agent-id]');
    return scriptTag ? scriptTag.getAttribute('agent-id') : null;
  };

  useEffect(() => {
    const agentId = getAgentId();
    if (!agentId) {
      console.error('Agent ID not provided. Please include agent-id attribute in the script tag.');
      return;
    }

    const service = new RetellClientService(agentId);
    setRetellService(service);
  }, []);

  const handleClick = async () => {
    if (isConnecting) return;

    if (isCalling) {
      console.log('Ending call');
      retellService?.stopConversation();
      setIsCalling(false);
      return;
    }

    console.log('Starting call');
    setIsConnecting(true);

    const agentId = getAgentId();
    if (!agentId) {
      console.error('Agent ID not found.');
      setIsConnecting(false);
      return;
    }

    try {
      const response = await fetch('https://midpilot-call-server-434813.ew.r.appspot.com/api/register-call', {
      // const response = await fetch('http://localhost:8080/api/register-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });
      const data = await response.json();
      if (data.call_id && data.access_token && retellService) {
        retellService.startConversation(
          data.access_token,
          () => {
            setIsCalling(true);
            setIsConnecting(false);
          },
          () => {
            setIsCalling(false);
            setIsConnecting(false);
          },
          (error: Error) => {
            console.error('An error occurred:', error);
            setIsCalling(false);
            setIsConnecting(false);
            alert('An error occurred during the conversation.');
          }
        );
      } else {
        throw new Error('Failed to obtain call credentials');
      }
    } catch (error) {
      console.error('Error obtaining call credentials:', error);
      alert('An error occurred while starting the call.');
      setIsConnecting(false);
    }
  };

  // Styles and animations
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    height: '64px',
    width: '64px',
    borderRadius: '50%',
    color: 'white',
    backgroundColor: isCalling ? '#991b1b' : '#000',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: isConnecting ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    userSelect: 'none',
    pointerEvents: isConnecting ? 'none' : 'auto',
  };

  const [backgroundColor, setBackgroundColor] = useState(buttonStyle.backgroundColor);

  const handleMouseEnter = () => {
    if (!isConnecting) {
      setBackgroundColor(isCalling ? '#7f1d1d' : '#1f2937');
    }
  };

  const handleMouseLeave = () => {
    if (!isConnecting) {
      setBackgroundColor(isCalling ? '#991b1b' : '#000');
    }
  };

  const getIcon = () => {
    if (isConnecting) {
      return <Loader className="spin" color="white" size={32} />;
    } else if (isCalling) {
      return <PhoneOff color="white" size={32} />;
    } else {
      return <Phone color="white" size={32} />;
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
      <div
        id="midpilot-chat-button"
        style={{ ...buttonStyle, backgroundColor }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {getIcon()}
      </div>
    </>
  );
};

export default ChatButton;
