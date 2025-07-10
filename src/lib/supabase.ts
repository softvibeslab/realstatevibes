import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evolutionvibes-selvadentro.gwhncw.easypanel.host/';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (you can generate these from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          source: string;
          status: string;
          priority: string;
          assigned_to: string;
          created_at: string;
          updated_at: string;
          next_action: string;
          next_action_date: string;
          budget: number;
          interests: string[];
          notes: string;
          ai_analysis: any;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          source: string;
          status?: string;
          priority?: string;
          assigned_to: string;
          created_at?: string;
          updated_at?: string;
          next_action?: string;
          next_action_date?: string;
          budget?: number;
          interests?: string[];
          notes?: string;
          ai_analysis?: any;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          source?: string;
          status?: string;
          priority?: string;
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
          next_action?: string;
          next_action_date?: string;
          budget?: number;
          interests?: string[];
          notes?: string;
          ai_analysis?: any;
        };
      };
      meetings: {
        Row: {
          id: string;
          title: string;
          date: string;
          duration: number;
          type: string;
          status: string;
          attendees: string[];
          notes: string;
          lead_id: string;
          ghl_event_id: string;
          zoom_link: string;
          reminder_sent: boolean;
          location: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          duration: number;
          type: string;
          status?: string;
          attendees: string[];
          notes?: string;
          lead_id?: string;
          ghl_event_id?: string;
          zoom_link?: string;
          reminder_sent?: boolean;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          duration?: number;
          type?: string;
          status?: string;
          attendees?: string[];
          notes?: string;
          lead_id?: string;
          ghl_event_id?: string;
          zoom_link?: string;
          reminder_sent?: boolean;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          lead_id: string;
          type: string;
          status: string;
          start_time: string;
          end_time: string;
          scheduled_time: string;
          duration: number;
          outcome: string;
          notes: string;
          recording_url: string;
          assigned_to: string;
          ai_analysis: any;
          vapi_call_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          type: string;
          status?: string;
          start_time?: string;
          end_time?: string;
          scheduled_time?: string;
          duration?: number;
          outcome?: string;
          notes?: string;
          recording_url?: string;
          assigned_to: string;
          ai_analysis?: any;
          vapi_call_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          type?: string;
          status?: string;
          start_time?: string;
          end_time?: string;
          scheduled_time?: string;
          duration?: number;
          outcome?: string;
          notes?: string;
          recording_url?: string;
          assigned_to?: string;
          ai_analysis?: any;
          vapi_call_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scripts: {
        Row: {
          id: string;
          name: string;
          type: string;
          content: string;
          variables: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
          usage: number;
          effectiveness: number;
          ai_generated: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          content: string;
          variables?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          usage?: number;
          effectiveness?: number;
          ai_generated?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          content?: string;
          variables?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          usage?: number;
          effectiveness?: number;
          ai_generated?: boolean;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          avatar: string;
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: string;
          avatar?: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          avatar?: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}