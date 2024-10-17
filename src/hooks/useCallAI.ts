// src/hooks/useCallAI.ts
import { useState, useEffect } from 'react';
import { RetellClientService } from '../services/retellClient';

export function useCallAI() {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [retellService, setRetellService] = useState<RetellClientService | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getAgentId = (): string | null => {
    const scriptTag = document.currentScript || document.querySelector('script[data-agent-id]');
    return scriptTag ? scriptTag.getAttribute('data-agent-id') : null;
  };

  useEffect(() => {
    const agentId = getAgentId();
    if (!agentId) {
      console.error('Agent ID not provided. Please include data-agent-id attribute in the script tag.');
      return;
    }

    const service = new RetellClientService(agentId);
    setRetellService(service);
  }, []);

  const startCall = async () => {
    if (isConnecting) return;

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

  const endCall = () => {
    console.log('Ending call');
    retellService?.stopConversation();
    setIsCalling(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      retellService?.unmute();
      setIsMuted(!isMuted);
    } else {
      retellService?.mute();
      setIsMuted(!isMuted);
    }
  };

  return {
    isCalling,
    isConnecting,
    isMuted,
    startCall,
    endCall,
    toggleMute,
  };
}