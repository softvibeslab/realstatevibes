import { ApiClient, handleApiError } from './api';

interface EvolutionApiConfig {
  baseUrl: string;
  apiKey: string;
  instanceName: string;
}

interface QRCodeResponse {
  base64: string;
  code: string;
  count: number;
}

interface InstanceInfo {
  instance: {
    instanceName: string;
    status: 'open' | 'close' | 'connecting';
  };
  hash?: {
    apikey: string;
  };
  webhook?: {
    webhook: string;
    events: string[];
  };
  websocket?: {
    enabled: boolean;
    events: string[];
  };
}

interface ConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}

interface WhatsAppMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
    imageMessage?: {
      url: string;
      caption?: string;
    };
    documentMessage?: {
      url: string;
      fileName: string;
      caption?: string;
    };
  };
  messageTimestamp: number;
  status: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ';
}

class EvolutionApiService {
  private client: ApiClient;
  private config: EvolutionApiConfig;

  constructor(config: EvolutionApiConfig) {
    this.config = config;
    this.client = new ApiClient(config.baseUrl, {
      'apikey': config.apiKey,
      'Content-Type': 'application/json',
    });
  }

  // Instance Management
  async createInstance(instanceName: string, token?: string): Promise<InstanceInfo> {
    try {
      const payload = {
        instanceName,
        token: token || this.config.apiKey,
        qrcode: true,
        markMessagesRead: true,
        delayMessage: 1000,
        msgRetryCounterValue: 3,
        longConnection: true,
        markOnlineOnConnect: true,
        browserName: 'Chrome',
        browserVersion: '120.0.0.0',
      };

      return await this.client.post<InstanceInfo>('/instance/create', payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Create Instance');
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.client.delete(`/instance/delete/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Delete Instance');
    }
  }

  async getInstanceInfo(instanceName: string): Promise<InstanceInfo> {
    try {
      return await this.client.get<InstanceInfo>(`/instance/fetchInstances/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Instance Info');
    }
  }

  async restartInstance(instanceName: string): Promise<InstanceInfo> {
    try {
      return await this.client.put<InstanceInfo>(`/instance/restart/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Restart Instance');
    }
  }

  async logoutInstance(instanceName: string): Promise<void> {
    try {
      await this.client.delete(`/instance/logout/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Logout Instance');
    }
  }

  // QR Code Management
  async generateQRCode(instanceName: string): Promise<QRCodeResponse> {
    try {
      return await this.client.get<QRCodeResponse>(`/instance/connect/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Generate QR Code');
    }
  }

  async getConnectionState(instanceName: string): Promise<ConnectionState> {
    try {
      return await this.client.get<ConnectionState>(`/instance/connectionState/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Connection State');
    }
  }

  // Message Sending
  async sendTextMessage(instanceName: string, number: string, text: string): Promise<any> {
    try {
      const payload = {
        number: number.replace(/\D/g, ''), // Remove non-digits
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false,
        },
        textMessage: {
          text: text,
        },
      };

      return await this.client.post(`/message/sendText/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Send Text Message');
    }
  }

  async sendMediaMessage(
    instanceName: string,
    number: string,
    mediaUrl: string,
    mediaType: 'image' | 'document' | 'audio' | 'video',
    caption?: string,
    fileName?: string
  ): Promise<any> {
    try {
      const payload = {
        number: number.replace(/\D/g, ''),
        options: {
          delay: 1200,
          presence: 'composing',
        },
        mediaMessage: {
          mediatype: mediaType,
          media: mediaUrl,
          ...(caption && { caption }),
          ...(fileName && { fileName }),
        },
      };

      return await this.client.post(`/message/sendMedia/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Send Media Message');
    }
  }

  async sendLocationMessage(
    instanceName: string,
    number: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ): Promise<any> {
    try {
      const payload = {
        number: number.replace(/\D/g, ''),
        options: {
          delay: 1200,
          presence: 'composing',
        },
        locationMessage: {
          latitude,
          longitude,
          name: name || 'Ubicación',
          address: address || '',
        },
      };

      return await this.client.post(`/message/sendLocation/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Send Location Message');
    }
  }

  async sendContactMessage(
    instanceName: string,
    number: string,
    contactName: string,
    contactNumber: string
  ): Promise<any> {
    try {
      const payload = {
        number: number.replace(/\D/g, ''),
        options: {
          delay: 1200,
          presence: 'composing',
        },
        contactMessage: [
          {
            fullName: contactName,
            wuid: contactNumber.replace(/\D/g, ''),
            phoneNumber: contactNumber.replace(/\D/g, ''),
          },
        ],
      };

      return await this.client.post(`/message/sendContact/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Send Contact Message');
    }
  }

  // Bulk Messaging
  async sendBulkMessages(
    instanceName: string,
    messages: Array<{
      number: string;
      text: string;
      delay?: number;
    }>
  ): Promise<any[]> {
    try {
      const results = [];
      
      for (const message of messages) {
        const result = await this.sendTextMessage(instanceName, message.number, message.text);
        results.push(result);
        
        // Add delay between messages to avoid rate limiting
        if (message.delay || 2000) {
          await new Promise(resolve => setTimeout(resolve, message.delay || 2000));
        }
      }
      
      return results;
    } catch (error) {
      throw handleApiError(error, 'Evolution API Send Bulk Messages');
    }
  }

  // Chat Management
  async getChatHistory(instanceName: string, number: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      const payload = {
        where: {
          key: {
            remoteJid: number.replace(/\D/g, '') + '@s.whatsapp.net',
          },
        },
        limit,
      };

      const response = await this.client.post<{ message: WhatsAppMessage[] }>(
        `/chat/findMessages/${instanceName}`,
        payload
      );
      
      return response.message || [];
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Chat History');
    }
  }

  async markMessageAsRead(instanceName: string, messageKey: any): Promise<void> {
    try {
      const payload = {
        readMessages: [messageKey],
      };

      await this.client.put(`/chat/markMessageAsRead/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Mark Message Read');
    }
  }

  async deleteMessage(instanceName: string, messageKey: any): Promise<void> {
    try {
      const payload = {
        id: messageKey.id,
        fromMe: messageKey.fromMe,
        remoteJid: messageKey.remoteJid,
      };

      await this.client.delete(`/message/delete/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Delete Message');
    }
  }

  // Group Management
  async createGroup(instanceName: string, groupName: string, participants: string[]): Promise<any> {
    try {
      const payload = {
        subject: groupName,
        participants: participants.map(p => p.replace(/\D/g, '') + '@s.whatsapp.net'),
      };

      return await this.client.post(`/group/create/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Create Group');
    }
  }

  async addParticipantsToGroup(instanceName: string, groupId: string, participants: string[]): Promise<any> {
    try {
      const payload = {
        groupJid: groupId,
        participants: participants.map(p => p.replace(/\D/g, '') + '@s.whatsapp.net'),
      };

      return await this.client.put(`/group/updateParticipant/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Add Participants');
    }
  }

  // Webhook Management
  async setWebhook(instanceName: string, webhookUrl: string, events: string[]): Promise<any> {
    try {
      const payload = {
        url: webhookUrl,
        enabled: true,
        events: events,
      };

      return await this.client.post(`/webhook/set/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Set Webhook');
    }
  }

  async getWebhook(instanceName: string): Promise<any> {
    try {
      return await this.client.get(`/webhook/find/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Webhook');
    }
  }

  // Profile Management
  async getProfile(instanceName: string): Promise<any> {
    try {
      return await this.client.get(`/chat/fetchProfile/${instanceName}`);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Profile');
    }
  }

  async updateProfileName(instanceName: string, name: string): Promise<any> {
    try {
      const payload = { name };
      return await this.client.put(`/chat/updateProfileName/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Update Profile Name');
    }
  }

  async updateProfileStatus(instanceName: string, status: string): Promise<any> {
    try {
      const payload = { status };
      return await this.client.put(`/chat/updateProfileStatus/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Update Profile Status');
    }
  }

  // Utility Methods
  async checkNumberExists(instanceName: string, numbers: string[]): Promise<any> {
    try {
      const payload = {
        numbers: numbers.map(n => n.replace(/\D/g, '')),
      };

      return await this.client.post(`/chat/whatsappNumbers/${instanceName}`, payload);
    } catch (error) {
      throw handleApiError(error, 'Evolution API Check Numbers');
    }
  }

  async getContacts(instanceName: string): Promise<any[]> {
    try {
      const response = await this.client.get<{ response: any[] }>(`/chat/findContacts/${instanceName}`);
      return response.response || [];
    } catch (error) {
      throw handleApiError(error, 'Evolution API Get Contacts');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/instance/fetchInstances');
      return true;
    } catch (error) {
      console.error('Evolution API Connection test failed:', error);
      return false;
    }
  }

  // Common use cases for real estate
  async sendWelcomeMessage(instanceName: string, number: string, customerName: string): Promise<any> {
    const message = `¡Hola ${customerName}! 👋

Gracias por tu interés en Selva Dentro Tulum. Soy tu asesor personal y estoy aquí para ayudarte a encontrar la propiedad perfecta.

🏝️ *Selva Dentro Tulum* - Donde la naturaleza se encuentra con el lujo

¿Te gustaría que te envíe información sobre nuestros desarrollos disponibles?`;

    return await this.sendTextMessage(instanceName, number, message);
  }

  async sendPropertyInfo(instanceName: string, number: string, propertyType: string, budget: number): Promise<any> {
    const message = `🏡 *Información de Propiedades*

Basado en tu interés en *${propertyType}* con presupuesto de *$${budget.toLocaleString()} MXN*, tenemos excelentes opciones para ti:

✨ *Características destacadas:*
• Ubicación privilegiada en Tulum
• Amenidades de lujo
• ROI garantizado
• Entrega inmediata

¿Te gustaría agendar una presentación virtual para conocer más detalles?`;

    return await this.sendTextMessage(instanceName, number, message);
  }

  async sendAppointmentReminder(
    instanceName: string,
    number: string,
    customerName: string,
    appointmentDate: string,
    appointmentTime: string,
    meetingLink?: string
  ): Promise<any> {
    const message = `📅 *Recordatorio de Cita*

Hola ${customerName}, te recordamos tu cita programada:

🗓️ *Fecha:* ${appointmentDate}
⏰ *Hora:* ${appointmentTime}
${meetingLink ? `🔗 *Link:* ${meetingLink}` : '📍 *Ubicación:* Oficina de Ventas Tulum'}

¡Te esperamos! Si necesitas reagendar, por favor avísanos con anticipación.`;

    return await this.sendTextMessage(instanceName, number, message);
  }

  async sendFollowUp(instanceName: string, number: string, customerName: string, lastInteraction: string): Promise<any> {
    const message = `👋 Hola ${customerName},

Espero que estés muy bien. Quería hacer seguimiento después de ${lastInteraction}.

¿Has tenido oportunidad de revisar la información que te compartí sobre Selva Dentro Tulum?

Estoy aquí para resolver cualquier duda que puedas tener y ayudarte en tu proceso de decisión.

¿Cuándo sería un buen momento para platicar?`;

    return await this.sendTextMessage(instanceName, number, message);
  }

  async sendBrochure(instanceName: string, number: string, brochureUrl: string, propertyName: string): Promise<any> {
    const caption = `📋 *Brochure - ${propertyName}*

Aquí tienes toda la información detallada sobre este increíble desarrollo.

¡Revísalo y cuéntame qué te parece! 🏝️✨`;

    return await this.sendMediaMessage(instanceName, number, brochureUrl, 'document', caption, `${propertyName}_Brochure.pdf`);
  }
}

// Default configuration from environment variables
const defaultConfig: EvolutionApiConfig = {
  baseUrl: import.meta.env.VITE_EVOLUTION_API_BASE_URL || 'http://localhost:8080',
  apiKey: import.meta.env.VITE_EVOLUTION_API_KEY || '',
  instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'selvadentro',
};

export const evolutionApiService = new EvolutionApiService(defaultConfig);
export { EvolutionApiService };
export type { EvolutionApiConfig, QRCodeResponse, InstanceInfo, ConnectionState, WhatsAppMessage };