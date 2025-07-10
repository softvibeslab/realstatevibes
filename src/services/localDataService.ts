import { Lead, Meeting, Call, SalesScript, User } from '../types';
import { format } from 'date-fns';

// Datos locales simulados
const STORAGE_KEYS = {
  USERS: 'real_estate_users',
  LEADS: 'real_estate_leads',
  MEETINGS: 'real_estate_meetings',
  CALLS: 'real_estate_calls',
  SCRIPTS: 'real_estate_scripts',
  ACTIVITIES: 'real_estate_activities',
  POINTS: 'real_estate_points',
  NOTIFICATIONS: 'real_estate_notifications'
};

class LocalDataService {
  // Inicializar datos demo si no existen
  initializeDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.createDemoUsers();
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      this.createDemoLeads();
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
      this.createDemoMeetings();
    }
    if (!localStorage.getItem(STORAGE_KEYS.CALLS)) {
      this.createDemoCalls();
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCRIPTS)) {
      this.createDemoScripts();
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      this.createDemoActivities();
    }
    if (!localStorage.getItem(STORAGE_KEYS.POINTS)) {
      this.createDemoPoints();
    }
  }

  // Usuarios
  private createDemoUsers() {
    const users: User[] = [
      {
        id: '1',
        name: 'Mafer',
        email: 'mafer@real_estate.com',
        role: 'broker',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      },
      {
        id: '2',
        name: 'Mariano',
        email: 'mariano@real_estate.com',
        role: 'broker',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      },
      {
        id: '3',
        name: 'Pablo',
        email: 'pablo@real_estate.com',
        role: 'broker',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      },
      {
        id: '4',
        name: 'Jaquelite',
        email: 'jaquelite@real_estate.com',
        role: 'broker',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      },
      {
        id: '5',
        name: 'Raquel',
        email: 'raquel@real_estate.com',
        role: 'broker',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      },
      {
        id: '6',
        name: 'Admin',
        email: 'admin@real_estate.com',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: ['*'],
        is_active: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private createDemoLeads() {
    const leads: Lead[] = [
      {
        id: '1',
        name: 'Carlos Hernández',
        email: 'carlos.hernandez@email.com',
        phone: '+52 998 123 4567',
        source: 'Facebook Ads',
        status: 'qualified',
        priority: 'high',
        assignedTo: '1',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 3600000),
        nextAction: 'Presentación Zoom programada',
        nextActionDate: new Date(Date.now() + 86400000),
        budget: 2500000,
        interests: ['Penthouse', 'Vista al mar', 'Inversión'],
        notes: 'Cliente muy interesado, busca inversión a largo plazo',
        aiAnalysis: {
          sentiment: 'positive',
          buyingIntent: 85,
          keyPoints: ['Presupuesto confirmado', 'Timeline definido', 'Decisor principal'],
          recommendedScript: 'discovery-qualified',
          nextBestAction: 'Agendar presentación presencial'
        },
        interactions: [],
        scheduledMeetings: []
      },
      {
        id: '2',
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '+52 998 765 4321',
        source: 'Google Ads',
        status: 'presentation',
        priority: 'medium',
        assignedTo: '2',
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 7200000),
        nextAction: 'Seguimiento post-presentación',
        nextActionDate: new Date(Date.now() + 43200000),
        budget: 1800000,
        interests: ['Departamento', '2 recámaras', 'Amenidades'],
        notes: 'Ya vio la presentación, evaluando opciones',
        aiAnalysis: {
          sentiment: 'neutral',
          buyingIntent: 65,
          keyPoints: ['Comparando opciones', 'Necesita más información financiera'],
          recommendedScript: 'objection-handling',
          nextBestAction: 'Enviar propuesta personalizada'
        },
        interactions: [],
        scheduledMeetings: []
      },
      {
        id: '3',
        name: 'Roberto Silva',
        email: 'roberto.silva@email.com',
        phone: '+52 998 555 1234',
        source: 'Referido',
        status: 'new',
        priority: 'high',
        assignedTo: '3',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 1800000),
        nextAction: 'Primera llamada de contacto',
        nextActionDate: new Date(Date.now() + 3600000),
        budget: 3200000,
        interests: ['Penthouse', 'Inversión', 'Renta vacacional'],
        notes: 'Referido por cliente existente, alta probabilidad de cierre',
        aiAnalysis: {
          sentiment: 'positive',
          buyingIntent: 90,
          keyPoints: ['Referido de cliente satisfecho', 'Presupuesto alto', 'Experiencia en inversiones'],
          recommendedScript: 'discovery-referral',
          nextBestAction: 'Llamada inmediata para agendar cita'
        },
        interactions: [],
        scheduledMeetings: []
      },
      {
        id: '4',
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        phone: '+52 998 777 8888',
        source: 'Instagram',
        status: 'contacted',
        priority: 'medium',
        assignedTo: '4',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
        nextAction: 'Seguimiento por WhatsApp',
        nextActionDate: new Date(Date.now() + 7200000),
        budget: 2000000,
        interests: ['Departamento', 'Inversión'],
        notes: 'Contactada por Instagram, mostró interés inicial',
        aiAnalysis: {
          sentiment: 'neutral',
          buyingIntent: 60,
          keyPoints: ['Primera interacción', 'Necesita más información'],
          recommendedScript: 'discovery-basic',
          nextBestAction: 'Enviar información por WhatsApp'
        },
        interactions: [],
        scheduledMeetings: []
      },
      {
        id: '5',
        name: 'Luis Rodríguez',
        email: 'luis.rodriguez@email.com',
        phone: '+52 998 444 5555',
        source: 'Website',
        status: 'booked',
        priority: 'high',
        assignedTo: '5',
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(Date.now() - 86400000),
        nextAction: 'Proceso de cierre',
        nextActionDate: new Date(Date.now() + 86400000 * 2),
        budget: 4500000,
        interests: ['Penthouse', 'Lujo', 'Vista al mar'],
        notes: 'Cliente premium, apartó penthouse de lujo',
        aiAnalysis: {
          sentiment: 'positive',
          buyingIntent: 100,
          keyPoints: ['Apartado confirmado', 'Pago de enganche listo', 'Inversionista experimentado'],
          recommendedScript: 'post-booking',
          nextBestAction: 'Proceso de cierre y documentación'
        },
        interactions: [],
        scheduledMeetings: []
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  }

  private createDemoMeetings() {
    const meetings: Meeting[] = [
      {
        id: '1',
        title: 'Presentación Zoom - Carlos Hernández',
        date: new Date(Date.now() + 86400000),
        duration: 60,
        type: 'zoom',
        status: 'scheduled',
        attendees: ['Carlos Hernández', 'Mafer'],
        notes: 'Cliente muy interesado en penthouse',
        leadId: '1',
        ghlEventId: 'ghl_event_123',
        zoomLink: 'https://zoom.us/j/123456789',
        reminderSent: false,
        location: 'Zoom Meeting',
        leadInfo: {
          name: 'Carlos Hernández',
          email: 'carlos.hernandez@email.com',
          phone: '+52 998 123 4567',
          budget: 2500000,
          interests: ['Penthouse', 'Vista al mar', 'Inversión']
        }
      },
      {
        id: '2',
        title: 'Seguimiento - María González',
        date: new Date(Date.now() + 43200000),
        duration: 30,
        type: 'phone',
        status: 'scheduled',
        attendees: ['María González', 'Mariano'],
        notes: 'Seguimiento post-presentación',
        leadId: '2',
        ghlEventId: 'ghl_event_124',
        reminderSent: true,
        location: 'Llamada telefónica',
        leadInfo: {
          name: 'María González',
          email: 'maria.gonzalez@email.com',
          phone: '+52 998 765 4321',
          budget: 1800000,
          interests: ['Departamento', '2 recámaras', 'Amenidades']
        }
      },
      {
        id: '3',
        title: 'Visita Presencial - Luis Rodríguez',
        date: new Date(Date.now() - 86400000),
        duration: 90,
        type: 'physical',
        status: 'completed',
        attendees: ['Luis Rodríguez', 'Raquel'],
        notes: 'Visita exitosa, cliente apartó penthouse',
        outcome: 'Apartado confirmado',
        leadId: '5',
        ghlEventId: 'ghl_event_125',
        reminderSent: true,
        location: 'Oficina de Ventas - Tulum',
        leadInfo: {
          name: 'Luis Rodríguez',
          email: 'luis.rodriguez@email.com',
          phone: '+52 998 444 5555',
          budget: 4500000,
          interests: ['Penthouse', 'Lujo', 'Vista al mar']
        }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }

  private createDemoCalls() {
    const calls: Call[] = [
      {
        id: '1',
        leadId: '1',
        type: 'manual',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 86400000 + 1200000),
        duration: 1200,
        outcome: 'qualified',
        notes: 'Excelente llamada, cliente muy interesado',
        assignedTo: '1',
        leadInfo: {
          name: 'Carlos Hernández',
          email: 'carlos.hernandez@email.com',
          phone: '+52 998 123 4567',
          budget: 2500000,
          interests: ['Penthouse', 'Vista al mar', 'Inversión']
        },
        aiAnalysis: {
          sentiment: 'positive',
          keyTopics: ['Presupuesto confirmado', 'Timeline definido', 'Interés en penthouse'],
          nextAction: 'Agendar presentación',
          transcription: 'Cliente muy interesado en invertir en Tulum...'
        }
      },
      {
        id: '2',
        leadId: '4',
        type: 'vapi',
        status: 'completed',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 7200000 + 480000),
        duration: 480,
        outcome: 'interested',
        notes: 'Llamada VAPI exitosa, lead calificado',
        assignedTo: 'vapi-bot',
        vapiCallId: 'vapi_call_456',
        leadInfo: {
          name: 'Ana Martínez',
          email: 'ana.martinez@email.com',
          phone: '+52 998 777 8888',
          budget: 2000000,
          interests: ['Departamento', 'Inversión']
        },
        aiAnalysis: {
          sentiment: 'neutral',
          keyTopics: ['Interés inicial', 'Necesita más información', 'Presupuesto 2M'],
          nextAction: 'Seguimiento humano',
          transcription: 'Lead muestra interés inicial en departamentos...'
        }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
  }

  private createDemoScripts() {
    const scripts: SalesScript[] = [
      {
        id: '1',
        name: 'Script de Descubrimiento - Tulum',
        type: 'discovery',
        content: `Hola [NOMBRE_CLIENTE], habla [NOMBRE_AGENTE] de Real Estate CRM.

Te contacto porque veo que has mostrado interés en nuestros desarrollos en Tulum. ¿Tienes unos minutos para platicar?

Para poder ayudarte de la mejor manera, me gustaría conocerte un poco mejor:

1. ¿Qué te motivó a buscar una propiedad en Tulum?
2. ¿Estás buscando para uso personal, inversión, o ambos?
3. ¿Has visitado Tulum antes?
4. ¿Cuál es tu timeline para tomar una decisión?
5. ¿Has considerado el rango de inversión que tienes en mente?

Basado en lo que me comentas, creo que tenemos opciones perfectas para ti...`,
        variables: ['NOMBRE_CLIENTE', 'NOMBRE_AGENTE'],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date(Date.now() - 86400000 * 5),
        usage: 45,
        effectiveness: 87,
        aiGenerated: false
      },
      {
        id: '2',
        name: 'Presentación Penthouse Collection',
        type: 'presentation',
        content: `Gracias por tu tiempo [NOMBRE_CLIENTE]. Me da mucho gusto presentarte nuestra Penthouse Collection.

Lo que hace únicos a nuestros penthouses:

🏝️ **Ubicación Privilegiada**
- Frente a la playa más hermosa de Tulum
- A 5 minutos de la zona arqueológica
- Acceso directo a cenotes privados

🏢 **Características Exclusivas**
- Terrazas privadas de [TAMAÑO_TERRAZA] m²
- Jacuzzi privado con vista al mar
- Cocina gourmet completamente equipada

💰 **Inversión Inteligente**
- ROI proyectado del [ROI_PROYECTADO]% anual
- Programa de rentas vacacionales incluido

¿Qué te parece más interesante de lo que te he compartido?`,
        variables: ['NOMBRE_CLIENTE', 'TAMAÑO_TERRAZA', 'ROI_PROYECTADO'],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 20),
        updatedAt: new Date(Date.now() - 86400000 * 2),
        usage: 32,
        effectiveness: 92,
        aiGenerated: false
      },
      {
        id: '3',
        name: 'Manejo de Objeciones - Precio',
        type: 'objection',
        content: `Entiendo perfectamente tu preocupación sobre el precio, [NOMBRE_CLIENTE]. Es una inversión importante.

Permíteme ponerte en perspectiva:

**Comparación de Mercado:**
- Propiedades similares en la zona: $[PRECIO_COMPETENCIA] MXN
- Nuestro precio: $[PRECIO_NUESTRO] MXN
- Diferencia: Estás ahorrando $[AHORRO] MXN

**Valor Agregado Incluido:**
- Programa de rentas vacacionales
- Mobiliario completo
- Mantenimiento por 2 años

**Financiamiento Disponible:**
- Enganche desde el [ENGANCHE]%
- Pagos mensuales desde $[PAGO_MENSUAL] MXN

¿Cuál de estas opciones te ayudaría más a tomar la decisión?`,
        variables: ['NOMBRE_CLIENTE', 'PRECIO_COMPETENCIA', 'PRECIO_NUESTRO', 'AHORRO', 'ENGANCHE', 'PAGO_MENSUAL'],
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: new Date(Date.now() - 86400000 * 1),
        usage: 28,
        effectiveness: 78,
        aiGenerated: false
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
  }

  private createDemoActivities() {
    const activities = [
      {
        id: '1',
        userId: '1',
        leadId: '1',
        type: 'call',
        title: 'Llamada de calificación',
        description: 'Primera llamada de calificación con Carlos Hernández',
        pointsEarned: 5,
        duration: 20,
        outcome: 'Qualified lead, interested in penthouse units',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: '2',
        userId: '2',
        leadId: '2',
        type: 'meeting',
        title: 'Presentación Zoom',
        description: 'Presentación virtual de propiedades',
        pointsEarned: 10,
        duration: 45,
        outcome: 'Interested, needs to discuss with partner',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        userId: '5',
        leadId: '5',
        type: 'meeting',
        title: 'Visita presencial',
        description: 'Visita a las instalaciones',
        pointsEarned: 15,
        duration: 90,
        outcome: 'Booking confirmed',
        timestamp: new Date(Date.now() - 86400000)
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  private createDemoPoints() {
    const points = [
      // Mafer
      { userId: '1', activityType: 'presentation', subtype: 'zoom_broker', points: 12, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '1', activityType: 'presentation', subtype: 'zoom_client', points: 45, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '1', activityType: 'presentation', subtype: 'physical_client', points: 35, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '1', activityType: 'result', subtype: 'booking', points: 10, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '1', activityType: 'result', subtype: 'alliance_sale', points: 15, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '1', activityType: 'result', subtype: 'direct_sale', points: 20, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      
      // Mariano
      { userId: '2', activityType: 'presentation', subtype: 'zoom_broker', points: 18, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '2', activityType: 'presentation', subtype: 'zoom_client', points: 36, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '2', activityType: 'presentation', subtype: 'physical_broker', points: 18, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '2', activityType: 'result', subtype: 'booking', points: 10, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '2', activityType: 'result', subtype: 'alliance_sale', points: 30, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      
      // Pablo
      { userId: '3', activityType: 'presentation', subtype: 'zoom_broker', points: 15, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '3', activityType: 'presentation', subtype: 'zoom_client', points: 27, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '3', activityType: 'presentation', subtype: 'physical_client', points: 30, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '3', activityType: 'result', subtype: 'booking', points: 10, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '3', activityType: 'result', subtype: 'direct_sale', points: 20, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      
      // Jaquelite
      { userId: '4', activityType: 'presentation', subtype: 'zoom_client', points: 24, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '4', activityType: 'presentation', subtype: 'physical_client', points: 20, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '4', activityType: 'result', subtype: 'booking', points: 10, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '4', activityType: 'result', subtype: 'alliance_sale', points: 15, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      
      // Raquel
      { userId: '5', activityType: 'presentation', subtype: 'zoom_client', points: 18, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '5', activityType: 'presentation', subtype: 'physical_client', points: 15, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '5', activityType: 'result', subtype: 'booking', points: 10, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
      { userId: '5', activityType: 'result', subtype: 'direct_sale', points: 20, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
    ];
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(points));
  }

  // Métodos de acceso a datos
  async getUsers(): Promise<User[]> {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  async getLeads(): Promise<Lead[]> {
    const leads = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!leads) return [];
    
    return JSON.parse(leads).map((lead: any) => ({
      ...lead,
      createdAt: new Date(lead.createdAt),
      updatedAt: new Date(lead.updatedAt),
      nextActionDate: new Date(lead.nextActionDate)
    }));
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const leads = await this.getLeads();
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    leads.push(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leads = await this.getLeads();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) throw new Error('Lead not found');
    
    leads[index] = { ...leads[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    return leads[index];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Si es el usuario actual, actualizar también en el localStorage de sesión
    const currentUser = localStorage.getItem('current_user');
    if (currentUser) {
      const currentUserData = JSON.parse(currentUser);
      if (currentUserData.id === id) {
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }
    }
    
    return updatedUser;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    return await this.updateUser(id, { is_active: isActive });
  }
  async deleteLead(id: string): Promise<void> {
    const leads = await this.getLeads();
    const filteredLeads = leads.filter(lead => lead.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(filteredLeads));
  }

  async getMeetings(): Promise<Meeting[]> {
    const meetings = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (!meetings) return [];
    
    return JSON.parse(meetings).map((meeting: any) => ({
      ...meeting,
      date: new Date(meeting.date)
    }));
  }

  async createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    const meetings = await this.getMeetings();
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString()
    };
    
    meetings.push(newMeeting);
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    return newMeeting;
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    const meetings = await this.getMeetings();
    const index = meetings.findIndex(meeting => meeting.id === id);
    
    if (index === -1) throw new Error('Meeting not found');
    
    meetings[index] = { ...meetings[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    return meetings[index];
  }

  async getCalls(): Promise<Call[]> {
    const calls = localStorage.getItem(STORAGE_KEYS.CALLS);
    if (!calls) return [];
    
    return JSON.parse(calls).map((call: any) => ({
      ...call,
      startTime: call.startTime ? new Date(call.startTime) : undefined,
      endTime: call.endTime ? new Date(call.endTime) : undefined,
      scheduledTime: call.scheduledTime ? new Date(call.scheduledTime) : undefined
    }));
  }

  async createCall(call: Omit<Call, 'id'>): Promise<Call> {
    const calls = await this.getCalls();
    const newCall: Call = {
      ...call,
      id: Date.now().toString()
    };
    
    calls.push(newCall);
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
    return newCall;
  }

  async getScripts(): Promise<SalesScript[]> {
    const scripts = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    if (!scripts) return [];
    
    return JSON.parse(scripts).map((script: any) => ({
      ...script,
      createdAt: new Date(script.createdAt),
      updatedAt: new Date(script.updatedAt)
    }));
  }

  async createScript(script: Omit<SalesScript, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalesScript> {
    const scripts = await this.getScripts();
    const newScript: SalesScript = {
      ...script,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    scripts.push(newScript);
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    return newScript;
  }

  // Métodos para el sistema de puntos
  async getLeaderboard(): Promise<any[]> {
    const points = JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS) || '[]');
    const users = await this.getUsers();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const leaderboard = users
      .filter(user => user.role === 'broker')
      .map(user => {
        const userPoints = points.filter((p: any) => 
          p.userId === user.id && p.month === currentMonth && p.year === currentYear
        );
        
        const totalPoints = userPoints.reduce((sum: number, p: any) => sum + p.points, 0);
        const monthlyPoints = totalPoints;
        
        return {
          user_id: user.id,
          user_name: user.name,
          user_avatar: user.avatar,
          total_points: totalPoints,
          monthly_points: monthlyPoints
        };
      })
      .sort((a, b) => b.monthly_points - a.monthly_points);
    
    return leaderboard;
  }

  async getUserPointsSummary(userId: string): Promise<any> {
    const points = JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS) || '[]');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const userPoints = points.filter((p: any) => p.userId === userId);
    const monthlyPoints = userPoints
      .filter((p: any) => p.month === currentMonth && p.year === currentYear)
      .reduce((sum: number, p: any) => sum + p.points, 0);
    
    const totalPoints = userPoints.reduce((sum: number, p: any) => sum + p.points, 0);
    
    return {
      total_points: totalPoints,
      monthly_points: monthlyPoints,
      activity_breakdown: {},
      rank_position: 1
    };
  }

  async getRecentActivities(limit: number = 20): Promise<any[]> {
    const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
    const users = await this.getUsers();
    
    return activities
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((activity: any) => {
        const user = users.find(u => u.id === activity.userId);
        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          created_at: activity.timestamp,
          user_name: user?.name || 'Usuario',
          points_earned: activity.pointsEarned
        };
      });
  }

  async getUserPerformanceSummary(): Promise<any[]> {
    const users = await this.getUsers();
    const points = JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS) || '[]');
    const leads = await this.getLeads();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return users
      .filter(user => user.role === 'broker')
      .map(user => {
        const userPoints = points.filter((p: any) => 
          p.userId === user.id && p.month === currentMonth && p.year === currentYear
        );
        const userLeads = leads.filter(lead => lead.assignedTo === user.id);
        const closedDeals = userLeads.filter(lead => lead.status === 'sold').length;
        
        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          total_leads: userLeads.length,
          closed_deals: closedDeals,
          monthly_points: userPoints.reduce((sum: number, p: any) => sum + p.points, 0)
        };
      });
  }

  async getIntegrations(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'ghl',
        status: 'disconnected',
        config: { baseUrl: 'https://services.leadconnectorhq.com' },
        last_sync: new Date()
      },
      {
        id: '2',
        name: 'vapi',
        status: 'disconnected',
        config: { baseUrl: 'https://api.vapi.ai' },
        last_sync: new Date()
      },
      {
        id: '3',
        name: 'n8n',
        status: 'disconnected',
        config: { baseUrl: 'https://n8n.srv835901.hstgr.cloud' },
        last_sync: new Date()
      },
      {
        id: '4',
        name: 'whatsapp',
        status: 'error',
        config: { type: 'evolution-api', instanceName: 'real_estate' },
        last_sync: new Date()
      }
    ];
  }

  async getAutomations(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Bienvenida Nuevo Lead',
        trigger_type: 'lead_created',
        actions: [
          { type: 'whatsapp', template: 'welcome_message', delay: 0 },
          { type: 'task', title: 'Llamar en 1 hora', delay: 3600 }
        ],
        is_active: true
      },
      {
        id: '2',
        name: 'Seguimiento Post-Presentación',
        trigger_type: 'stage_changed',
        actions: [
          { type: 'email', template: 'post_presentation_followup', delay: 86400 },
          { type: 'whatsapp', template: 'presentation_feedback', delay: 172800 }
        ],
        is_active: true
      }
    ];
  }

  async toggleAutomation(automationId: string, isActive: boolean): Promise<void> {
    // Simulación - en una implementación real actualizaría la base de datos
    console.log(`Automation ${automationId} ${isActive ? 'activated' : 'deactivated'}`);
  }

  // Método para probar conexión (siempre exitoso en modo local)
  async testConnection(): Promise<boolean> {
    return true;
  }

  // Método para inicializar datos demo si es necesario
  async initializeDemoDataIfNeeded(): Promise<void> {
    this.initializeDemoData();
  }
}

export const localDataService = new LocalDataService();