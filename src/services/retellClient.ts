import { RetellWebClient } from 'retell-client-js-sdk';

export class RetellClientService {
  private webClient: RetellWebClient | null = null;

  constructor(private agentId: string) {}

  public async startConversation(
    accessToken: string,
    onCallStarted: () => void,
    onCallEnded: () => void,
    onError: (error: Error) => void
  ) {
    if (this.webClient) {
      this.webClient.stopCall();
    }
    this.webClient = new RetellWebClient();

    this.webClient.on('call_started', () => {
      onCallStarted();
    });

    this.webClient.on('call_ended', () => {
      onCallEnded();
    });

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

  public stopConversation() {
    if (this.webClient) {
      this.webClient.stopCall();
    }
  }
}
