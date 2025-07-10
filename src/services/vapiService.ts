import { ApiClient, API_CONFIG, handleApiError } from './api';

interface VapiCall {
  id: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  type: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall';
  phoneNumber?: string;
  assistantId: string;
  customer?: {
    number?: string;
    name?: string;
    email?: string;
  };
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  analysis?: {
    sentiment?: string;
    successEvaluation?: string;
    structuredData?: any;
  };
}

interface VapiAssistant {
  id: string;
  name: string;
  model: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  systemMessage?: string;
  functions?: any[];
}

class VapiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_CONFIG.VAPI.baseUrl, {
      'Authorization': `Bearer ${API_CONFIG.VAPI.apiKey}`,
    });
  }

  // Call Management
  async createCall(callData: {
    phoneNumber: string;
    assistantId?: string;
    customer?: {
      number?: string;
      name?: string;
      email?: string;
    };
    assistantOverrides?: Partial<VapiAssistant>;
  }): Promise<VapiCall> {
    try {
      const payload = {
        phoneNumber: callData.phoneNumber,
        assistantId: callData.assistantId || API_CONFIG.VAPI.assistantId,
        customer: callData.customer,
        assistantOverrides: callData.assistantOverrides,
      };

      return await this.client.post<VapiCall>('/call', payload);
    } catch (error) {
      throw handleApiError(error, 'VAPI Create Call');
    }
  }

  async getCalls(params?: {
    limit?: number;
    createdAtGt?: string;
    createdAtLt?: string;
    assistantId?: string;
  }): Promise<VapiCall[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.createdAtGt) queryParams.createdAtGt = params.createdAtGt;
      if (params?.createdAtLt) queryParams.createdAtLt = params.createdAtLt;
      if (params?.assistantId) queryParams.assistantId = params.assistantId;

      return await this.client.get<VapiCall[]>('/call', queryParams);
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Calls');
    }
  }

  async getCall(callId: string): Promise<VapiCall> {
    try {
      return await this.client.get<VapiCall>(`/call/${callId}`);
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Call');
    }
  }

  async endCall(callId: string): Promise<VapiCall> {
    try {
      return await this.client.post<VapiCall>(`/call/${callId}/end`);
    } catch (error) {
      throw handleApiError(error, 'VAPI End Call');
    }
  }

  // Assistant Management
  async getAssistants(): Promise<VapiAssistant[]> {
    try {
      return await this.client.get<VapiAssistant[]>('/assistant');
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Assistants');
    }
  }

  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    try {
      return await this.client.get<VapiAssistant>(`/assistant/${assistantId}`);
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Assistant');
    }
  }

  async createAssistant(assistantData: {
    name: string;
    model: {
      provider: string;
      model: string;
      temperature?: number;
      maxTokens?: number;
    };
    voice: {
      provider: string;
      voiceId: string;
    };
    firstMessage?: string;
    systemMessage?: string;
    functions?: any[];
  }): Promise<VapiAssistant> {
    try {
      return await this.client.post<VapiAssistant>('/assistant', assistantData);
    } catch (error) {
      throw handleApiError(error, 'VAPI Create Assistant');
    }
  }

  async updateAssistant(assistantId: string, updateData: Partial<VapiAssistant>): Promise<VapiAssistant> {
    try {
      return await this.client.put<VapiAssistant>(`/assistant/${assistantId}`, updateData);
    } catch (error) {
      throw handleApiError(error, 'VAPI Update Assistant');
    }
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    try {
      await this.client.delete(`/assistant/${assistantId}`);
    } catch (error) {
      throw handleApiError(error, 'VAPI Delete Assistant');
    }
  }

  // Phone Number Management
  async getPhoneNumbers(): Promise<any[]> {
    try {
      return await this.client.get<any[]>('/phone-number');
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Phone Numbers');
    }
  }

  // Analytics and Metrics
  async getCallAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    assistantId?: string;
  }): Promise<any> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params?.startDate) queryParams.startDate = params.startDate;
      if (params?.endDate) queryParams.endDate = params.endDate;
      if (params?.assistantId) queryParams.assistantId = params.assistantId;

      return await this.client.get<any>('/analytics/calls', queryParams);
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Analytics');
    }
  }

  // Utility methods
  async scheduleCall(scheduleData: {
    phoneNumber: string;
    scheduledAt: string;
    assistantId?: string;
    customer?: {
      name?: string;
      email?: string;
    };
  }): Promise<any> {
    try {
      const payload = {
        phoneNumber: scheduleData.phoneNumber,
        scheduledAt: scheduleData.scheduledAt,
        assistantId: scheduleData.assistantId || API_CONFIG.VAPI.assistantId,
        customer: scheduleData.customer,
      };

      return await this.client.post<any>('/call/schedule', payload);
    } catch (error) {
      throw handleApiError(error, 'VAPI Schedule Call');
    }
  }

  async getCallRecording(callId: string): Promise<string> {
    try {
      const call = await this.getCall(callId);
      return call.recordingUrl || '';
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Recording');
    }
  }

  async getCallTranscript(callId: string): Promise<string> {
    try {
      const call = await this.getCall(callId);
      return call.transcript || '';
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Transcript');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getAssistants();
      return true;
    } catch (error) {
      console.error('VAPI Connection test failed:', error);
      return false;
    }
  }

  // Real-time call status
  async getCallStatus(callId: string): Promise<string> {
    try {
      const call = await this.getCall(callId);
      return call.status;
    } catch (error) {
      throw handleApiError(error, 'VAPI Get Call Status');
    }
  }

  // Bulk operations
  async createBulkCalls(calls: Array<{
    phoneNumber: string;
    customer?: {
      name?: string;
      email?: string;
    };
  }>): Promise<VapiCall[]> {
    try {
      const results = await Promise.allSettled(
        calls.map(call => this.createCall(call))
      );

      return results
        .filter((result): result is PromiseFulfilledResult<VapiCall> => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      throw handleApiError(error, 'VAPI Bulk Create Calls');
    }
  }
}

export const vapiService = new VapiService();