import { ApiClient, API_CONFIG, handleApiError } from './api';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'crashed';
  startedAt: string;
  stoppedAt?: string;
  data?: any;
}

class N8nService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_CONFIG.N8N.baseUrl, {
      'X-N8N-API-KEY': API_CONFIG.N8N.apiKey || '',
    });
  }

  // Workflow Management
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.client.get<{ data: N8nWorkflow[] }>('/workflows');
      return response.data || [];
    } catch (error) {
      throw handleApiError(error, 'n8n Get Workflows');
    }
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    try {
      return await this.client.get<N8nWorkflow>(`/workflows/${workflowId}`);
    } catch (error) {
      throw handleApiError(error, 'n8n Get Workflow');
    }
  }

  async createWorkflow(workflowData: {
    name: string;
    nodes: any[];
    connections: any;
    active?: boolean;
    tags?: string[];
  }): Promise<N8nWorkflow> {
    try {
      return await this.client.post<N8nWorkflow>('/workflows', workflowData);
    } catch (error) {
      throw handleApiError(error, 'n8n Create Workflow');
    }
  }

  async updateWorkflow(workflowId: string, updateData: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    try {
      return await this.client.put<N8nWorkflow>(`/workflows/${workflowId}`, updateData);
    } catch (error) {
      throw handleApiError(error, 'n8n Update Workflow');
    }
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.client.delete(`/workflows/${workflowId}`);
    } catch (error) {
      throw handleApiError(error, 'n8n Delete Workflow');
    }
  }

  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    try {
      return await this.client.post<N8nWorkflow>(`/workflows/${workflowId}/activate`);
    } catch (error) {
      throw handleApiError(error, 'n8n Activate Workflow');
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    try {
      return await this.client.post<N8nWorkflow>(`/workflows/${workflowId}/deactivate`);
    } catch (error) {
      throw handleApiError(error, 'n8n Deactivate Workflow');
    }
  }

  // Execution Management
  async getExecutions(params?: {
    workflowId?: string;
    status?: string;
    limit?: number;
  }): Promise<N8nExecution[]> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params?.workflowId) queryParams.workflowId = params.workflowId;
      if (params?.status) queryParams.status = params.status;
      if (params?.limit) queryParams.limit = params.limit.toString();

      const response = await this.client.get<{ data: N8nExecution[] }>('/executions', queryParams);
      return response.data || [];
    } catch (error) {
      throw handleApiError(error, 'n8n Get Executions');
    }
  }

  async getExecution(executionId: string): Promise<N8nExecution> {
    try {
      return await this.client.get<N8nExecution>(`/executions/${executionId}`);
    } catch (error) {
      throw handleApiError(error, 'n8n Get Execution');
    }
  }

  async deleteExecution(executionId: string): Promise<void> {
    try {
      await this.client.delete(`/executions/${executionId}`);
    } catch (error) {
      throw handleApiError(error, 'n8n Delete Execution');
    }
  }

  async retryExecution(executionId: string): Promise<N8nExecution> {
    try {
      return await this.client.post<N8nExecution>(`/executions/${executionId}/retry`);
    } catch (error) {
      throw handleApiError(error, 'n8n Retry Execution');
    }
  }

  // Webhook Operations
  async triggerWebhook(webhookPath: string, data: any, method: 'GET' | 'POST' = 'POST'): Promise<any> {
    try {
      const webhookUrl = `${API_CONFIG.N8N.webhookUrl}/${webhookPath}`;
      
      if (method === 'GET') {
        const params = new URLSearchParams(data).toString();
        const response = await fetch(`${webhookUrl}?${params}`);
        return await response.json();
      } else {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      }
    } catch (error) {
      throw handleApiError(error, 'n8n Trigger Webhook');
    }
  }

  // Script Generation Workflows
  async generateScript(scriptData: {
    leadInfo: {
      name: string;
      email: string;
      phone: string;
      budget: number;
      interests: string[];
      source: string;
    };
    scriptType: 'discovery' | 'presentation' | 'objection' | 'closing';
    context?: string;
  }): Promise<{ script: string; variables: string[] }> {
    try {
      return await this.triggerWebhook('generate-script', scriptData);
    } catch (error) {
      throw handleApiError(error, 'n8n Generate Script');
    }
  }

  async updateKnowledgeBase(knowledgeData: {
    category: string;
    content: string;
    tags: string[];
    priority: 'high' | 'medium' | 'low';
  }): Promise<any> {
    try {
      return await this.triggerWebhook('update-knowledge-base', knowledgeData);
    } catch (error) {
      throw handleApiError(error, 'n8n Update Knowledge Base');
    }
  }

  async processLeadData(leadData: {
    contactId: string;
    source: string;
    interests: string[];
    budget: number;
    notes?: string;
  }): Promise<any> {
    try {
      return await this.triggerWebhook('process-lead', leadData);
    } catch (error) {
      throw handleApiError(error, 'n8n Process Lead');
    }
  }

  async sendWhatsAppMessage(messageData: {
    phoneNumber: string;
    message: string;
    templateName?: string;
    templateParams?: string[];
  }): Promise<any> {
    try {
      return await this.triggerWebhook('send-whatsapp', messageData);
    } catch (error) {
      throw handleApiError(error, 'n8n Send WhatsApp');
    }
  }

  async scheduleFollowUp(followUpData: {
    contactId: string;
    type: 'call' | 'email' | 'whatsapp';
    scheduledAt: string;
    message?: string;
    assignedTo?: string;
  }): Promise<any> {
    try {
      return await this.triggerWebhook('schedule-followup', followUpData);
    } catch (error) {
      throw handleApiError(error, 'n8n Schedule Follow Up');
    }
  }

  // Analytics and Reporting
  async getWorkflowAnalytics(workflowId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const queryData = {
        workflowId,
        ...params,
      };
      
      return await this.triggerWebhook('workflow-analytics', queryData);
    } catch (error) {
      throw handleApiError(error, 'n8n Get Analytics');
    }
  }

  // AI Integration Workflows
  async analyzeCallTranscript(transcriptData: {
    callId: string;
    transcript: string;
    leadInfo: any;
  }): Promise<{
    sentiment: string;
    keyTopics: string[];
    nextAction: string;
    score: number;
  }> {
    try {
      return await this.triggerWebhook('analyze-call', transcriptData);
    } catch (error) {
      throw handleApiError(error, 'n8n Analyze Call');
    }
  }

  async generateLeadScore(leadData: {
    contactId: string;
    interactions: any[];
    demographics: any;
    behavior: any;
  }): Promise<{ score: number; factors: string[]; recommendations: string[] }> {
    try {
      return await this.triggerWebhook('lead-scoring', leadData);
    } catch (error) {
      throw handleApiError(error, 'n8n Lead Scoring');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getWorkflows();
      return true;
    } catch (error) {
      console.error('n8n Connection test failed:', error);
      return false;
    }
  }

  // Utility methods
  async executeWorkflow(workflowId: string, inputData?: any): Promise<N8nExecution> {
    try {
      const payload = {
        workflowId,
        data: inputData || {},
      };

      return await this.client.post<N8nExecution>('/workflows/run', payload);
    } catch (error) {
      throw handleApiError(error, 'n8n Execute Workflow');
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<{ active: boolean; lastExecution?: N8nExecution }> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      const executions = await this.getExecutions({ workflowId, limit: 1 });
      
      return {
        active: workflow.active,
        lastExecution: executions[0] || undefined,
      };
    } catch (error) {
      throw handleApiError(error, 'n8n Get Workflow Status');
    }
  }
}

export const n8nService = new N8nService();