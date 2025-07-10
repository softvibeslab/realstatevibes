/*
  # Datos Demo Completos para Real Estate CRM

  1. Usuarios adicionales con contraseñas
  2. Leads de ejemplo con datos realistas
  3. Meetings programadas
  4. Calls completadas
  5. Scripts adicionales
  6. Actividades y puntos
  7. Notificaciones de ejemplo
*/

-- =============================================
-- USUARIOS DEMO CON AUTH
-- =============================================

-- Insertar usuarios en auth.users (esto normalmente se haría a través de Supabase Auth)
-- Nota: En producción, estos usuarios se crearían a través del sistema de auth de Supabase

-- Actualizar usuarios existentes con más información
UPDATE users SET 
  last_login = NOW() - INTERVAL '2 hours',
  is_active = true
WHERE email IN ('mafer@real_estate.com', 'mariano@real_estate.com', 'pablo@real_estate.com', 'jaquelite@real_estate.com', 'raquel@real_estate.com', 'admin@real_estate.com');

-- =============================================
-- LEADS ADICIONALES DE EJEMPLO
-- =============================================
INSERT INTO leads (id, name, email, phone, source, status, priority, assigned_to, next_action, next_action_date, budget, interests, notes, ai_analysis, lead_score) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440004', 'Ana Martínez', 'ana.martinez@email.com', '+52 998 777 8888', 'Instagram', 'contacted', 'medium', '550e8400-e29b-41d4-a716-446655440004', 'Seguimiento por WhatsApp', NOW() + INTERVAL '2 hours', 2000000, ARRAY['Departamento', 'Inversión'], 'Contactada por Instagram, mostró interés inicial',
     '{"sentiment": "neutral", "buyingIntent": 60, "keyPoints": ["Primera interacción", "Necesita más información"], "recommendedScript": "discovery-basic", "nextBestAction": "Enviar información por WhatsApp"}', 45),

    ('cc0e8400-e29b-41d4-a716-446655440005', 'Luis Rodríguez', 'luis.rodriguez@email.com', '+52 998 444 5555', 'Website', 'qualified', 'high', '550e8400-e29b-41d4-a716-446655440005', 'Agendar presentación presencial', NOW() + INTERVAL '6 hours', 4500000, ARRAY['Penthouse', 'Lujo', 'Vista al mar'], 'Cliente premium, busca penthouse de lujo',
     '{"sentiment": "positive", "buyingIntent": 95, "keyPoints": ["Presupuesto alto confirmado", "Decisión rápida", "Experiencia en bienes raíces"], "recommendedScript": "presentation-premium", "nextBestAction": "Presentación presencial inmediata"}', 92),

    ('cc0e8400-e29b-41d4-a716-446655440006', 'Carmen López', 'carmen.lopez@email.com', '+52 998 333 2222', 'Referido', 'presentation', 'high', '550e8400-e29b-41d4-a716-446655440001', 'Seguimiento post-presentación', NOW() + INTERVAL '1 day', 2800000, ARRAY['Departamento', '2 recámaras', 'Amenidades'], 'Referida por Carlos Hernández, ya vio presentación',
     '{"sentiment": "positive", "buyingIntent": 80, "keyPoints": ["Referido confiable", "Presentación exitosa", "Evaluando financiamiento"], "recommendedScript": "closing-referral", "nextBestAction": "Propuesta de financiamiento personalizada"}', 78),

    ('cc0e8400-e29b-41d4-a716-446655440007', 'Diego Morales', 'diego.morales@email.com', '+52 998 666 7777', 'Google Ads', 'new', 'low', '550e8400-e29b-41d4-a716-446655440002', 'Primera llamada', NOW() + INTERVAL '4 hours', 1500000, ARRAY['Studio', 'Primera vivienda'], 'Lead nuevo de Google Ads, presupuesto limitado',
     '{"sentiment": "neutral", "buyingIntent": 40, "keyPoints": ["Presupuesto ajustado", "Primera vivienda", "Necesita educación"], "recommendedScript": "discovery-first-time", "nextBestAction": "Llamada educativa sobre beneficios"}', 35),

    ('cc0e8400-e29b-41d4-a716-446655440008', 'Patricia Vega', 'patricia.vega@email.com', '+52 998 888 9999', 'Facebook Ads', 'booked', 'high', '550e8400-e29b-41d4-a716-446655440003', 'Envío de contrato', NOW() + INTERVAL '12 hours', 3500000, ARRAY['Penthouse', 'Inversión', 'Renta vacacional'], 'Apartó penthouse, esperando contrato',
     '{"sentiment": "positive", "buyingIntent": 100, "keyPoints": ["Apartado confirmado", "Pago de enganche listo", "Inversionista experimentada"], "recommendedScript": "post-booking", "nextBestAction": "Proceso de cierre y documentación"}', 95),

    ('cc0e8400-e29b-41d4-a716-446655440009', 'Fernando Castro', 'fernando.castro@email.com', '+52 998 111 2222', 'WhatsApp', 'lost', 'medium', '550e8400-e29b-41d4-a716-446655440004', 'Seguimiento en 3 meses', NOW() + INTERVAL '90 days', 2200000, ARRAY['Departamento', '1 recámara'], 'No procedió por timing, mantener en nurturing',
     '{"sentiment": "neutral", "buyingIntent": 30, "keyPoints": ["Timing incorrecto", "Interés genuino", "Seguimiento futuro"], "recommendedScript": "nurture-campaign", "nextBestAction": "Campaña de nurturing trimestral"}', 25),

    ('cc0e8400-e29b-41d4-a716-446655440010', 'Sofía Ramírez', 'sofia.ramirez@email.com', '+52 998 555 6666', 'Evento', 'qualified', 'medium', '550e8400-e29b-41d4-a716-446655440005', 'Presentación Zoom', NOW() + INTERVAL '2 days', 1900000, ARRAY['Departamento', 'Amenidades', 'Seguridad'], 'Conocida en evento inmobiliario, muy interesada',
     '{"sentiment": "positive", "buyingIntent": 75, "keyPoints": ["Contacto en persona", "Conoce el mercado", "Busca seguridad"], "recommendedScript": "presentation-security", "nextBestAction": "Presentación enfocada en seguridad y amenidades"}', 68)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- MEETINGS DE EJEMPLO
-- =============================================
INSERT INTO meetings (id, title, date, duration, type, status, attendees, notes, lead_id, assigned_to, ghl_event_id, zoom_link, reminder_sent, location, meeting_type) VALUES
    ('ee0e8400-e29b-41d4-a716-446655440001', 'Presentación Zoom - Luis Rodríguez', NOW() + INTERVAL '6 hours', 60, 'zoom', 'scheduled', ARRAY['Luis Rodríguez', 'Raquel'], 'Cliente premium interesado en penthouse', 'cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'ghl_event_127', 'https://zoom.us/j/111222333', false, 'Zoom Meeting', 'presentation'),

    ('ee0e8400-e29b-41d4-a716-446655440002', 'Visita Presencial - Carmen López', NOW() + INTERVAL '1 day', 90, 'physical', 'scheduled', ARRAY['Carmen López', 'Mafer'], 'Seguimiento post-presentación, cliente referido', 'cc0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'ghl_event_128', NULL, true, 'Oficina de Ventas - Tulum', 'follow_up'),

    ('ee0e8400-e29b-41d4-a716-446655440003', 'Llamada Discovery - Ana Martínez', NOW() + INTERVAL '2 hours', 30, 'phone', 'scheduled', ARRAY['Ana Martínez', 'Jaquelite'], 'Primera llamada de calificación', 'cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'ghl_event_129', NULL, false, 'Llamada telefónica', 'discovery'),

    ('ee0e8400-e29b-41d4-a716-446655440004', 'Presentación Zoom - Sofía Ramírez', NOW() + INTERVAL '2 days', 45, 'zoom', 'scheduled', ARRAY['Sofía Ramírez', 'Raquel'], 'Presentación enfocada en seguridad y amenidades', 'cc0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'ghl_event_130', 'https://zoom.us/j/444555666', true, 'Zoom Meeting', 'presentation'),

    ('ee0e8400-e29b-41d4-a716-446655440005', 'Reunión de Cierre - Patricia Vega', NOW() - INTERVAL '2 days', 120, 'physical', 'completed', ARRAY['Patricia Vega', 'Pablo'], 'Reunión de cierre exitosa, apartado confirmado', 'cc0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'ghl_event_131', NULL, true, 'Oficina de Ventas - Tulum', 'closing')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CALLS DE EJEMPLO
-- =============================================
INSERT INTO calls (id, lead_id, type, status, start_time, end_time, duration, outcome, notes, assigned_to, ai_analysis, call_quality_score) VALUES
    ('ff0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440005', 'manual', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '22 minutes', 1320, 'qualified', 'Excelente llamada, cliente muy interesado en penthouse premium', '550e8400-e29b-41d4-a716-446655440005', 
     '{"sentiment": "positive", "keyTopics": ["Presupuesto confirmado 4.5M", "Experiencia en bienes raíces", "Decisión rápida"], "nextAction": "Agendar presentación presencial", "transcription": "Cliente con experiencia en inversiones, busca penthouse de lujo..."}', 95),

    ('ff0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440004', 'vapi', 'completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '8 minutes', 480, 'interested', 'Llamada VAPI exitosa, lead calificado para seguimiento humano', 'vapi-bot',
     '{"sentiment": "neutral", "keyTopics": ["Interés en departamentos", "Presupuesto 2M", "Necesita más información"], "nextAction": "Seguimiento humano por WhatsApp", "transcription": "Lead muestra interés inicial, requiere más información sobre financiamiento..."}', 78),

    ('ff0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440006', 'manual', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes', 2100, 'qualified', 'Llamada post-presentación muy positiva, cliente listo para apartado', '550e8400-e29b-41d4-a716-446655440001',
     '{"sentiment": "positive", "keyTopics": ["Presentación exitosa", "Financiamiento aprobado", "Lista para apartar"], "nextAction": "Proceso de apartado", "transcription": "Cliente muy satisfecha con la presentación, financiamiento pre-aprobado..."}', 92),

    ('ff0e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440007', 'manual', 'failed', NOW() - INTERVAL '6 hours', NULL, 0, 'no-answer', 'No contestó, reagendar para mañana', '550e8400-e29b-41d4-a716-446655440002', NULL, 0),

    ('ff0e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440009', 'manual', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes', 900, 'not-interested', 'Cliente no puede proceder en este momento por timing', '550e8400-e29b-41d4-a716-446655440004',
     '{"sentiment": "neutral", "keyTopics": ["Timing incorrecto", "Interés futuro", "Mantener contacto"], "nextAction": "Campaña de nurturing", "transcription": "Cliente interesado pero no puede proceder ahora, mantener en seguimiento..."}', 65)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SCRIPTS ADICIONALES
-- =============================================
INSERT INTO scripts (id, name, type, content, variables, created_by, tags, effectiveness_score, usage_count) VALUES
    ('880e8400-e29b-41d4-a716-446655440004', 'Script de Cierre - Apartado', 'closing',
     'Perfecto [NOMBRE_CLIENTE], veo que Selva Dentro es exactamente lo que buscas.

Para asegurar tu unidad preferida, el proceso es muy sencillo:

**Apartado Inmediato:**
- Apartado: $[MONTO_APARTADO] MXN
- Reserva tu unidad por 15 días
- Sin compromiso adicional durante este período

**Beneficios de Apartar Hoy:**
- Precio actual garantizado
- Primera opción en amenidades premium
- Acceso a descuentos por pronto pago
- Asesoría legal incluida

**Siguiente Paso:**
Te envío el contrato de apartado ahora mismo. ¿Prefieres recibirlo por email o WhatsApp?

Una vez firmado, coordinamos la visita a las instalaciones para que conozcas personalmente tu futura inversión.

¿Procedemos con el apartado de [TIPO_UNIDAD] en [UBICACION]?',
     ARRAY['NOMBRE_CLIENTE', 'MONTO_APARTADO', 'TIPO_UNIDAD', 'UBICACION'],
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['cierre', 'apartado', 'urgencia'], 89, 23),

    ('880e8400-e29b-41d4-a716-446655440005', 'Script Post-Presentación', 'closing',
     'Gracias [NOMBRE_CLIENTE] por tu tiempo en la presentación.

¿Qué fue lo que más te gustó de Selva Dentro?

[PAUSA PARA ESCUCHAR]

Excelente. Veo que realmente conectaste con [ASPECTO_FAVORITO].

Basado en lo que me comentas, la unidad [TIPO_UNIDAD] con [CARACTERISTICAS] sería perfecta para ti.

**Tu Inversión:**
- Precio: $[PRECIO] MXN
- Enganche: $[ENGANCHE] MXN ([PORCENTAJE_ENGANCHE]%)
- Pagos mensuales: $[PAGO_MENSUAL] MXN

**¿Qué necesitas para tomar la decisión?**

Entiendo que es una inversión importante. ¿Hay alguna pregunta específica que pueda resolver para ti ahora mismo?',
     ARRAY['NOMBRE_CLIENTE', 'ASPECTO_FAVORITO', 'TIPO_UNIDAD', 'CARACTERISTICAS', 'PRECIO', 'ENGANCHE', 'PORCENTAJE_ENGANCHE', 'PAGO_MENSUAL'],
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['post-presentacion', 'cierre', 'seguimiento'], 85, 34),

    ('880e8400-e29b-41d4-a716-446655440006', 'Script para Referidos', 'discovery',
     'Hola [NOMBRE_CLIENTE], habla [NOMBRE_AGENTE] de Real Estate CRM.

[NOMBRE_REFERIDOR] me comentó que podrías estar interesado en conocer sobre nuestros desarrollos en Tulum. ¡Qué buena referencia!

[NOMBRE_REFERIDOR] ya es parte de nuestra familia Selva Dentro y está muy contento con su inversión.

Me gustaría platicar contigo sobre las oportunidades que tenemos disponibles. ¿Tienes unos minutos?

**Beneficio Especial por Referido:**
- Descuento adicional del 3%
- Condiciones preferenciales de financiamiento
- Acceso prioritario a las mejores unidades

¿Qué tipo de propiedad te interesa más? ¿Para uso personal o como inversión?',
     ARRAY['NOMBRE_CLIENTE', 'NOMBRE_AGENTE', 'NOMBRE_REFERIDOR'],
     '550e8400-e29b-41d4-a716-446655440006',
     ARRAY['referidos', 'descubrimiento', 'beneficios'], 92, 18)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ACTIVIDADES ADICIONALES
-- =============================================
INSERT INTO activities (id, user_id, lead_id, type, title, description, points_earned, duration, outcome, metadata) VALUES
    ('dd0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440005', 'call', 'Llamada de calificación premium', 'Llamada exitosa con cliente premium Luis Rodríguez', 10, 22, 'qualified', '{"call_quality": "excellent", "budget_confirmed": true}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440006', 'meeting', 'Presentación Zoom exitosa', 'Presentación completada con Carmen López', 15, 45, 'interested', '{"meeting_type": "presentation", "engagement": "high"}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440008', 'meeting', 'Cierre exitoso - Apartado', 'Reunión de cierre con Patricia Vega - Apartado confirmado', 30, 120, 'booked', '{"meeting_type": "closing", "result": "booking_confirmed"}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440007', 'whatsapp', 'Seguimiento WhatsApp', 'Mensaje de seguimiento a Diego Morales', 2, 3, 'positive_response', '{"platform": "whatsapp", "response_time": "immediate"}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440004', 'email', 'Envío de información', 'Información detallada enviada a Ana Martínez', 1, 5, 'delivered', '{"email_type": "information_package", "opened": true}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440010', 'note', 'Notas de evento inmobiliario', 'Contacto establecido en evento, muy interesada', 3, 10, 'qualified', '{"event_name": "Expo Inmobiliaria Cancún", "interest_level": "high"}'),
    
    ('dd0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440001', 'whatsapp', 'Confirmación de cita', 'Confirmación de presentación Zoom con Carlos', 2, 2, 'confirmed', '{"message_type": "appointment_confirmation"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PUNTOS ADICIONALES PARA EL SISTEMA
-- =============================================
INSERT INTO points_system (user_id, activity_type, activity_subtype, points, description, reference_id, period_month, period_year) VALUES
    -- Puntos para Mafer
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'zoom', 15, 'Presentación Zoom exitosa con Carmen López', 'dd0e8400-e29b-41d4-a716-446655440005', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'communication', 'whatsapp', 2, 'Confirmación de cita por WhatsApp', 'dd0e8400-e29b-41d4-a716-446655440010', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'zoom_broker', 12, 'Presentaciones Zoom a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'event_broker', 8, 'Presentaciones en eventos a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'zoom_realtors', 12, 'Presentaciones Zoom a inmobiliarias (6 presentaciones)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'zoom_client', 45, 'Presentaciones Zoom a clientes finales (15 presentaciones)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'physical_broker', 12, 'Presentaciones físicas a brokers (4 presentaciones)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'physical_realtors', 12, 'Presentaciones físicas a inmobiliarias (3 presentaciones)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'presentation', 'physical_client', 35, 'Presentaciones físicas a clientes finales (7 presentaciones)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'result', 'booking', 10, 'Apartado conseguido', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'result', 'alliance_sale', 15, 'Venta por alianza', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440001', 'result', 'direct_sale', 20, 'Venta directa', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),

    -- Puntos para Mariano
    ('550e8400-e29b-41d4-a716-446655440002', 'communication', 'whatsapp', 2, 'Seguimiento WhatsApp a Diego Morales', 'dd0e8400-e29b-41d4-a716-446655440007', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'zoom_broker', 18, 'Presentaciones Zoom a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'event_broker', 5, 'Presentaciones en eventos a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'zoom_realtors', 8, 'Presentaciones Zoom a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'zoom_client', 36, 'Presentaciones Zoom a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'physical_broker', 18, 'Presentaciones físicas a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'physical_realtors', 8, 'Presentaciones físicas a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'presentation', 'physical_client', 25, 'Presentaciones físicas a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'result', 'booking', 10, 'Apartado conseguido', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440002', 'result', 'alliance_sale', 30, 'Ventas por alianza (2 ventas)', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),

    -- Puntos para Pablo
    ('550e8400-e29b-41d4-a716-446655440003', 'meeting', 'closing', 30, 'Reunión de cierre exitosa con Patricia Vega', 'dd0e8400-e29b-41d4-a716-446655440006', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'zoom_broker', 15, 'Presentaciones Zoom a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'event_broker', 7, 'Presentaciones en eventos a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'zoom_realtors', 16, 'Presentaciones Zoom a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'zoom_client', 27, 'Presentaciones Zoom a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'physical_broker', 9, 'Presentaciones físicas a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'physical_realtors', 16, 'Presentaciones físicas a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'presentation', 'physical_client', 30, 'Presentaciones físicas a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'result', 'booking', 10, 'Apartado conseguido', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'result', 'alliance_sale', 15, 'Venta por alianza', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440003', 'result', 'direct_sale', 20, 'Venta directa', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),

    -- Puntos para Jaquelite
    ('550e8400-e29b-41d4-a716-446655440004', 'communication', 'email', 1, 'Información enviada a Ana Martínez', 'dd0e8400-e29b-41d4-a716-446655440008', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'zoom_broker', 10, 'Presentaciones Zoom a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'event_broker', 4, 'Presentaciones en eventos a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'zoom_realtors', 10, 'Presentaciones Zoom a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'zoom_client', 24, 'Presentaciones Zoom a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'physical_broker', 6, 'Presentaciones físicas a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'physical_realtors', 4, 'Presentaciones físicas a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'presentation', 'physical_client', 20, 'Presentaciones físicas a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'result', 'booking', 10, 'Apartado conseguido', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440004', 'result', 'alliance_sale', 15, 'Venta por alianza', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),

    -- Puntos para Raquel
    ('550e8400-e29b-41d4-a716-446655440005', 'call', 'qualification', 10, 'Llamada exitosa con Luis Rodríguez', 'dd0e8400-e29b-41d4-a716-446655440004', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'note', 'event_contact', 3, 'Contacto en evento inmobiliario', 'dd0e8400-e29b-41d4-a716-446655440009', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'zoom_broker', 8, 'Presentaciones Zoom a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'event_broker', 3, 'Presentaciones en eventos a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'zoom_realtors', 6, 'Presentaciones Zoom a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'zoom_client', 18, 'Presentaciones Zoom a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'physical_broker', 3, 'Presentaciones físicas a brokers', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'physical_realtors', 8, 'Presentaciones físicas a inmobiliarias', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'presentation', 'physical_client', 15, 'Presentaciones físicas a clientes finales', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'result', 'booking', 10, 'Apartado conseguido', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
    ('550e8400-e29b-41d4-a716-446655440005', 'result', 'direct_sale', 20, 'Venta directa', NULL, EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW()))
ON CONFLICT DO NOTHING;

-- =============================================
-- NOTIFICACIONES DE EJEMPLO
-- =============================================
INSERT INTO notifications (id, user_id, title, message, type, action_url, metadata) VALUES
    ('gg0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '🎉 ¡Nuevo apartado!', 'Carmen López ha confirmado el apartado de su departamento. ¡Felicidades!', 'success', '/leads/cc0e8400-e29b-41d4-a716-446655440006', '{"lead_id": "cc0e8400-e29b-41d4-a716-446655440006", "amount": 2800000}'),
    
    ('gg0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '📞 Llamada programada', 'Tienes una presentación Zoom con Luis Rodríguez en 6 horas', 'info', '/meetings/ee0e8400-e29b-41d4-a716-446655440001', '{"meeting_id": "ee0e8400-e29b-41d4-a716-446655440001", "type": "zoom"}'),
    
    ('gg0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', '⚠️ Seguimiento pendiente', 'Ana Martínez está esperando tu llamada de seguimiento', 'warning', '/leads/cc0e8400-e29b-41d4-a716-446655440004', '{"lead_id": "cc0e8400-e29b-41d4-a716-446655440004", "action": "call"}'),
    
    ('gg0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '📋 Contrato pendiente', 'Enviar contrato de apartado a Patricia Vega', 'info', '/leads/cc0e8400-e29b-41d4-a716-446655440008', '{"lead_id": "cc0e8400-e29b-41d4-a716-446655440008", "action": "send_contract"}'),
    
    ('gg0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '🔄 Lead para seguimiento', 'Diego Morales no contestó la llamada, reagendar para mañana', 'warning', '/calls/ff0e8400-e29b-41d4-a716-446655440004', '{"call_id": "ff0e8400-e29b-41d4-a716-446655440004", "action": "reschedule"}'),
    
    ('gg0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '📊 Reporte semanal', 'Tu reporte de performance semanal está listo', 'info', '/reports', '{"report_type": "weekly", "period": "current_week"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- KNOWLEDGE BASE ADICIONAL
-- =============================================
INSERT INTO knowledge_base (id, title, category, content, tags, priority, created_by, usage_count) VALUES
    ('990e8400-e29b-41d4-a716-446655440004', 'Amenidades Premium de Selva Dentro', 'amenidades',
     '**Beach Club Exclusivo:**
- Acceso privado a 150 metros de playa
- Servicio de toallas y camastros
- Bar y restaurante frente al mar
- Actividades acuáticas incluidas

**Spa & Wellness Center:**
- Tratamientos con productos naturales de la región
- Temazcal tradicional maya
- Yoga y meditación al amanecer
- Masajes en cabañas privadas

**Gastronomía de Clase Mundial:**
- Restaurante gourmet con chef internacional
- Menú de cocina mexicana contemporánea
- Bar de cócteles artesanales
- Servicio a la habitación 24/7

**Amenidades Familiares:**
- Kids Club con actividades supervisadas
- Piscina familiar con área de juegos
- Biblioteca y sala de juegos
- Área de BBQ y eventos privados

**Servicios de Lujo:**
- Concierge personalizado
- Servicio de limpieza diario
- Lavandería y tintorería
- Transporte al aeropuerto',
     ARRAY['amenidades', 'lujo', 'servicios', 'familia'], 'high',
     '550e8400-e29b-41d4-a716-446655440006', 45),

    ('990e8400-e29b-41d4-a716-446655440005', 'Proceso de Compra Paso a Paso', 'ventas',
     '**Paso 1: Apartado (Día 1)**
- Firma de contrato de apartado
- Pago de apartado: $50,000 MXN
- Reserva de unidad por 15 días
- Asesoría legal incluida

**Paso 2: Enganche (Días 2-15)**
- Revisión de documentos legales
- Pago de enganche (20-50% según plan)
- Firma de contrato de compraventa
- Inicio de trámites notariales

**Paso 3: Pagos Durante Construcción**
- Pagos mensuales según plan elegido
- Reportes de avance de obra
- Visitas programadas a la construcción
- Actualizaciones fotográficas mensuales

**Paso 4: Entrega (Diciembre 2025)**
- Pago final (20% del valor)
- Entrega de llaves
- Walk-through final
- Inicio de programa de rentas (opcional)

**Documentos Requeridos:**
- Identificación oficial
- Comprobante de ingresos
- RFC y CURP
- Comprobante de domicilio',
     ARRAY['proceso', 'compra', 'documentos', 'pasos'], 'high',
     '550e8400-e29b-41d4-a716-446655440006', 67),

    ('990e8400-e29b-41d4-a716-446655440006', 'ROI y Análisis de Inversión', 'financiero',
     '**Proyección de ROI Anual:**

**Renta Vacacional:**
- Ocupación promedio: 75%
- Tarifa promedio noche: $350 USD
- Ingresos anuales estimados: $95,550 USD
- ROI neto: 8-12% anual

**Apreciación del Capital:**
- Crecimiento histórico Tulum: 15% anual
- Proyección conservadora: 10% anual
- Proyección optimista: 18% anual

**Comparativo de Inversión:**
- Departamento $2M MXN = ROI 10%
- Penthouse $4M MXN = ROI 12%
- Studio $1.2M MXN = ROI 8%

**Factores de Crecimiento:**
- Tren Maya (operación 2024)
- Nuevo aeropuerto de Tulum (2025)
- Desarrollo de infraestructura turística
- Crecimiento del turismo internacional

**Programa de Rentas Garantizado:**
- ROI mínimo garantizado: 8% anual
- Gestión profesional incluida
- Marketing internacional
- Mantenimiento incluido',
     ARRAY['roi', 'inversión', 'rentas', 'apreciación'], 'high',
     '550e8400-e29b-41d4-a716-446655440006', 89)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- ACTUALIZAR CONTADORES Y ESTADÍSTICAS
-- =============================================

-- Actualizar usage_count en scripts
UPDATE scripts SET usage_count = usage_count + FLOOR(RANDOM() * 20 + 5);

-- Actualizar effectiveness_score en scripts
UPDATE scripts SET effectiveness_score = 75 + FLOOR(RANDOM() * 20);

-- Actualizar usage_count en knowledge_base
UPDATE knowledge_base SET usage_count = usage_count + FLOOR(RANDOM() * 30 + 10);

-- Actualizar last_login para usuarios
UPDATE users SET last_login = NOW() - INTERVAL '1 hour' * FLOOR(RANDOM() * 24);