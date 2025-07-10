export interface User {
  id: string;
  name: string;
  email: string;
  role: 'broker' | 'admin';
  avatar: string;
  permissions: string[];
  is_active?: boolean;
  last_login?: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'presentation' | 'booked' | 'sold' | 'lost';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  nextAction: string;
  nextActionDate: Date;
  budget: number;
  interests: string[];
  notes: string;
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    buyingIntent: number;
    keyPoints: string[];
    recommendedScript: string;
    nextBestAction: string;
  };
  interactions: Interaction[];
  scheduledMeetings: Meeting[];
}

export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'presentation';
  date: Date;
  duration?: number;
  notes: string;
  outcome: string;
  nextAction?: string;
  recordingUrl?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  duration: number;
  type: 'zoom' | 'physical' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  attendees: string[];
  notes?: string;
  outcome?: string;
  leadId?: string;
  ghlEventId?: string;
  zoomLink?: string;
  reminderSent?: boolean;
  location?: string;
  leadInfo?: {
    name: string;
    email: string;
    phone: string;
    budget: number;
    interests: string[];
  };
}

export interface Call {
  id: string;
  leadId: string;
  type: 'manual' | 'vapi';
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  scheduledTime?: Date;
  duration?: number;
  outcome?: 'qualified' | 'interested' | 'not-interested' | 'no-answer' | 'callback';
  notes?: string;
  recordingUrl?: string;
  assignedTo: string;
  leadInfo?: {
    name: string;
    email: string;
    phone: string;
    budget: number;
    interests: string[];
  };
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    keyTopics: string[];
    nextAction: string;
    transcription: string;
  };
  vapiCallId?: string | null;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isActive: boolean;
  createdAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  automations: Automation[];
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationAction {
  type: 'email' | 'sms' | 'whatsapp' | 'task' | 'webhook';
  config: Record<string, any>;
  delay?: number;
}

export interface Integration {
  id: string;
  name: 'ghl' | 'n8n' | 'vapi' | 'whatsapp';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync: Date;
}

export interface SalesScript {
  id: string;
  name: string;
  type: 'discovery' | 'presentation' | 'objection' | 'closing';
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usage: number;
  effectiveness: number;
  aiGenerated: boolean;
}

export interface CallScript {
  id: string;
  name: string;
  type: 'opening' | 'discovery' | 'presentation' | 'objection' | 'closing';
  content: string;
  variables: string[];
  isActive: boolean;
  effectiveness: number;
  usage: number;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  category: 'proyecto' | 'financiero' | 'ventas' | 'objeciones' | 'legal';
  content: string;
  tags: string[];
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
  usageCount: number;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    opening: string;
    discovery?: string;
    presentation: string;
    proof?: string;
    closing: string;
  };
  variables: string[];
  category: 'discovery' | 'presentation' | 'objection' | 'closing';
  isActive: boolean;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  totalPoints: number;
  monthlyPoints: number;
  presentations: {
    zoomBroker: number;
    eventBroker: number;
    zoomRealtors: number;
    zoomClient: number;
    physicalBroker: number;
    physicalRealtors: number;
    physicalClient: number;
  };
  results: {
    bookings: number;
    allianceSales: number;
    directSales: number;
  };
  trend: 'up' | 'down' | 'stable';
}