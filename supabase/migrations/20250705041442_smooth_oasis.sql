/*
  # Datos Iniciales - Real Estate CRM

  1. Usuarios del sistema
  2. Pipeline por defecto
  3. Scripts básicos
  4. Base de conocimientos inicial
  5. Configuraciones de integración
  6. Automatizaciones básicas
*/

-- =============================================
-- USUARIOS INICIALES
-- =============================================
INSERT INTO users (id, name, email, role, avatar, permissions) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Mafer', 'mafer@real_estate.com', 'broker', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['leads:read', 'leads:write', 'meetings:read', 'meetings:write']),
    ('550e8400-e29b-41d4-a716-446655440002', 'Mariano', 'mariano@real_estate.com', 'broker', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['leads:read', 'leads:write', 'meetings:read', 'meetings:write']),
    ('550e8400-e29b-41d4-a716-446655440003', 'Pablo', 'pablo@real_estate.com', 'broker', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['leads:read', 'leads:write', 'meetings:read', 'meetings:write']),
    ('550e8400-e29b-41d4-a716-446655440004', 'Jaquelite', 'jaquelite@real_estate.com', 'broker', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['leads:read', 'leads:write', 'meetings:read', 'meetings:write']),
    ('550e8400-e29b-41d4-a716-446655440005', 'Raquel', 'raquel@real_estate.com', 'broker', 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['leads:read', 'leads:write', 'meetings:read', 'meetings:write']),
    ('550e8400-e29b-41d4-a716-446655440006', 'Admin', 'admin@real_estate.com', 'admin', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', ARRAY['*'])
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- PIPELINE POR DEFECTO
-- =============================================
INSERT INTO pipelines (id, name, description, is_active, is_default, created_by) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Pipeline Principal de Ventas', 'Pipeline principal para el proceso de ventas de Real Estate CRM', true, true, '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT DO NOTHING;

-- Etapas del pipeline
INSERT INTO pipeline_stages (id, pipeline_id, name, order_position, color, automation_rules) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Nuevo Lead', 1, '#3B82F6', '{"welcome_message": true, "assign_broker": true}'),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Contactado', 2, '#F59E0B', '{"follow_up_reminder": 24}'),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Calificado', 3, '#10B981', '{"schedule_presentation": true}'),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Presentación', 4, '#8B5CF6', '{"post_presentation_follow_up": 48}'),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Apartado', 5, '#F97316', '{"contract_reminder": 72}'),
    ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Vendido', 6, '#059669', '{"celebration_message": true, "referral_request": true}'),
    ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 'Perdido', 7, '#DC2626', '{"nurture_campaign": true}')
ON CONFLICT DO NOTHING;

-- =============================================
-- SCRIPTS BÁSICOS
-- =============================================
INSERT INTO scripts (id, name, type, content, variables, created_by, tags) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', 'Script de Descubrimiento - Tulum', 'discovery', 
     'Hola [NOMBRE_CLIENTE], habla [NOMBRE_AGENTE] de Real Estate CRM.

Te contacto porque veo que has mostrado interés en nuestros desarrollos en Tulum. ¿Tienes unos minutos para platicar?

Perfecto. Para poder ayudarte de la mejor manera, me gustaría conocerte un poco mejor:

1. ¿Qué te motivó a buscar una propiedad en Tulum?
2. ¿Estás buscando para uso personal, inversión, o ambos?
3. ¿Has visitado Tulum antes? ¿Qué te parece la zona?
4. ¿Cuál es tu timeline para tomar una decisión?
5. ¿Has considerado el rango de inversión que tienes en mente?

[PAUSA PARA ESCUCHAR]

Excelente, basado en lo que me comentas, creo que tenemos opciones perfectas para ti. Selva Dentro es un desarrollo único que combina la magia de la selva con amenidades de lujo...',
     ARRAY['NOMBRE_CLIENTE', 'NOMBRE_AGENTE'], 
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['descubrimiento', 'inicial', 'tulum']),

    ('880e8400-e29b-41d4-a716-446655440002', 'Presentación Penthouse Collection', 'presentation',
     'Gracias por tu tiempo [NOMBRE_CLIENTE]. Me da mucho gusto presentarte nuestra Penthouse Collection.

Lo que hace únicos a nuestros penthouses:

🏝️ **Ubicación Privilegiada**
- Frente a la playa más hermosa de Tulum
- A 5 minutos de la zona arqueológica
- Acceso directo a cenotes privados

🏢 **Características Exclusivas**
- Terrazas privadas de [TAMAÑO_TERRAZA] m²
- Jacuzzi privado con vista al mar
- Cocina gourmet completamente equipada
- [NUMERO_RECAMARAS] recámaras con baño completo

💰 **Inversión Inteligente**
- ROI proyectado del [ROI_PROYECTADO]% anual
- Programa de rentas vacacionales incluido
- Apreciación histórica del [APRECIACION]% anual en la zona

¿Qué te parece más interesante de lo que te he compartido?',
     ARRAY['NOMBRE_CLIENTE', 'TAMAÑO_TERRAZA', 'NUMERO_RECAMARAS', 'ROI_PROYECTADO', 'APRECIACION'],
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['presentacion', 'penthouse', 'lujo']),

    ('880e8400-e29b-41d4-a716-446655440003', 'Manejo de Objeciones - Precio', 'objection',
     'Entiendo perfectamente tu preocupación sobre el precio, [NOMBRE_CLIENTE]. Es una inversión importante y es normal que quieras estar seguro.

Permíteme ponerte en perspectiva:

**Comparación de Mercado:**
- Propiedades similares en la zona: $[PRECIO_COMPETENCIA] MXN
- Nuestro precio: $[PRECIO_NUESTRO] MXN
- Diferencia: Estás ahorrando $[AHORRO] MXN

**Valor Agregado Incluido:**
- Programa de rentas vacacionales (valor: $[VALOR_RENTAS] MXN)
- Mobiliario completo (valor: $[VALOR_MOBILIARIO] MXN)
- Mantenimiento por 2 años (valor: $[VALOR_MANTENIMIENTO] MXN)

**Financiamiento Disponible:**
- Enganche desde el [ENGANCHE]%
- Pagos mensuales desde $[PAGO_MENSUAL] MXN
- Sin intereses por [MESES_SIN_INTERESES] meses

¿Cuál de estas opciones te ayudaría más a tomar la decisión?',
     ARRAY['NOMBRE_CLIENTE', 'PRECIO_COMPETENCIA', 'PRECIO_NUESTRO', 'AHORRO', 'VALOR_RENTAS', 'VALOR_MOBILIARIO', 'VALOR_MANTENIMIENTO', 'ENGANCHE', 'PAGO_MENSUAL', 'MESES_SIN_INTERESES'],
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['objeciones', 'precio', 'financiamiento'])
ON CONFLICT DO NOTHING;

-- =============================================
-- BASE DE CONOCIMIENTOS
-- =============================================
INSERT INTO knowledge_base (id, title, category, content, tags, priority, created_by) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', 'Información del Proyecto Selva Dentro', 'proyecto',
     'Real Estate CRM es un desarrollo residencial de lujo ubicado en la Riviera Maya, específicamente en Tulum, Quintana Roo.

**Características Principales:**
- 120 unidades distribuidas en 3 torres
- Frente de playa de 150 metros
- Amenidades de clase mundial
- Entrega: Diciembre 2025

**Tipos de Unidades:**
- Studios: 45-55 m² | $1,200,000 - $1,500,000 MXN
- 1 Recámara: 65-75 m² | $1,800,000 - $2,200,000 MXN  
- 2 Recámaras: 85-95 m² | $2,500,000 - $3,000,000 MXN
- Penthouses: 120-150 m² | $4,000,000 - $6,000,000 MXN

**Amenidades:**
- Beach Club privado
- Spa y gimnasio
- 3 piscinas (infinity, familiar, niños)
- Restaurante gourmet
- Concierge 24/7
- Estacionamiento subterráneo
- Helipuerto',
     ARRAY['proyecto', 'precios', 'amenidades', 'unidades'], 'high',
     '550e8400-e29b-41d4-a716-446655440006'),

    ('990e8400-e29b-41d4-a716-446655440002', 'Opciones de Financiamiento', 'financiero',
     'Ofrecemos múltiples opciones de financiamiento para facilitar tu inversión:

**Plan Tradicional:**
- Enganche: 30%
- Pagos durante construcción: 50% (24 meses)
- Entrega: 20%

**Plan Flexible:**
- Enganche: 20%
- Pagos durante construcción: 60% (30 meses)
- Entrega: 20%

**Plan Premium (Sin Intereses):**
- Enganche: 50%
- Pagos durante construcción: 50% (18 meses)
- Sin intereses ni comisiones

**Financiamiento Bancario:**
- Convenios con BBVA, Santander, Banorte
- Hasta 70% de financiamiento
- Tasas preferenciales desde 8.5% anual
- Plazos hasta 20 años

**Beneficios Adicionales:**
- Descuento por pago de contado: 8%
- Programa de referidos: 3% de comisión
- Garantía de recompra: 95% del valor después de 3 años',
     ARRAY['financiamiento', 'pagos', 'descuentos', 'bancos'], 'high',
     '550e8400-e29b-41d4-a716-446655440006'),

    ('990e8400-e29b-41d4-a716-446655440003', 'Manejo de Objeciones Comunes', 'objeciones',
     '**Objeción: "Está muy caro"**
Respuesta: Entiendo tu preocupación. Comparemos con propiedades similares en la zona... [mostrar análisis de mercado]. Además, considera el valor agregado incluido...

**Objeción: "Necesito pensarlo"**
Respuesta: Por supuesto, es una decisión importante. ¿Qué información específica te ayudaría a sentirte más cómodo? ¿Hay alguna preocupación particular que podamos resolver hoy?

**Objeción: "No conozco la zona"**
Respuesta: Excelente punto. Tulum es una de las zonas con mayor crecimiento en México... [datos de crecimiento]. ¿Te gustaría que organicemos una visita para que conozcas personalmente?

**Objeción: "¿Y si no se renta?"**
Respuesta: Tenemos un programa de rentas garantizado con ROI mínimo del 8% anual. Además, nuestro track record muestra ocupación promedio del 85%...',
     ARRAY['objeciones', 'ventas', 'respuestas', 'técnicas'], 'medium',
     '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT DO NOTHING;

-- =============================================
-- CONFIGURACIONES DE INTEGRACIÓN
-- =============================================
INSERT INTO integrations (id, name, type, status, config) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440001', 'GoHighLevel', 'ghl', 'disconnected', 
     '{"baseUrl": "https://services.leadconnectorhq.com", "version": "2021-07-28"}'),
    ('aa0e8400-e29b-41d4-a716-446655440002', 'VAPI AI Calls', 'vapi', 'disconnected',
     '{"baseUrl": "https://api.vapi.ai"}'),
    ('aa0e8400-e29b-41d4-a716-446655440003', 'n8n Workflows', 'n8n', 'disconnected',
     '{"syncFrequency": 300}'),
    ('aa0e8400-e29b-41d4-a716-446655440004', 'WhatsApp Business', 'whatsapp', 'disconnected',
     '{"type": "evolution-api", "instanceName": "real_estate"}')
ON CONFLICT DO NOTHING;

-- =============================================
-- AUTOMATIZACIONES BÁSICAS
-- =============================================
INSERT INTO automations (id, name, description, trigger_type, trigger_conditions, actions, created_by) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', 'Bienvenida Nuevo Lead', 'Envía mensaje de bienvenida automático cuando se crea un nuevo lead', 'lead_created',
     '{"source": ["Facebook Ads", "Google Ads", "Website"]}',
     '[{"type": "whatsapp", "template": "welcome_message", "delay": 0}, {"type": "task", "title": "Llamar en 1 hora", "delay": 3600}]',
     '550e8400-e29b-41d4-a716-446655440006'),

    ('bb0e8400-e29b-41d4-a716-446655440002', 'Seguimiento Post-Presentación', 'Programa seguimiento automático después de una presentación', 'stage_changed',
     '{"to_stage": "presentation", "from_stage": "qualified"}',
     '[{"type": "email", "template": "post_presentation_followup", "delay": 86400}, {"type": "whatsapp", "template": "presentation_feedback", "delay": 172800}]',
     '550e8400-e29b-41d4-a716-446655440006'),

    ('bb0e8400-e29b-41d4-a716-446655440003', 'Recordatorio de Apartado', 'Gestiona el proceso post-apartado', 'stage_changed',
     '{"to_stage": "booked"}',
     '[{"type": "task", "title": "Enviar contrato", "delay": 0}, {"type": "whatsapp", "template": "booking_confirmation", "delay": 3600}]',
     '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT DO NOTHING;

-- =============================================
-- DATOS DE EJEMPLO - LEADS
-- =============================================
INSERT INTO leads (id, name, email, phone, source, status, priority, assigned_to, next_action, next_action_date, budget, interests, notes, ai_analysis) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', 'Carlos Hernández', 'carlos.hernandez@email.com', '+52 998 123 4567', 'Facebook Ads', 'qualified', 'high', '550e8400-e29b-41d4-a716-446655440001', 'Presentación Zoom programada', NOW() + INTERVAL '1 day', 2500000, ARRAY['Penthouse', 'Vista al mar', 'Inversión'], 'Cliente muy interesado, busca inversión a largo plazo',
     '{"sentiment": "positive", "buyingIntent": 85, "keyPoints": ["Presupuesto confirmado", "Timeline definido", "Decisor principal"], "recommendedScript": "discovery-qualified", "nextBestAction": "Agendar presentación presencial"}'),

    ('cc0e8400-e29b-41d4-a716-446655440002', 'María González', 'maria.gonzalez@email.com', '+52 998 765 4321', 'Google Ads', 'presentation', 'medium', '550e8400-e29b-41d4-a716-446655440002', 'Seguimiento post-presentación', NOW() + INTERVAL '12 hours', 1800000, ARRAY['Departamento', '2 recámaras', 'Amenidades'], 'Ya vio la presentación, evaluando opciones',
     '{"sentiment": "neutral", "buyingIntent": 65, "keyPoints": ["Comparando opciones", "Necesita más información financiera"], "recommendedScript": "objection-handling", "nextBestAction": "Enviar propuesta personalizada"}'),

    ('cc0e8400-e29b-41d4-a716-446655440003', 'Roberto Silva', 'roberto.silva@email.com', '+52 998 555 1234', 'Referido', 'new', 'high', '550e8400-e29b-41d4-a716-446655440003', 'Primera llamada de contacto', NOW() + INTERVAL '1 hour', 3200000, ARRAY['Penthouse', 'Inversión', 'Renta vacacional'], 'Referido por cliente existente, alta probabilidad de cierre',
     '{"sentiment": "positive", "buyingIntent": 90, "keyPoints": ["Referido de cliente satisfecho", "Presupuesto alto", "Experiencia en inversiones"], "recommendedScript": "discovery-referral", "nextBestAction": "Llamada inmediata para agendar cita"}')
ON CONFLICT DO NOTHING;

-- =============================================
-- DATOS DE EJEMPLO - ACTIVIDADES Y PUNTOS
-- =============================================
INSERT INTO activities (id, user_id, lead_id, type, title, description, points_earned, duration, outcome) VALUES
    ('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'call', 'Llamada de calificación', 'Primera llamada de calificación con Carlos Hernández', 5, 25, 'Qualified lead, interested in penthouse units'),
    ('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440002', 'meeting', 'Presentación Zoom', 'Presentación virtual de propiedades', 10, 45, 'Interested, needs to discuss with partner'),
    ('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'whatsapp', 'Seguimiento WhatsApp', 'Mensaje de seguimiento post-llamada', 2, 5, 'Positive response, scheduled presentation')
ON CONFLICT DO NOTHING;

-- Puntos correspondientes
INSERT INTO points_system (user_id, activity_type, activity_subtype, points, description, reference_id, period_month, period_year) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'call', 'qualification', 5, 'Llamada de calificación exitosa', 'dd0e8400-e29b-41d4-a716-446655440001', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'zoom', 10, 'Presentación Zoom completada', 'dd0e8400-e29b-41d4-a716-446655440002', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'communication', 'whatsapp', 2, 'Seguimiento por WhatsApp', 'dd0e8400-e29b-41d4-a716-446655440003', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW()))
ON CONFLICT DO NOTHING;