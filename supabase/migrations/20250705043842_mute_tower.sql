-- Este archivo contiene la estructura de tablas para Supabase
-- Nota: Este archivo es solo para referencia y no se ejecutará automáticamente
-- Las tablas ya deben existir en tu instancia de Supabase VPS

-- =============================================
-- TABLA: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'broker' CHECK (role IN ('broker', 'admin')),
    avatar TEXT,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: leads
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'presentation', 'booked', 'sold', 'lost')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    next_action TEXT,
    next_action_date TIMESTAMPTZ,
    budget NUMERIC DEFAULT 0,
    interests TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    ai_analysis JSONB,
    ghl_contact_id TEXT,
    lead_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: meetings
-- =============================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- en minutos
    type TEXT NOT NULL CHECK (type IN ('zoom', 'physical', 'phone')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    attendees TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    outcome TEXT,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ghl_event_id TEXT,
    zoom_link TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    location TEXT DEFAULT '',
    meeting_type TEXT DEFAULT 'presentation' CHECK (meeting_type IN ('discovery', 'presentation', 'follow_up', 'closing')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: calls
-- =============================================
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('manual', 'vapi')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'failed')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    scheduled_time TIMESTAMPTZ,
    duration INTEGER DEFAULT 0, -- en segundos
    outcome TEXT CHECK (outcome IN ('qualified', 'interested', 'not-interested', 'no-answer', 'callback')),
    notes TEXT DEFAULT '',
    recording_url TEXT,
    transcript TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_analysis JSONB,
    vapi_call_id TEXT,
    call_quality_score INTEGER CHECK (call_quality_score >= 0 AND call_quality_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: scripts
-- =============================================
CREATE TABLE IF NOT EXISTS scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('discovery', 'presentation', 'objection', 'closing')),
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    effectiveness_score NUMERIC DEFAULT 0 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: knowledge_base
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('proyecto', 'financiero', 'ventas', 'objeciones', 'legal', 'amenidades')),
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_reviewed TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: activities
-- =============================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'whatsapp', 'note', 'stage_change', 'task')),
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    points_earned INTEGER DEFAULT 0,
    duration INTEGER, -- en minutos
    outcome TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: points_system
-- =============================================
CREATE TABLE IF NOT EXISTS points_system (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_subtype TEXT,
    points INTEGER NOT NULL,
    multiplier NUMERIC DEFAULT 1.0,
    description TEXT,
    reference_id UUID, -- ID de la actividad relacionada
    period_month INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: notifications
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: integrations
-- =============================================
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('ghl', 'vapi', 'n8n', 'whatsapp', 'evolution_api')),
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    config JSONB NOT NULL DEFAULT '{}',
    credentials JSONB DEFAULT '{}', -- Encriptado
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMPTZ,
    sync_frequency INTEGER DEFAULT 300, -- segundos
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: automations
-- =============================================
CREATE TABLE IF NOT EXISTS automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('lead_created', 'stage_changed', 'meeting_scheduled', 'call_completed', 'time_based')),
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    success_rate NUMERIC DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);