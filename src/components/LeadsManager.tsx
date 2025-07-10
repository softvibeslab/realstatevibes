import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  TrendingUp,
  User,
  DollarSign,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Lead } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LeadsManager: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, [user]);

  const loadLeads = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const leadsData = await localDataService.getLeads();
      
      // Filter by assigned broker if not admin
      const userLeads = user.role === 'admin' 
        ? leadsData 
        : leadsData.filter(lead => lead.assignedTo === user.id);
      
      setLeads(userLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateLead = async (leadData: any) => {
    try {
      const newLead = await localDataService.createLead({
        ...leadData,
        assignedTo: user?.id || '',
        nextActionDate: new Date(Date.now() + 86400000), // Tomorrow
        interactions: [],
        scheduledMeetings: []
      });
      
      setLeads(prev => [newLead, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await localDataService.updateLead(leadId, updates);
      setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este lead?')) return;
    
    try {
      await localDataService.deleteLead(leadId);
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Leads</h1>
            <p className="text-slate-600">Cargando leads...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      presentation: 'bg-purple-100 text-purple-800',
      booked: 'bg-orange-100 text-orange-800',
      sold: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const handleShowScript = (lead: Lead) => {
    setSelectedLead(lead);
    setShowScriptModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Leads</h1>
          <p className="text-slate-600">Administra y da seguimiento a tus prospectos</p>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nuevo Lead</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar leads..."
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
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="qualified">Calificado</option>
            <option value="presentation">Presentación</option>
            <option value="booked">Apartado</option>
            <option value="sold">Vendido</option>
            <option value="lost">Perdido</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Más filtros
          </button>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{lead.name}</h3>
                  <p className="text-sm text-slate-600">{lead.source}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getPriorityIcon(lead.priority)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="w-4 h-4 mr-2" />
                {lead.email}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Phone className="w-4 h-4 mr-2" />
                {lead.phone}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <DollarSign className="w-4 h-4 mr-2" />
                ${lead.budget.toLocaleString()} MXN
              </div>
            </div>

            {lead.aiAnalysis && (
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">Análisis IA</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${getSentimentColor(lead.aiAnalysis.sentiment)}`} />
                    <span className="text-xs font-medium">{lead.aiAnalysis.buyingIntent}% intención</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{lead.aiAnalysis.nextBestAction}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-1">Próxima acción:</p>
              <p className="text-sm text-slate-600">{lead.nextAction}</p>
              <p className="text-xs text-slate-500">
                {format(lead.nextActionDate, "d 'de' MMMM, HH:mm", { locale: es })}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleLeadClick(lead)}
                  className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Llamar">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="WhatsApp">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Agendar">
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleShowScript(lead)}
                className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
              >
                Ver Script
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron leads</h3>
          <p className="text-slate-600">Ajusta los filtros o agrega nuevos leads para comenzar.</p>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Detalles del Lead</h2>
                <button 
                  onClick={() => setShowLeadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Información del Lead</h3>
                    <div className="space-y-2">
                      <p><strong>Nombre:</strong> {selectedLead.name}</p>
                      <p><strong>Email:</strong> {selectedLead.email}</p>
                      <p><strong>Teléfono:</strong> {selectedLead.phone}</p>
                      <p><strong>Fuente:</strong> {selectedLead.source}</p>
                      <p><strong>Presupuesto:</strong> ${selectedLead.budget.toLocaleString()} MXN</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Intereses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.interests.map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Notas</h3>
                    <p className="text-slate-600">{selectedLead.notes}</p>
                  </div>
                </div>

                {/* AI Analysis & Actions */}
                <div className="space-y-4">
                  {selectedLead.aiAnalysis && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Análisis de IA</h3>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Sentimiento:</span>
                          <span className={`font-medium ${getSentimentColor(selectedLead.aiAnalysis.sentiment)}`}>
                            {selectedLead.aiAnalysis.sentiment}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Intención de compra:</span>
                          <span className="font-medium">{selectedLead.aiAnalysis.buyingIntent}%</span>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Puntos clave:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {selectedLead.aiAnalysis.keyPoints.map((point, index) => (
                              <li key={index}>• {point}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Próxima mejor acción:</p>
                          <p className="text-sm text-slate-600">{selectedLead.aiAnalysis.nextBestAction}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                        <Phone className="w-4 h-4 mr-2" />
                        Llamar
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Script Modal */}
      {showScriptModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Script Recomendado</h2>
                <button 
                  onClick={() => setShowScriptModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-teal-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-teal-900 mb-2">Script para: {selectedLead.name}</h3>
                <p className="text-sm text-teal-700">
                  Basado en el análisis de IA - {selectedLead.aiAnalysis?.sentiment} sentiment, 
                  {selectedLead.aiAnalysis?.buyingIntent}% intención de compra
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Apertura</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">
                      "Hola {selectedLead.name}, habla [Tu nombre] de Real Estate CRM. 
                      Te contacto porque veo que has mostrado interés en nuestros desarrollos. 
                      {selectedLead.source === 'Referido' && 'Además, [nombre del referido] me comentó que podrías estar interesado en conocer más sobre nuestras opciones de inversión.'}
                      ¿Tienes unos minutos para platicar?"
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Preguntas de Descubrimiento</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <ul className="space-y-2 text-slate-700">
                      <li>• ¿Qué te motivó a buscar una propiedad en Tulum?</li>
                      <li>• ¿Estás buscando para uso personal o como inversión?</li>
                      <li>• ¿Cuál es tu timeline para tomar una decisión?</li>
                      <li>• ¿Has considerado el presupuesto que tienes disponible?</li>
                      {selectedLead.interests.includes('Inversión') && (
                        <li>• ¿Has invertido en bienes raíces antes?</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Propuesta de Valor</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">
                      "Perfecto, basado en lo que me comentas, creo que Real Estate podría ser exactamente lo que buscas. 
                      Tenemos {selectedLead.interests.includes('Penthouse') ? 'penthouses exclusivos' : 'departamentos'} 
                      que se alinean con tu presupuesto de ${selectedLead.budget.toLocaleString()} MXN. 
                      Lo que hace único a nuestro desarrollo es..."
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Cierre</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-700">
                      "Me encantaría mostrarte exactamente cómo esto puede funcionar para ti. 
                      ¿Qué te parece si agendamos una presentación {selectedLead.priority === 'high' ? 'presencial' : 'virtual'} 
                      para mañana o pasado mañana? Así puedes ver todos los detalles y hacer las preguntas que necesites."
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Notas Importantes</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {selectedLead.aiAnalysis?.keyPoints.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManager;