// services/apiService.ts
import axios from 'axios';

export interface Message {
  role: string;
  content: string;
}

export async function getGuide(agent_id: string, conversation: Message[]): Promise<Message> {
  try {
    const response = await axios.post('https://midpilot-call-server-434813.ew.r.appspot.com/api/get-guide', {
      agent_id,
      conversation,
    });
    // Adjust according to the actual API response structure
    const assistantMessage: Message = response.data;
    return assistantMessage;
  } catch (error) {
    console.error('Error fetching guide:', error);
    throw error;
  }
}
