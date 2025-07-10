import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  User,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Meeting, Lead } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const MeetingsManager: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const meetingsData = await localDataService.getMeetings();
      
      // Filter meetings by assigned broker if not admin
      const userMeetings = user.role === 'admin' 
        ? meetingsData 
        : meetingsData.filter(meeting => 
            meeting.attendees.includes(user.name) || 
            meeting.attendees.includes(user.email)
          );
      
      setMeetings(userMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'zoom':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'in-person':
        return <MapPin className="w-4 h-4 text-green-600" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const newMeeting = await localDataService.createMeeting({
        ...meetingData,
        attendees: [meetingData.leadName, user?.name || 'Broker']
      });
      
      setMeetings(prev => [newMeeting, ...prev]);
      setShowMeetingModal(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleUpdateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
    try {
      const updatedMeeting = await localDataService.updateMeeting(meetingId, updates);
      setMeetings(prev => prev.map(meeting => meeting.id === meetingId ? updatedMeeting : meeting));
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const syncWithGHL = async () => {
    setSyncStatus('syncing');
    setIsLoading(true);
    
    // Simulate API call to GHL
    setTimeout(() => {
      setSyncStatus('success');
      setIsLoading(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Reuniones</h1>
            <p className="text-slate-600">Cargando reuniones...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingModal(true);
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.leadInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.leadInfo?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const todayMeetings = filteredMeetings.filter(meeting => 
    isSameDay(meeting.date, new Date())
  );

  const upcomingMeetings = filteredMeetings.filter(meeting => 
    meeting.date > new Date() && !isSameDay(meeting.date, new Date())
  ).slice(0, 5);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i);
    return date;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Reuniones</h1>
          <p className="text-slate-600">Administra tu calendario y reuniones sincronizadas con GoHighLevel</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={syncWithGHL}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              syncStatus === 'success' 
                ? 'bg-green-100 text-green-700' 
                : syncStatus === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {syncStatus === 'syncing' ? 'Sincronizando...' : 
               syncStatus === 'success' ? 'Sincronizado' : 
               'Sincronizar GHL'}
            </span>
          </button>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Reunión</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Hoy</p>
              <p className="text-2xl font-bold text-slate-900">{todayMeetings.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Esta Semana</p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredMeetings.filter(m => {
                  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
                  return m.date >= weekStart && m.date <= weekEnd;
                }).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completadas</p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredMeetings.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredMeetings.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar reuniones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="no-show">No asistió</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Calendario
            </button>
          </div>
        </div>
      </div>

      {/* Today's Meetings */}
      {todayMeetings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-600" />
              Reuniones de Hoy
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todayMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => handleMeetingClick(meeting)}
                >
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(meeting.type)}
                    <div>
                      <h3 className="font-medium text-slate-900">{meeting.title}</h3>
                      <p className="text-sm text-slate-600">
                        {format(meeting.date, 'HH:mm')} • {meeting.duration} min • {meeting.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                    {meeting.type === 'zoom' && meeting.zoomLink && (
                      <a
                        href={meeting.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Próximas Reuniones</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleMeetingClick(meeting)}
                >
                  <div className="flex items-center space-x-4">
                    {getTypeIcon(meeting.type)}
                    <div>
                      <h3 className="font-medium text-slate-900">{meeting.title}</h3>
                      <p className="text-sm text-slate-600">
                        {format(meeting.date, "d 'de' MMMM, HH:mm", { locale: es })} • {meeting.duration} min
                      </p>
                      <p className="text-sm text-slate-500">{meeting.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{meeting.leadInfo?.name}</p>
                      <p className="text-xs text-slate-600">${meeting.leadInfo?.budget.toLocaleString()} MXN</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                    <div className="flex space-x-1">
                      <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Vista de Calendario</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <span className="text-sm font-medium text-slate-900">
                  {format(selectedDate, "MMMM yyyy", { locale: es })}
                </span>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                  {day}
                </div>
              ))}
              {weekDays.map((day) => {
                const dayMeetings = filteredMeetings.filter(meeting => 
                  isSameDay(meeting.date, day)
                );
                return (
                  <div key={day.toISOString()} className="min-h-[120px] border border-slate-200 rounded-lg p-2">
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 3).map((meeting) => (
                        <div
                          key={meeting.id}
                          className="text-xs p-1 bg-teal-100 text-teal-700 rounded cursor-pointer hover:bg-teal-200 transition-colors"
                          onClick={() => handleMeetingClick(meeting)}
                        >
                          {format(meeting.date, 'HH:mm')} {meeting.title.substring(0, 20)}...
                        </div>
                      ))}
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{dayMeetings.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {showMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Detalles de la Reunión</h2>
                <button 
                  onClick={() => setShowMeetingModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Meeting Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Información de la Reunión</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Título</p>
                    <p className="font-medium">{selectedMeeting.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMeeting.status)}`}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Fecha y Hora</p>
                    <p className="font-medium">
                      {format(selectedMeeting.date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Duración</p>
                    <p className="font-medium">{selectedMeeting.duration} minutos</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tipo</p>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedMeeting.type)}
                      <span className="font-medium capitalize">{selectedMeeting.type}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Ubicación</p>
                    <p className="font-medium">{selectedMeeting.location}</p>
                  </div>
                </div>
              </div>

              {/* Lead Info */}
              {selectedMeeting.leadInfo && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Información del Lead</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{selectedMeeting.leadInfo.name}</p>
                          <p className="text-sm text-slate-600">{selectedMeeting.leadInfo.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">${selectedMeeting.leadInfo.budget.toLocaleString()} MXN</p>
                        <p className="text-sm text-slate-600">Presupuesto</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Intereses:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.leadInfo.interests.map((interest, index) => (
                          <span key={index} className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Notas</h3>
                <p className="text-slate-600 bg-slate-50 rounded-lg p-4">{selectedMeeting.notes}</p>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Acciones</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedMeeting.type === 'zoom' && selectedMeeting.zoomLink && (
                    <a
                      href={selectedMeeting.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Unirse a Zoom
                    </a>
                  )}
                  <button className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </button>
                </div>
              </div>

              {/* GHL Integration Info */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-semibold text-teal-900 mb-2">Integración GoHighLevel</h4>
                <div className="text-sm text-teal-700 space-y-1">
                  <p><strong>Event ID:</strong> {selectedMeeting.ghlEventId}</p>
                  <p><strong>Sincronizado:</strong> {selectedMeeting.reminderSent ? 'Sí' : 'Pendiente'}</p>
                  <p><strong>Recordatorio:</strong> {selectedMeeting.reminderSent ? 'Enviado' : 'Pendiente'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsManager;