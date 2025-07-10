import { ApiClient, API_CONFIG, handleApiError } from './api';

interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  content: {
    text?: string;
    template?: {
      name: string;
      language: string;
      components: any[];
    };
    media?: {
      url: string;
      caption?: string;
    };
  };
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  components: any[];
}

class WhatsAppService {
  private client: ApiClient;
  private phoneNumberId: string;

  constructor() {
    this.client = new ApiClient(API_CONFIG.WHATSAPP.baseUrl, {
      'Authorization': `Bearer ${API_CONFIG.WHATSAPP.accessToken}`,
    });
    this.phoneNumberId = API_CONFIG.WHATSAPP.phoneNumberId || '';
  }

  // Message Sending
  async sendTextMessage(to: string, text: string): Promise<{ id: string }> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove non-digits
        type: 'text',
        text: {
          body: text,
        },
      };

      const response = await this.client.post<{ messages: Array<{ id: string }> }>(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      return { id: response.messages[0].id };
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Text Message');
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'es_MX',
    components?: any[]
  ): Promise<{ id: string }> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components || [],
        },
      };

      const response = await this.client.post<{ messages: Array<{ id: string }> }>(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      return { id: response.messages[0].id };
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Template Message');
    }
  }

  async sendMediaMessage(
    to: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    mediaUrl: string,
    caption?: string
  ): Promise<{ id: string }> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          ...(caption && { caption }),
        },
      };

      const response = await this.client.post<{ messages: Array<{ id: string }> }>(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      return { id: response.messages[0].id };
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Media Message');
    }
  }

  // Template Management
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await this.client.get<{ data: WhatsAppTemplate[] }>(
        `/${API_CONFIG.WHATSAPP.businessAccountId}/message_templates`
      );
      return response.data || [];
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Get Templates');
    }
  }

  async createTemplate(templateData: {
    name: string;
    category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
    language: string;
    components: any[];
  }): Promise<WhatsAppTemplate> {
    try {
      return await this.client.post<WhatsAppTemplate>(
        `/${API_CONFIG.WHATSAPP.businessAccountId}/message_templates`,
        templateData
      );
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Create Template');
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.client.delete(`/${API_CONFIG.WHATSAPP.businessAccountId}/message_templates/${templateId}`);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Delete Template');
    }
  }

  // Message Status and Tracking
  async getMessageStatus(messageId: string): Promise<any> {
    try {
      return await this.client.get(`/${messageId}`);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Get Message Status');
    }
  }

  // Webhook handling (for incoming messages)
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      };

      await this.client.post(`/${this.phoneNumberId}/messages`, payload);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Mark Message Read');
    }
  }

  // Business Profile
  async getBusinessProfile(): Promise<any> {
    try {
      return await this.client.get(`/${this.phoneNumberId}`, {
        fields: 'about,address,description,email,profile_picture_url,websites,vertical'
      });
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Get Business Profile');
    }
  }

  async updateBusinessProfile(profileData: {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    websites?: string[];
    vertical?: string;
  }): Promise<any> {
    try {
      return await this.client.post(`/${this.phoneNumberId}`, profileData);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Update Business Profile');
    }
  }

  // Analytics
  async getAnalytics(params?: {
    start?: string;
    end?: string;
    granularity?: 'HOUR' | 'DAY' | 'MONTH';
    metric_types?: string[];
  }): Promise<any> {
    try {
      const queryParams: Record<string, string> = {};
      
      if (params?.start) queryParams.start = params.start;
      if (params?.end) queryParams.end = params.end;
      if (params?.granularity) queryParams.granularity = params.granularity;
      if (params?.metric_types) queryParams.metric_types = params.metric_types.join(',');

      return await this.client.get(`/${this.phoneNumberId}/analytics`, queryParams);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Get Analytics');
    }
  }

  // Utility methods for common use cases
  async sendWelcomeMessage(to: string, customerName: string): Promise<{ id: string }> {
    try {
      return await this.sendTemplateMessage(to, 'welcome_message', 'es_MX', [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: customerName,
            },
          ],
        },
      ]);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Welcome Message');
    }
  }

  async sendAppointmentReminder(
    to: string,
    customerName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<{ id: string }> {
    try {
      return await this.sendTemplateMessage(to, 'appointment_reminder', 'es_MX', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: appointmentDate },
            { type: 'text', text: appointmentTime },
          ],
        },
      ]);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Appointment Reminder');
    }
  }

  async sendFollowUpMessage(to: string, customerName: string, propertyInfo: string): Promise<{ id: string }> {
    try {
      return await this.sendTemplateMessage(to, 'follow_up', 'es_MX', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName },
            { type: 'text', text: propertyInfo },
          ],
        },
      ]);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Follow Up');
    }
  }

  async sendPropertyBrochure(to: string, brochureUrl: string, propertyName: string): Promise<{ id: string }> {
    try {
      return await this.sendMediaMessage(to, 'document', brochureUrl, `Brochure - ${propertyName}`);
    } catch (error) {
      throw handleApiError(error, 'WhatsApp Send Brochure');
    }
  }

  // Bulk messaging
  async sendBulkMessages(messages: Array<{
    to: string;
    type: 'text' | 'template';
    content: string | { templateName: string; components?: any[] };
  }>): Promise<Array<{ to: string; messageId?: string; error?: string }>> {
    const results = await Promise.allSettled(
      messages.map(async (msg) => {
        try {
          let result;
          if (msg.type === 'text') {
            result = await this.sendTextMessage(msg.to, msg.content as string);
          } else {
            const template = msg.content as { templateName: string; components?: any[] };
            result = await this.sendTemplateMessage(msg.to, template.templateName, 'es_MX', template.components);
          }
          return { to: msg.to, messageId: result.id };
        } catch (error) {
          return { to: msg.to, error: (error as Error).message };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { to: messages[index].to, error: result.reason.message };
      }
    });
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getBusinessProfile();
      return true;
    } catch (error) {
      console.error('WhatsApp Connection test failed:', error);
      return false;
    }
  }

  // Webhook verification (for setting up webhooks)
  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    return null;
  }

  // Process incoming webhook data
  static processWebhookData(body: any): {
    messages: any[];
    statuses: any[];
  } {
    const messages: any[] = [];
    const statuses: any[] = [];

    if (body.entry) {
      body.entry.forEach((entry: any) => {
        if (entry.changes) {
          entry.changes.forEach((change: any) => {
            if (change.value) {
              if (change.value.messages) {
                messages.push(...change.value.messages);
              }
              if (change.value.statuses) {
                statuses.push(...change.value.statuses);
              }
            }
          });
        }
      });
    }

    return { messages, statuses };
  }
}

export const whatsappService = new WhatsAppService();