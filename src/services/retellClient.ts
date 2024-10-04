import { RetellWebClient } from 'retell-client-js-sdk';

export class RetellClientService {
  private webClient: RetellWebClient;

  constructor(private agentId: string) {
    this.webClient = new RetellWebClient();

    // Set up event listeners once
    this.webClient.on('call_started', () => {
      // Will assign actual handler in `startConversation`
    });

    this.webClient.on('call_ended', () => {
      // Will assign actual handler in `startConversation`
    });

    this.webClient.on('error', (error: Error) => {
      console.error('An error occurred:', error);
      // Will assign actual handler in `startConversation`
    });
  }

  public async startConversation(
    accessToken: string,
    onCallStarted: () => void,
    onCallEnded: () => void,
    onError: (error: Error) => void
  ) {
    // Remove previous event handlers to prevent duplication
    this.webClient.off('call_started');
    this.webClient.off('call_ended');
    this.webClient.off('error');

    // Attach new event handlers
    this.webClient.on('call_started', onCallStarted);
    this.webClient.on('call_ended', onCallEnded);
    this.webClient.on('error', (error: Error) => {
      console.error('An error occurred:', error);
      onError(error);
    });

    try {
      await this.webClient.startCall({ accessToken });
    } catch (error) {
      console.error('Error starting conversation:', error);
      onError(error as Error);
    }
  }

  public mute() {
    this.webClient.mute();
  }

  public unmute() {
    this.webClient.unmute();
  }

  public stopConversation() {
    this.webClient.stopCall();
  }
}
