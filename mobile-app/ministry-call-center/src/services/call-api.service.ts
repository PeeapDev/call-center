/**
 * Simple Call API Service (No WebRTC - Works in Expo Go)
 * Uses HTTP API to trigger calls on backend
 */

import API_CONFIG from '../config/api';

export interface CallRequest {
  phoneNumber: string;
  ivrOption: string;
  callerName?: string;
}

export interface CallResponse {
  success: boolean;
  callId?: string;
  assignedAgent?: {
    id: string;
    name: string;
    extension: string;
  };
  queuePosition?: number;
  estimatedWait?: number;
  message: string;
}

export class CallApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseURL || 'http://192.168.1.17:3001';
  }

  /**
   * Initiate a call via API (no WebRTC in mobile)
   */
  async initiateCall(request: CallRequest): Promise<CallResponse> {
    try {
      console.log('📞 Initiating call via API:', request);

      const response = await fetch(`${this.baseUrl}/calls/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CallResponse = await response.json();
      console.log('✅ Call initiated:', data);

      return data;
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      throw error;
    }
  }

  /**
   * Check call status
   */
  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get call status:', error);
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(callId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/end`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Call ended');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      throw error;
    }
  }

  /**
   * Get available agents for queue
   */
  async getAvailableAgents(queue?: string): Promise<any[]> {
    try {
      const url = queue 
        ? `${this.baseUrl}/agents/available?queue=${queue}`
        : `${this.baseUrl}/agents/available`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get agents:', error);
      return [];
    }
  }
}

// Singleton instance
export const callApiService = new CallApiService();
