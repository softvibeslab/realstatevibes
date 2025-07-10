/*
  # Funciones y Triggers Avanzados

  1. Funciones para cálculo automático de puntos
  2. Triggers para automatizaciones
  3. Funciones de reportes
  4. Notificaciones en tiempo real
  5. Funciones de utilidad
*/

-- =============================================
-- FUNCIÓN: Calcular puntos automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION calculate_points_for_activity()
RETURNS TRIGGER AS $$
DECLARE
    points_to_award INTEGER := 0;
    current_month INTEGER := EXTRACT(MONTH FROM NEW.created_at);
    current_year INTEGER := EXTRACT(YEAR FROM NEW.created_at);
BEGIN
    -- Calcular puntos basado en el tipo de actividad
    CASE NEW.type
        WHEN 'call' THEN
            CASE 
                WHEN NEW.duration >= 300 THEN points_to_award := 5; -- 5+ minutos
                WHEN NEW.duration >= 120 THEN points_to_award := 3; -- 2+ minutos
                ELSE points_to_award := 1;
            END CASE;
        WHEN 'meeting' THEN
            CASE 
                WHEN NEW.metadata->>'meeting_type' = 'presentation' THEN points_to_award := 10;
                WHEN NEW.metadata->>'meeting_type' = 'discovery' THEN points_to_award := 5;
                ELSE points_to_award := 3;
            END CASE;
        WHEN 'whatsapp' THEN points_to_award := 2;
        WHEN 'email' THEN points_to_award := 1;
        WHEN 'note' THEN points_to_award := 1;
        ELSE points_to_award := 0;
    END CASE;

    -- Multiplicadores por outcome
    IF NEW.outcome IS NOT NULL THEN
        CASE NEW.outcome
            WHEN 'qualified' THEN points_to_award := points_to_award * 2;
            WHEN 'booked' THEN points_to_award := points_to_award * 3;
            WHEN 'sold' THEN points_to_award := points_to_award * 5;
        END CASE;
    END IF;

    -- Actualizar puntos en la actividad
    NEW.points_earned := points_to_award;

    -- Insertar en points_system
    IF points_to_award > 0 THEN
        INSERT INTO points_system (
            user_id, 
            activity_type, 
            activity_subtype, 
            points, 
            description, 
            reference_id, 
            period_month, 
            period_year
        ) VALUES (
            NEW.user_id,
            NEW.type,
            NEW.metadata->>'subtype',
            points_to_award,
            NEW.title,
            NEW.id,
            current_month,
            current_year
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular puntos automáticamente
CREATE TRIGGER calculate_activity_points
    BEFORE INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION calculate_points_for_activity();

-- =============================================
-- FUNCIÓN: Ejecutar automatizaciones
-- =============================================
CREATE OR REPLACE FUNCTION execute_automations()
RETURNS TRIGGER AS $$
DECLARE
    automation_record RECORD;
    action_record JSONB;
BEGIN
    -- Buscar automatizaciones activas para este trigger
    FOR automation_record IN 
        SELECT * FROM automations 
        WHERE is_active = true 
        AND trigger_type = TG_ARGV[0]
    LOOP
        -- Verificar condiciones del trigger
        IF automation_record.trigger_conditions IS NULL OR 
           automation_record.trigger_conditions = '{}'::jsonb OR
           check_automation_conditions(automation_record.trigger_conditions, NEW) THEN
            
            -- Ejecutar cada acción
            FOR action_record IN 
                SELECT * FROM jsonb_array_elements(automation_record.actions)
            LOOP
                -- Programar la ejecución de la acción
                INSERT INTO automation_executions (
                    automation_id,
                    trigger_data,
                    action_data,
                    scheduled_at,
                    status
                ) VALUES (
                    automation_record.id,
                    row_to_json(NEW)::jsonb,
                    action_record,
                    NOW() + INTERVAL '1 second' * COALESCE((action_record->>'delay')::integer, 0),
                    'pending'
                );
            END LOOP;

            -- Incrementar contador de ejecuciones
            UPDATE automations 
            SET execution_count = execution_count + 1
            WHERE id = automation_record.id;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Verificar condiciones de automatización
-- =============================================
CREATE OR REPLACE FUNCTION check_automation_conditions(
    conditions JSONB,
    record_data RECORD
) RETURNS BOOLEAN AS $$
BEGIN
    -- Implementación básica - se puede expandir según necesidades
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA: Ejecuciones de automatización
-- =============================================
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    trigger_data JSONB NOT NULL,
    action_data JSONB NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    executed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para automation_executions
CREATE INDEX IF NOT EXISTS idx_automation_executions_scheduled_at ON automation_executions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- =============================================
-- TRIGGERS para automatizaciones
-- =============================================

-- Trigger para nuevos leads
CREATE TRIGGER automation_lead_created
    AFTER INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION execute_automations('lead_created');

-- Trigger para cambios de etapa
CREATE TRIGGER automation_stage_changed
    AFTER UPDATE OF status ON leads
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION execute_automations('stage_changed');

-- Trigger para reuniones programadas
CREATE TRIGGER automation_meeting_scheduled
    AFTER INSERT ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION execute_automations('meeting_scheduled');

-- Trigger para llamadas completadas
CREATE TRIGGER automation_call_completed
    AFTER UPDATE OF status ON calls
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION execute_automations('call_completed');

-- =============================================
-- FUNCIÓN: Obtener resumen de puntos por usuario
-- =============================================
CREATE OR REPLACE FUNCTION get_user_points_summary(
    user_uuid UUID,
    target_month INTEGER DEFAULT NULL,
    target_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
    total_points INTEGER,
    monthly_points INTEGER,
    activity_breakdown JSONB,
    rank_position INTEGER
) AS $$
DECLARE
    calc_month INTEGER := COALESCE(target_month, EXTRACT(MONTH FROM NOW()));
    calc_year INTEGER := COALESCE(target_year, EXTRACT(YEAR FROM NOW()));
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COALESCE(SUM(points), 0)::INTEGER as total_pts,
            COALESCE(SUM(CASE WHEN period_month = calc_month AND period_year = calc_year THEN points ELSE 0 END), 0)::INTEGER as monthly_pts,
            jsonb_object_agg(
                activity_type, 
                COALESCE(SUM(CASE WHEN period_month = calc_month AND period_year = calc_year THEN points ELSE 0 END), 0)
            ) as breakdown
        FROM points_system 
        WHERE user_id = user_uuid
    ),
    user_rank AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY SUM(CASE WHEN period_month = calc_month AND period_year = calc_year THEN points ELSE 0 END) DESC) as rank
        FROM points_system p
        JOIN users u ON p.user_id = u.id
        WHERE u.is_active = true
        GROUP BY p.user_id
        HAVING p.user_id = user_uuid
    )
    SELECT 
        us.total_pts,
        us.monthly_pts,
        us.breakdown,
        COALESCE(ur.rank, 0)::INTEGER
    FROM user_stats us
    LEFT JOIN user_rank ur ON true;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Obtener leaderboard
-- =============================================
CREATE OR REPLACE FUNCTION get_leaderboard(
    target_month INTEGER DEFAULT NULL,
    target_year INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_avatar TEXT,
    total_points INTEGER,
    monthly_points INTEGER,
    rank_position INTEGER
) AS $$
DECLARE
    calc_month INTEGER := COALESCE(target_month, EXTRACT(MONTH FROM NOW()));
    calc_year INTEGER := COALESCE(target_year, EXTRACT(YEAR FROM NOW()));
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.avatar,
        COALESCE(SUM(p.points), 0)::INTEGER as total_pts,
        COALESCE(SUM(CASE WHEN p.period_month = calc_month AND p.period_year = calc_year THEN p.points ELSE 0 END), 0)::INTEGER as monthly_pts,
        ROW_NUMBER() OVER (ORDER BY SUM(CASE WHEN p.period_month = calc_month AND p.period_year = calc_year THEN p.points ELSE 0 END) DESC)::INTEGER as rank
    FROM users u
    LEFT JOIN points_system p ON u.id = p.user_id
    WHERE u.is_active = true AND u.role = 'broker'
    GROUP BY u.id, u.name, u.avatar
    ORDER BY monthly_pts DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Crear notificación
-- =============================================
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info',
    action_url TEXT DEFAULT NULL,
    metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        action_url,
        metadata
    ) VALUES (
        target_user_id,
        notification_title,
        notification_message,
        notification_type,
        action_url,
        metadata
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN: Actualizar lead score automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
DECLARE
    new_score INTEGER := 0;
    activity_count INTEGER;
    days_since_created INTEGER;
BEGIN
    -- Calcular score basado en varios factores
    
    -- Factor 1: Presupuesto (0-30 puntos)
    new_score := new_score + LEAST(30, (NEW.budget / 100000)::INTEGER);
    
    -- Factor 2: Prioridad (0-20 puntos)
    CASE NEW.priority
        WHEN 'high' THEN new_score := new_score + 20;
        WHEN 'medium' THEN new_score := new_score + 10;
        WHEN 'low' THEN new_score := new_score + 5;
    END CASE;
    
    -- Factor 3: Estado (0-25 puntos)
    CASE NEW.status
        WHEN 'qualified' THEN new_score := new_score + 25;
        WHEN 'presentation' THEN new_score := new_score + 20;
        WHEN 'contacted' THEN new_score := new_score + 15;
        WHEN 'booked' THEN new_score := new_score + 30;
        WHEN 'new' THEN new_score := new_score + 5;
    END CASE;
    
    -- Factor 4: Actividades recientes (0-15 puntos)
    SELECT COUNT(*) INTO activity_count
    FROM activities 
    WHERE lead_id = NEW.id 
    AND created_at > NOW() - INTERVAL '7 days';
    
    new_score := new_score + LEAST(15, activity_count * 3);
    
    -- Factor 5: Análisis de IA (0-10 puntos)
    IF NEW.ai_analysis IS NOT NULL THEN
        new_score := new_score + LEAST(10, COALESCE((NEW.ai_analysis->>'buyingIntent')::INTEGER, 0) / 10);
    END IF;
    
    -- Actualizar el score
    NEW.lead_score := LEAST(100, new_score);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar lead score
CREATE TRIGGER update_lead_score_trigger
    BEFORE INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_score();

-- =============================================
-- FUNCIÓN: Limpiar datos antiguos
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpiar notificaciones leídas más antiguas de 30 días
    DELETE FROM notifications 
    WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Limpiar ejecuciones de automatización completadas más antiguas de 90 días
    DELETE FROM automation_executions 
    WHERE status = 'completed' 
    AND created_at < NOW() - INTERVAL '90 days';
    
    -- Limpiar actividades más antiguas de 1 año (mantener solo las importantes)
    DELETE FROM activities 
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND type NOT IN ('meeting', 'call')
    AND points_earned < 5;
    
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista: Resumen de performance por usuario
CREATE OR REPLACE VIEW user_performance_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.avatar,
    COALESCE(SUM(p.points), 0) as total_points,
    COALESCE(SUM(CASE WHEN p.period_month = EXTRACT(MONTH FROM NOW()) AND p.period_year = EXTRACT(YEAR FROM NOW()) THEN p.points ELSE 0 END), 0) as monthly_points,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'sold' THEN l.id END) as closed_deals,
    COUNT(DISTINCT a.id) as total_activities,
    AVG(l.lead_score) as avg_lead_score
FROM users u
LEFT JOIN points_system p ON u.id = p.user_id
LEFT JOIN leads l ON u.id = l.assigned_to
LEFT JOIN activities a ON u.id = a.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email, u.role, u.avatar;

-- Vista: Pipeline summary
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT 
    ps.id,
    ps.name as stage_name,
    ps.order_position,
    ps.color,
    p.name as pipeline_name,
    COUNT(l.id) as lead_count,
    AVG(l.budget) as avg_budget,
    SUM(l.budget) as total_pipeline_value
FROM pipeline_stages ps
JOIN pipelines p ON ps.pipeline_id = p.id
LEFT JOIN leads l ON l.status = ps.name
WHERE p.is_active = true AND ps.is_active = true
GROUP BY ps.id, ps.name, ps.order_position, ps.color, p.name
ORDER BY ps.order_position;

-- Vista: Actividades recientes
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    a.id,
    a.type,
    a.title,
    a.description,
    a.points_earned,
    a.created_at,
    u.name as user_name,
    u.avatar as user_avatar,
    l.name as lead_name,
    l.email as lead_email
FROM activities a
JOIN users u ON a.user_id = u.id
LEFT JOIN leads l ON a.lead_id = l.id
WHERE a.created_at > NOW() - INTERVAL '7 days'
ORDER BY a.created_at DESC;