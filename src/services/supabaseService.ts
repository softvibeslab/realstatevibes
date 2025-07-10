import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { Lead, Meeting, Call, SalesScript, User } from '../types';
import { format } from 'date-fns';

type Tables = Database['public']['Tables'];

class SupabaseService {
  // Leads Management
  async getLeads(): Promise<Lead[]> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformLead);
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'interactions' | 'scheduledMeetings'>): Promise<Lead> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          priority: lead.priority,
          assigned_to: lead.assignedTo,
          next_action: lead.nextAction,
          next_action_date: lead.nextActionDate.toISOString(),
          budget: lead.budget,
          interests: lead.interests,
          notes: lead.notes,
          ai_analysis: lead.aiAnalysis,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformLead(data);
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.source) updateData.source = updates.source;
      if (updates.status) updateData.status = updates.status;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.nextAction) updateData.next_action = updates.nextAction;
      if (updates.nextActionDate) updateData.next_action_date = updates.nextActionDate.toISOString();
      if (updates.budget !== undefined) updateData.budget = updates.budget;
      if (updates.interests) updateData.interests = updates.interests;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.aiAnalysis) updateData.ai_analysis = updates.aiAnalysis;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.transformLead(data);
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async deleteLead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Meetings Management
  async getMeetings(): Promise<Meeting[]> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      return data.map(this.transformMeeting);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  async createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: meeting.title,
          date: meeting.date.toISOString(),
          duration: meeting.duration,
          type: meeting.type,
          status: meeting.status,
          attendees: meeting.attendees,
          notes: meeting.notes || '',
          lead_id: meeting.leadId || '',
          ghl_event_id: meeting.ghlEventId || '',
          zoom_link: meeting.zoomLink || '',
          reminder_sent: meeting.reminderSent || false,
          location: meeting.location || '',
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformMeeting(data);
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.date) updateData.date = updates.date.toISOString();
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.type) updateData.type = updates.type;
      if (updates.status) updateData.status = updates.status;
      if (updates.attendees) updateData.attendees = updates.attendees;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.leadId) updateData.lead_id = updates.leadId;
      if (updates.ghlEventId) updateData.ghl_event_id = updates.ghlEventId;
      if (updates.zoomLink) updateData.zoom_link = updates.zoomLink;
      if (updates.reminderSent !== undefined) updateData.reminder_sent = updates.reminderSent;
      if (updates.location) updateData.location = updates.location;

      const { data, error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.transformMeeting(data);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Calls Management
  async getCalls(): Promise<Call[]> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformCall);
    } catch (error) {
      console.error('Error fetching calls:', error);
      throw error;
    }
  }

  async createCall(call: Omit<Call, 'id'>): Promise<Call> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          lead_id: call.leadId,
          type: call.type,
          status: call.status,
          start_time: call.startTime?.toISOString(),
          end_time: call.endTime?.toISOString(),
          scheduled_time: call.scheduledTime?.toISOString(),
          duration: call.duration,
          outcome: call.outcome,
          notes: call.notes || '',
          recording_url: call.recordingUrl || '',
          assigned_to: call.assignedTo,
          ai_analysis: call.aiAnalysis,
          vapi_call_id: call.vapiCallId,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformCall(data);
    } catch (error) {
      console.error('Error creating call:', error);
      throw error;
    }
  }

  // Scripts Management
  async getScripts(): Promise<SalesScript[]> {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformScript);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      throw error;
    }
  }

  async createScript(script: Omit<SalesScript, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalesScript> {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .insert({
          name: script.name,
          type: script.type,
          content: script.content,
          variables: script.variables,
          is_active: script.isActive,
          usage: script.usage,
          effectiveness: script.effectiveness,
          ai_generated: script.aiGenerated,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformScript(data);
    } catch (error) {
      console.error('Error creating script:', error);
      throw error;
    }
  }

  // Users Management
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.transformUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Authentication
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, userData: { name: string; role?: string }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
          }
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async updateUserPassword(password: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  // User management
  async createUserProfile(userData: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    permissions?: string[];
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          permissions: userData.permissions || ['leads:read', 'leads:write', 'meetings:read', 'meetings:write']
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformUser(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(id: string, updates: Partial<User>) {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.role) updateData.role = updates.role;
      if (updates.avatar) updateData.avatar = updates.avatar;
      if (updates.permissions) updateData.permissions = updates.permissions;
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformUser(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Advanced queries using the new functions
  async getUserPointsSummary(userId: string, month?: number, year?: number) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_points_summary', {
          user_uuid: userId,
          target_month: month,
          target_year: year
        });

      if (error) throw error;
      return data[0] || { total_points: 0, monthly_points: 0, activity_breakdown: {}, rank_position: 0 };
    } catch (error) {
      console.error('Error fetching user points summary:', error);
      throw error;
    }
  }

  async getLeaderboard(month?: number, year?: number, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard', {
          target_month: month,
          target_year: year,
          limit_count: limit
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    actionUrl?: string,
    metadata?: any
  ) {
    try {
      const { data, error } = await supabase
        .rpc('create_notification', {
          target_user_id: userId,
          notification_title: title,
          notification_message: message,
          notification_type: type,
          action_url: actionUrl,
          metadata: metadata || {}
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Performance and Analytics
  async getUserPerformanceSummary() {
    try {
      const { data, error } = await supabase
        .from('user_performance_summary')
        .select('*')
        .order('monthly_points', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user performance summary:', error);
      throw error;
    }
  }

  async getPipelineSummary() {
    try {
      const { data, error } = await supabase
        .from('pipeline_summary')
        .select('*')
        .order('order_position');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pipeline summary:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(userId: string, unreadOnly: boolean = false) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Automations
  async getAutomations() {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching automations:', error);
      throw error;
    }
  }

  async toggleAutomation(automationId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('automations')
        .update({ is_active: isActive })
        .eq('id', automationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling automation:', error);
      throw error;
    }
  }

  // Integrations
  async getIntegrations() {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  }

  async updateIntegrationStatus(integrationId: string, status: string, errorMessage?: string) {
    try {
      const updateData: any = { 
        status, 
        last_sync: new Date().toISOString() 
      };
      
      if (errorMessage) {
        updateData.error_message = errorMessage;
        updateData.retry_count = supabase.raw('retry_count + 1');
      } else {
        updateData.error_message = null;
        updateData.retry_count = 0;
      }

      const { error } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', integrationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating integration status:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Intentar una consulta simple para probar la conexión
      const { data, error } = await supabase.from('users').select('count');
      
      if (error) {
        console.error('Error de conexión a Supabase:', error);
        return false;
      }

      console.log('Conexión a Supabase exitosa:', data);
      return true;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }

  // Función para inicializar datos demo si no existen
  async initializeDemoDataIfNeeded() {
    try {
      // Verificar si ya existen usuarios
      const { data: existingUsers, error: usersError } = await supabase
        .from('users')
        .select('count');
      
      if (usersError) throw usersError;
      
      // Si no hay usuarios, crear datos demo
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No se encontraron usuarios, inicializando datos demo...');
        
        // Crear usuarios demo
        const demoUsers = [
          {
            name: 'Mafer',
            email: 'mafer@real_estate.com',
            role: 'broker',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
            is_active: true
          },
          {
            name: 'Admin',
            email: 'admin@softvibes.com',
            role: 'admin',
            avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            permissions: ['*'],
            is_active: true
          }
        ];
        
        for (const user of demoUsers) {
          const { error } = await supabase.from('users').insert(user);
          if (error) console.error('Error creando usuario demo:', error);
        }
        
        console.log('Datos demo inicializados correctamente');
      }
    } catch (error) {
      console.error('Error inicializando datos demo:', error);
    }
  }

  // Transform functions to convert database rows to application types
  private transformLead(data: Tables['leads']['Row']): Lead {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: data.source,
      status: data.status as any,
      priority: data.priority as any,
      assignedTo: data.assigned_to,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      nextAction: data.next_action,
      nextActionDate: new Date(data.next_action_date),
      budget: data.budget,
      interests: data.interests,
      notes: data.notes,
      aiAnalysis: data.ai_analysis,
      interactions: [], // These would be loaded separately
      scheduledMeetings: [], // These would be loaded separately
    };
  }

  private transformMeeting(data: Tables['meetings']['Row']): Meeting {
    return {
      id: data.id,
      title: data.title,
      date: new Date(data.date),
      duration: data.duration,
      type: data.type as any,
      status: data.status as any,
      attendees: data.attendees,
      notes: data.notes,
      leadId: data.lead_id,
      ghlEventId: data.ghl_event_id,
      zoomLink: data.zoom_link,
      reminderSent: data.reminder_sent,
      location: data.location,
    };
  }

  private transformCall(data: Tables['calls']['Row']): Call {
    return {
      id: data.id,
      leadId: data.lead_id,
      type: data.type as any,
      status: data.status as any,
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      scheduledTime: data.scheduled_time ? new Date(data.scheduled_time) : undefined,
      duration: data.duration,
      outcome: data.outcome as any,
      notes: data.notes,
      recordingUrl: data.recording_url,
      assignedTo: data.assigned_to,
      aiAnalysis: data.ai_analysis,
      vapiCallId: data.vapi_call_id,
    };
  }

  private transformScript(data: Tables['scripts']['Row']): SalesScript {
    return {
      id: data.id,
      name: data.name,
      type: data.type as any,
      content: data.content,
      variables: data.variables,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      usage: data.usage,
      effectiveness: data.effectiveness,
      aiGenerated: data.ai_generated,
    };
  }

  private transformUser(data: Tables['users']['Row']): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as 'broker' | 'admin',
      avatar: data.avatar,
      permissions: data.permissions,
      is_active: data.is_active
    };
  }
}

export const supabaseService = new SupabaseService();