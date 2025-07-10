import { ApiClient, API_CONFIG, handleApiError } from './api';
import { Lead, Meeting } from '../types';

class GHLService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_CONFIG.GHL.baseUrl, {
      'Authorization': `Bearer ${API_CONFIG.GHL.apiKey}`,
      'Version': '2021-07-28', // Required version header for GoHighLevel API
    });
  }

  // Leads Management
  async getLeads(params?: {
    limit?: number;
    offset?: number;
    query?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ leads: any[], total: number }> {
    try {
      const queryParams = {
        locationId: API_CONFIG.GHL.locationId,
        limit: params?.limit?.toString() || '50',
        offset: params?.offset?.toString() || '0',
        ...(params?.query && { query: params.query }),
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate }),
      };

      const response = await this.client.get<any>('/contacts/', queryParams);
      
      return {
        leads: response.contacts || [],
        total: response.total || 0
      };
    } catch (error) {
      throw handleApiError(error, 'GHL Get Leads');
    }
  }

  async createLead(leadData: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    source?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }): Promise<any> {
    try {
      const payload = {
        locationId: API_CONFIG.GHL.locationId,
        firstName: leadData.firstName,
        lastName: leadData.lastName || '',
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source || 'Manual',
        tags: leadData.tags || [],
        customFields: leadData.customFields || {},
      };

      return await this.client.post<any>('/contacts/', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Create Lead');
    }
  }

  async updateLead(contactId: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  }): Promise<any> {
    try {
      return await this.client.put<any>(`/contacts/${contactId}`, updateData);
    } catch (error) {
      throw handleApiError(error, 'GHL Update Lead');
    }
  }

  async deleteLead(contactId: string): Promise<void> {
    try {
      await this.client.delete(`/contacts/${contactId}`);
    } catch (error) {
      throw handleApiError(error, 'GHL Delete Lead');
    }
  }

  // Pipeline Management
  async getPipelines(): Promise<any[]> {
    try {
      const response = await this.client.get<any>(`/opportunities/pipelines`, {
        locationId: API_CONFIG.GHL.locationId
      });
      return response.pipelines || [];
    } catch (error) {
      throw handleApiError(error, 'GHL Get Pipelines');
    }
  }

  async updateLeadStage(contactId: string, pipelineId: string, stageId: string): Promise<any> {
    try {
      const payload = {
        contactId,
        pipelineId,
        stageId,
        locationId: API_CONFIG.GHL.locationId,
      };

      return await this.client.post<any>('/opportunities/', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Update Lead Stage');
    }
  }

  // Calendar/Meetings Management
  async getCalendars(): Promise<any[]> {
    try {
      const response = await this.client.get<any>('/calendars/', {
        locationId: API_CONFIG.GHL.locationId
      });
      return response.calendars || [];
    } catch (error) {
      throw handleApiError(error, 'GHL Get Calendars');
    }
  }

  async getAppointments(params?: {
    calendarId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const queryParams = {
        locationId: API_CONFIG.GHL.locationId,
        ...(params?.calendarId && { calendarId: params.calendarId }),
        ...(params?.startDate && { startDate: params.startDate }),
        ...(params?.endDate && { endDate: params.endDate }),
      };

      const response = await this.client.get<any>('/calendars/events', queryParams);
      return response.events || [];
    } catch (error) {
      throw handleApiError(error, 'GHL Get Appointments');
    }
  }

  async createAppointment(appointmentData: {
    calendarId: string;
    contactId: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
  }): Promise<any> {
    try {
      const payload = {
        locationId: API_CONFIG.GHL.locationId,
        calendarId: appointmentData.calendarId,
        contactId: appointmentData.contactId,
        title: appointmentData.title,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        description: appointmentData.description || '',
        location: appointmentData.location || '',
      };

      return await this.client.post<any>('/calendars/events', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Create Appointment');
    }
  }

  async updateAppointment(eventId: string, updateData: {
    title?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    location?: string;
  }): Promise<any> {
    try {
      return await this.client.put<any>(`/calendars/events/${eventId}`, updateData);
    } catch (error) {
      throw handleApiError(error, 'GHL Update Appointment');
    }
  }

  async deleteAppointment(eventId: string): Promise<void> {
    try {
      await this.client.delete(`/calendars/events/${eventId}`);
    } catch (error) {
      throw handleApiError(error, 'GHL Delete Appointment');
    }
  }

  // Notes and Activities
  async addNote(contactId: string, note: string): Promise<any> {
    try {
      const payload = {
        contactId,
        body: note,
        userId: 'system', // You might want to use actual user ID
      };

      return await this.client.post<any>('/contacts/notes', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Add Note');
    }
  }

  // Tags Management
  async addTagsToContact(contactId: string, tags: string[]): Promise<any> {
    try {
      const payload = {
        contactId,
        tags,
      };

      return await this.client.post<any>('/contacts/tags', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Add Tags');
    }
  }

  async removeTagsFromContact(contactId: string, tags: string[]): Promise<any> {
    try {
      const payload = {
        contactId,
        tags,
      };

      return await this.client.delete(`/contacts/tags`);
    } catch (error) {
      throw handleApiError(error, 'GHL Remove Tags');
    }
  }

  // Custom Fields
  async getCustomFields(): Promise<any[]> {
    try {
      const response = await this.client.get<any>('/custom-fields/', {
        locationId: API_CONFIG.GHL.locationId
      });
      return response.customFields || [];
    } catch (error) {
      throw handleApiError(error, 'GHL Get Custom Fields');
    }
  }

  // Webhooks
  async createWebhook(webhookData: {
    url: string;
    events: string[];
  }): Promise<any> {
    try {
      const payload = {
        locationId: API_CONFIG.GHL.locationId,
        url: webhookData.url,
        events: webhookData.events,
      };

      return await this.client.post<any>('/webhooks/', payload);
    } catch (error) {
      throw handleApiError(error, 'GHL Create Webhook');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/locations/' + API_CONFIG.GHL.locationId);
      return true;
    } catch (error) {
      console.error('GHL Connection test failed:', error);
      return false;
    }
  }
}

export const ghlService = new GHLService();