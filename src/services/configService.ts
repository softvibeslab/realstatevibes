// Configuration management service
interface ApiConfiguration {
  id: string;
  name: string;
  type: 'ghl' | 'n8n' | 'vapi' | 'whatsapp';
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTested?: Date;
  testResult?: boolean;
}

interface WebhookConfiguration {
  id: string;
  name: string;
  service: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string;
  headers?: Record<string, string>;
  secret?: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  totalCalls: number;
  successRate: number;
}

class ConfigService {
  private readonly STORAGE_KEY_APIS = 'real_estate_api_configs';
  private readonly STORAGE_KEY_WEBHOOKS = 'real_estate_webhook_configs';

  // API Configuration Management
  getApiConfigurations(): ApiConfiguration[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_APIS);
      return stored ? JSON.parse(stored) : this.getDefaultApiConfigurations();
    } catch (error) {
      console.error('Error loading API configurations:', error);
      return this.getDefaultApiConfigurations();
    }
  }

  saveApiConfiguration(config: Omit<ApiConfiguration, 'id' | 'createdAt' | 'updatedAt'>): ApiConfiguration {
    const configurations = this.getApiConfigurations();
    const existingIndex = configurations.findIndex(c => c.name === config.name);
    
    const newConfig: ApiConfiguration = {
      ...config,
      id: existingIndex >= 0 ? configurations[existingIndex].id : this.generateId(),
      createdAt: existingIndex >= 0 ? configurations[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      configurations[existingIndex] = newConfig;
    } else {
      configurations.push(newConfig);
    }

    localStorage.setItem(this.STORAGE_KEY_APIS, JSON.stringify(configurations));
    return newConfig;
  }

  updateApiConfiguration(id: string, updates: Partial<ApiConfiguration>): ApiConfiguration | null {
    const configurations = this.getApiConfigurations();
    const index = configurations.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    configurations[index] = {
      ...configurations[index],
      ...updates,
      updatedAt: new Date(),
    };

    localStorage.setItem(this.STORAGE_KEY_APIS, JSON.stringify(configurations));
    return configurations[index];
  }

  deleteApiConfiguration(id: string): boolean {
    const configurations = this.getApiConfigurations();
    const filteredConfigs = configurations.filter(c => c.id !== id);
    
    if (filteredConfigs.length === configurations.length) return false;

    localStorage.setItem(this.STORAGE_KEY_APIS, JSON.stringify(filteredConfigs));
    return true;
  }

  getApiConfiguration(name: string): ApiConfiguration | null {
    const configurations = this.getApiConfigurations();
    return configurations.find(c => c.name === name) || null;
  }

  // Webhook Configuration Management
  getWebhookConfigurations(): WebhookConfiguration[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_WEBHOOKS);
      return stored ? JSON.parse(stored) : this.getDefaultWebhookConfigurations();
    } catch (error) {
      console.error('Error loading webhook configurations:', error);
      return this.getDefaultWebhookConfigurations();
    }
  }

  saveWebhookConfiguration(config: Omit<WebhookConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'totalCalls' | 'successRate'>): WebhookConfiguration {
    const configurations = this.getWebhookConfigurations();
    const existingIndex = configurations.findIndex(c => c.name === config.name);
    
    const newConfig: WebhookConfiguration = {
      ...config,
      id: existingIndex >= 0 ? configurations[existingIndex].id : this.generateId(),
      createdAt: existingIndex >= 0 ? configurations[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
      totalCalls: existingIndex >= 0 ? configurations[existingIndex].totalCalls : 0,
      successRate: existingIndex >= 0 ? configurations[existingIndex].successRate : 100,
    };

    if (existingIndex >= 0) {
      configurations[existingIndex] = newConfig;
    } else {
      configurations.push(newConfig);
    }

    localStorage.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(configurations));
    return newConfig;
  }

  updateWebhookConfiguration(id: string, updates: Partial<WebhookConfiguration>): WebhookConfiguration | null {
    const configurations = this.getWebhookConfigurations();
    const index = configurations.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    configurations[index] = {
      ...configurations[index],
      ...updates,
      updatedAt: new Date(),
    };

    localStorage.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(configurations));
    return configurations[index];
  }

  deleteWebhookConfiguration(id: string): boolean {
    const configurations = this.getWebhookConfigurations();
    const filteredConfigs = configurations.filter(c => c.id !== id);
    
    if (filteredConfigs.length === configurations.length) return false;

    localStorage.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(filteredConfigs));
    return true;
  }

  // Test API Configuration
  async testApiConfiguration(config: ApiConfiguration): Promise<boolean> {
    try {
      // Update environment variables temporarily for testing
      this.updateEnvironmentVariables(config);
      
      let testResult = false;
      
      switch (config.type) {
        case 'ghl':
          const { ghlService } = await import('./ghlService');
          testResult = await ghlService.testConnection();
          break;
        case 'vapi':
          const { vapiService } = await import('./vapiService');
          testResult = await vapiService.testConnection();
          break;
        case 'n8n':
          const { n8nService } = await import('./n8nService');
          testResult = await n8nService.testConnection();
          break;
        case 'whatsapp':
          const { evolutionApiService } = await import('./evolutionApiService');
          testResult = await evolutionApiService.testConnection();
          break;
      }

      // Update test result
      this.updateApiConfiguration(config.id, {
        lastTested: new Date(),
        testResult,
      });

      return testResult;
    } catch (error) {
      console.error('Error testing API configuration:', error);
      this.updateApiConfiguration(config.id, {
        lastTested: new Date(),
        testResult: false,
      });
      return false;
    }
  }

  // Webhook Testing
  async testWebhook(webhook: WebhookConfiguration): Promise<boolean> {
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'real_estate_dashboard',
        data: {
          message: 'Test webhook from Real Estate Dashboard',
        },
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers,
          ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
        },
        body: JSON.stringify(testPayload),
      });

      const success = response.ok;
      
      // Update webhook stats
      this.updateWebhookConfiguration(webhook.id, {
        lastTriggered: new Date(),
        totalCalls: webhook.totalCalls + 1,
        successRate: success 
          ? Math.min(100, webhook.successRate + 1)
          : Math.max(0, webhook.successRate - 1),
      });

      return success;
    } catch (error) {
      console.error('Error testing webhook:', error);
      this.updateWebhookConfiguration(webhook.id, {
        lastTriggered: new Date(),
        totalCalls: webhook.totalCalls + 1,
        successRate: Math.max(0, webhook.successRate - 5),
      });
      return false;
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateEnvironmentVariables(config: ApiConfiguration): void {
    // This would update the runtime environment variables
    // In a real application, this might involve updating a configuration service
    switch (config.type) {
      case 'ghl':
        (window as any).__RUNTIME_CONFIG__ = {
          ...(window as any).__RUNTIME_CONFIG__,
          VITE_GHL_API_KEY: config.config.apiKey,
          VITE_GHL_LOCATION_ID: config.config.locationId,
          VITE_GHL_BASE_URL: config.config.baseUrl,
        };
        break;
      case 'vapi':
        (window as any).__RUNTIME_CONFIG__ = {
          ...(window as any).__RUNTIME_CONFIG__,
          VITE_VAPI_API_KEY: config.config.apiKey,
          VITE_VAPI_ASSISTANT_ID: config.config.assistantId,
          VITE_VAPI_PHONE_NUMBER: config.config.phoneNumber,
          VITE_VAPI_BASE_URL: config.config.baseUrl,
        };
        break;
      case 'n8n':
        (window as any).__RUNTIME_CONFIG__ = {
          ...(window as any).__RUNTIME_CONFIG__,
          VITE_N8N_BASE_URL: config.config.baseUrl,
          VITE_N8N_API_KEY: config.config.apiKey,
          VITE_N8N_WEBHOOK_URL: config.config.webhookUrl,
        };
        break;
      case 'whatsapp':
        (window as any).__RUNTIME_CONFIG__ = {
          ...(window as any).__RUNTIME_CONFIG__,
          VITE_EVOLUTION_API_BASE_URL: config.config.baseUrl,
          VITE_EVOLUTION_API_KEY: config.config.apiKey,
          VITE_EVOLUTION_INSTANCE_NAME: config.config.instanceName,
        };
        break;
    }
  }

  private getDefaultApiConfigurations(): ApiConfiguration[] {
    return [
      {
        id: 'ghl-default',
        name: 'ghl',
        type: 'ghl',
        config: {
          apiKey: import.meta.env.VITE_GHL_API_KEY || '',
          locationId: import.meta.env.VITE_GHL_LOCATION_ID || '',
          baseUrl: import.meta.env.VITE_GHL_BASE_URL || 'https://services.leadconnectorhq.com',
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'vapi-default',
        name: 'vapi',
        type: 'vapi',
        config: {
          apiKey: import.meta.env.VITE_VAPI_API_KEY || '',
          assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
          phoneNumber: import.meta.env.VITE_VAPI_PHONE_NUMBER || '',
          baseUrl: import.meta.env.VITE_VAPI_BASE_URL || 'https://api.vapi.ai',
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'n8n-default',
        name: 'n8n',
        type: 'n8n',
        config: {
          baseUrl: import.meta.env.VITE_N8N_BASE_URL || '',
          apiKey: import.meta.env.VITE_N8N_API_KEY || '',
          webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'whatsapp-default',
        name: 'whatsapp',
        type: 'whatsapp',
        config: {
          type: 'evolution-api',
          baseUrl: import.meta.env.VITE_EVOLUTION_API_BASE_URL || 'http://localhost:8080',
          apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '',
          instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'real_estate',
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getDefaultWebhookConfigurations(): WebhookConfiguration[] {
    const baseUrl = window.location.origin;
    
    return [
      {
        id: 'ghl-leads-webhook',
        name: 'GHL Leads Webhook',
        service: 'ghl',
        url: `${baseUrl}/api/webhooks/ghl/leads`,
        events: ['contact.create', 'contact.update', 'contact.delete'],
        isActive: true,
        description: 'Recibe notificaciones cuando se crean, actualizan o eliminan contactos en GoHighLevel',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCalls: 1247,
        successRate: 98.5,
      },
      {
        id: 'ghl-appointments-webhook',
        name: 'GHL Appointments Webhook',
        service: 'ghl',
        url: `${baseUrl}/api/webhooks/ghl/appointments`,
        events: ['appointment.create', 'appointment.update', 'appointment.cancel'],
        isActive: true,
        description: 'Sincroniza citas y eventos del calendario de GoHighLevel',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCalls: 892,
        successRate: 99.1,
      },
      {
        id: 'vapi-calls-webhook',
        name: 'VAPI Call Events Webhook',
        service: 'vapi',
        url: `${baseUrl}/api/webhooks/vapi/calls`,
        events: ['call.started', 'call.ended', 'call.transcript'],
        isActive: true,
        description: 'Procesa eventos de llamadas VAPI y transcripciones',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCalls: 456,
        successRate: 97.8,
      },
      {
        id: 'whatsapp-messages-webhook',
        name: 'WhatsApp Messages Webhook',
        service: 'whatsapp',
        url: `${baseUrl}/api/webhooks/whatsapp/messages`,
        events: ['message.received', 'message.sent', 'message.status'],
        isActive: true,
        description: 'Procesa mensajes entrantes y salientes de WhatsApp',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCalls: 1567,
        successRate: 99.3,
      },
    ];
  }

  // Export/Import configurations
  exportConfigurations(): string {
    const data = {
      apis: this.getApiConfigurations(),
      webhooks: this.getWebhookConfigurations(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return JSON.stringify(data, null, 2);
  }

  importConfigurations(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.apis || !data.webhooks) {
        return { success: false, message: 'Formato de archivo inválido' };
      }

      // Backup current configurations
      const currentApis = this.getApiConfigurations();
      const currentWebhooks = this.getWebhookConfigurations();

      try {
        // Import APIs
        localStorage.setItem(this.STORAGE_KEY_APIS, JSON.stringify(data.apis));
        
        // Import Webhooks
        localStorage.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(data.webhooks));
        
        return { success: true, message: 'Configuraciones importadas exitosamente' };
      } catch (error) {
        // Restore backup on error
        localStorage.setItem(this.STORAGE_KEY_APIS, JSON.stringify(currentApis));
        localStorage.setItem(this.STORAGE_KEY_WEBHOOKS, JSON.stringify(currentWebhooks));
        
        return { success: false, message: 'Error al importar configuraciones' };
      }
    } catch (error) {
      return { success: false, message: 'Archivo JSON inválido' };
    }
  }

  // Reset to defaults
  resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY_APIS);
    localStorage.removeItem(this.STORAGE_KEY_WEBHOOKS);
  }
}

export const configService = new ConfigService();
export type { ApiConfiguration, WebhookConfiguration };