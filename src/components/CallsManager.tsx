import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Calendar, 
  User, 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Download,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Mail,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Call, Lead, CallScript } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const CallsManager: React.FC = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callType, setCallType] = useState<'manual' | 'vapi'>('manual');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [vapiStatus, setVapiStatus] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');

  useEffect(() => {

    loadCalls();
  }, [user]);

  const loadCalls = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const callsData = await localDataService.getCalls();
      
      // Filter calls by assigned broker if not admin
      const userCalls = user.role === 'admin' 
        ? callsData 
        : callsData.filter(call => call.assignedTo === user.id || call.assignedTo === 'vapi-bot');
      
      setCalls(userCalls);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCall = async (callData: any) => {
    try {
      const newCall = await localDataService.createCall({
        ...callData,
        assignedTo: user?.id || ''
      });
      
      setCalls(prev => [newCall, ...prev]);
    } catch (error) {
      console.error('Error creating call:', error);
    }
  };

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall && vapiStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall, vapiStatus]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Llamadas</h1>
            <p className="text-slate-600">Cargando llamadas...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      qualified: 'text-green-600',
      interested: 'text-blue-600',
      'not-interested': 'text-red-600',
      'no-answer': 'text-yellow-600',
      callback: 'text-purple-600'
    };
    return colors[outcome as keyof typeof colors] || 'text-gray-600';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startVapiCall = async (lead: Lead) => {
    setVapiStatus('connecting');
    setActiveCall({
      id: Date.now().toString(),
      leadId: lead.id,
      type: 'vapi',
      status: 'in-progress',
      startTime: new Date(),
      assignedTo: 'vapi-bot',
      leadInfo: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        budget: lead.budget,
        interests: lead.interests
      },
      vapiCallId: `vapi_${Date.now()}`
    });

    // Simulate VAPI connection
    setTimeout(() => {
      setVapiStatus('active');
      setCallDuration(0);
    }, 2000);
  };

  const endVapiCall = () => {
    if (activeCall) {
      const endedCall = {
        ...activeCall,
        status: 'completed' as const,
        endTime: new Date(),
        duration: callDuration,
        outcome: 'qualified' as const,
        notes: 'Llamada VAPI completada - Análisis automático generado'
      };
      
      setCalls(prev => [endedCall, ...prev]);
      setActiveCall(null);
      setVapiStatus('idle');
      setCallDuration(0);
    }
  };

  const startManualCall = (lead: Lead) => {
    setActiveCall({
      id: Date.now().toString(),
      leadId: lead.id,
      type: 'manual',
      status: 'in-progress',
      startTime: new Date(),
      assignedTo: user?.id || '1',
      leadInfo: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        budget: lead.budget,
        interests: lead.interests
      }
    });
    setCallDuration(0);
  };

  const endManualCall = (outcome: string, notes: string) => {
    if (activeCall) {
      const endedCall = {
        ...activeCall,
        status: 'completed' as const,
        endTime: new Date(),
        duration: callDuration,
        outcome: outcome as any,
        notes: notes
      };
      
      setCalls(prev => [endedCall, ...prev]);
      setActiveCall(null);
      setCallDuration(0);
      setShowCallModal(false);
    }
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.leadInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.leadInfo?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.leadInfo?.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = call.startTime ? 
        format(call.startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') :
        call.scheduledTime ? 
        format(call.scheduledTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;
    } else if (dateFilter === 'week') {
      const weekAgo = subDays(new Date(), 7);
      matchesDate = call.startTime ? call.startTime >= weekAgo : 
                   call.scheduledTime ? call.scheduledTime >= weekAgo : false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const callStats = {
    total: calls.length,
    completed: calls.filter(c => c.status === 'completed').length,
    scheduled: calls.filter(c => c.status === 'scheduled').length,
    avgDuration: calls.filter(c => c.duration).reduce((acc, c) => acc + (c.duration || 0), 0) / calls.filter(c => c.duration).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Llamadas</h1>
          <p className="text-slate-600">Administra llamadas manuales y automatizadas con VAPI</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Programar Llamada</span>
          </button>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Llamada</span>
          </button>
        </div>
      </div>

      {/* Active Call Widget */}
      {activeCall && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {activeCall.type === 'vapi' ? <Bot className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{activeCall.leadInfo?.name}</h3>
                <p className="text-blue-100">
                  {activeCall.type === 'vapi' ? 'Llamada VAPI' : 'Llamada Manual'} • {formatDuration(callDuration)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {activeCall.type === 'manual' && (
                <>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30'
                    }`}
                  >
                    {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </>
              )}
              
              <button
                onClick={activeCall.type === 'vapi' ? endVapiCall : () => setShowCallModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Finalizar</span>
              </button>
            </div>
          </div>
          
          {vapiStatus === 'connecting' && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-100">Conectando con VAPI...</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Llamadas</p>
              <p className="text-2xl font-bold text-slate-900">{callStats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completadas</p>
              <p className="text-2xl font-bold text-slate-900">{callStats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Programadas</p>
              <p className="text-2xl font-bold text-slate-900">{callStats.scheduled}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Duración Promedio</p>
              <p className="text-2xl font-bold text-slate-900">{formatDuration(Math.round(callStats.avgDuration))}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* VAPI Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-600" />
            Llamadas VAPI Automatizadas
          </h2>
          <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors flex items-center space-x-1">
            <Settings className="w-3 h-3" />
            <span>Configurar VAPI</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const lead = leads[0]; // Demo lead
              if (lead) startVapiCall(lead);
            }}
            disabled={!!activeCall}
            className="flex items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <Bot className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium text-slate-900">Llamada Inmediata</p>
              <p className="text-sm text-slate-600">Iniciar llamada VAPI ahora</p>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-slate-900">Programar Lote</p>
              <p className="text-sm text-slate-600">Programar múltiples llamadas</p>
            </div>
          </button>

          <button className="flex items-center justify-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-slate-900">Análisis IA</p>
              <p className="text-sm text-slate-600">Ver reportes de llamadas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar llamadas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="scheduled">Programadas</option>
            <option value="failed">Fallidas</option>
            <option value="in-progress">En progreso</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todas</option>
          </select>

          <select
            value={callType}
            onChange={(e) => setCallType(e.target.value as 'manual' | 'vapi')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="manual">Manuales</option>
            <option value="vapi">VAPI</option>
          </select>
        </div>
      </div>

      {/* Calls List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Historial de Llamadas</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    {call.type === 'vapi' ? <Bot className="w-5 h-5 text-purple-600" /> : <Phone className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{call.leadInfo?.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <span>{call.leadInfo?.phone}</span>
                      <span>•</span>
                      <span className="capitalize">{call.type}</span>
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                    {call.startTime && (
                      <p className="text-xs text-slate-500">
                        {format(call.startTime, "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    )}
                    {call.scheduledTime && !call.startTime && (
                      <p className="text-xs text-slate-500">
                        Programada: {format(call.scheduledTime, "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(call.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </div>
                    {call.outcome && (
                      <p className={`text-sm font-medium ${getOutcomeColor(call.outcome)}`}>
                        {call.outcome}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                      <Eye className="w-4 h-4" />
                    </button>
                    {call.recordingUrl && (
                      <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Descargar grabación">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Llamar de nuevo">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Programar Llamada</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Llamada</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  <option value="manual">Manual (Zoom/Teléfono)</option>
                  <option value="vapi">VAPI Automatizada</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lead</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name} - {lead.phone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Notas adicionales para la llamada..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Programar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Call Modal */}
      {showCallModal && activeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Finalizar Llamada</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resultado</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  <option value="qualified">Calificado</option>
                  <option value="interested">Interesado</option>
                  <option value="not-interested">No interesado</option>
                  <option value="callback">Llamar después</option>
                  <option value="no-answer">No contestó</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas de la llamada</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Resumen de la conversación, próximos pasos, etc..."
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">Duración de la llamada</h4>
                <p className="text-2xl font-bold text-teal-600">{formatDuration(callDuration)}</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Continuar llamada
              </button>
              <button
                onClick={() => endManualCall('qualified', 'Llamada completada exitosamente')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsManager;