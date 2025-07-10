import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Award, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar, 
  BarChart3, 
  Target, 
  DollarSign,
  Camera,
  Save,
  X,
  Upload,
  Shield,
  Star,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CreateBrokerModal from './CreateBrokerModal';

interface BrokerStats {
  totalLeads: number;
  qualifiedLeads: number;
  totalCalls: number;
  totalMeetings: number;
  totalSales: number;
  totalRevenue: number;
  monthlyPoints: number;
  totalPoints: number;
  conversionRate: number;
  avgCallDuration: number;
  satisfaction: number;
  rank: number;
}

const BrokersManager: React.FC = () => {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<User[]>([]);
  const [brokersStats, setBrokersStats] = useState<Record<string, BrokerStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBroker, setSelectedBroker] = useState<User | null>(null);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: '',
    role: 'broker' as 'broker' | 'admin'
  });

  useEffect(() => {
    loadBrokers();
  }, []);

  const loadBrokers = async () => {
    setIsLoading(true);
    try {
      const users = await localDataService.getUsers();
      const brokersOnly = users.filter(u => u.role === 'broker' || u.role === 'admin');
      setBrokers(brokersOnly);
      
      // Load stats for each broker
      const stats: Record<string, BrokerStats> = {};
      for (const broker of brokersOnly) {
        stats[broker.id] = await loadBrokerStats(broker.id);
      }
      setBrokersStats(stats);
    } catch (error) {
      console.error('Error loading brokers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrokerStats = async (brokerId: string): Promise<BrokerStats> => {
    try {
      // Load leads
      const leads = await localDataService.getLeads();
      const brokerLeads = leads.filter(lead => lead.assignedTo === brokerId);
      
      // Load calls
      const calls = await localDataService.getCalls();
      const brokerCalls = calls.filter(call => call.assignedTo === brokerId);
      
      // Load meetings
      const meetings = await localDataService.getMeetings();
      const brokerMeetings = meetings.filter(meeting => 
        meeting.attendees.some(attendee => attendee.includes(getBrokerName(brokerId)))
      );
      
      // Load points
      const pointsSummary = await localDataService.getUserPointsSummary(brokerId);
      
      // Calculate stats
      const qualifiedLeads = brokerLeads.filter(lead => 
        ['qualified', 'presentation', 'booked', 'sold'].includes(lead.status)
      ).length;
      
      const totalSales = brokerLeads.filter(lead => lead.status === 'sold').length;
      const totalRevenue = brokerLeads
        .filter(lead => lead.status === 'sold')
        .reduce((sum, lead) => sum + lead.budget, 0);
      
      const completedCalls = brokerCalls.filter(call => call.status === 'completed');
      const avgCallDuration = completedCalls.length > 0 
        ? completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / completedCalls.length / 60
        : 0;
      
      const conversionRate = brokerLeads.length > 0 
        ? (totalSales / brokerLeads.length) * 100 
        : 0;

      return {
        totalLeads: brokerLeads.length,
        qualifiedLeads,
        totalCalls: brokerCalls.length,
        totalMeetings: brokerMeetings.length,
        totalSales,
        totalRevenue,
        monthlyPoints: pointsSummary.monthly_points || 0,
        totalPoints: pointsSummary.total_points || 0,
        conversionRate,
        avgCallDuration,
        satisfaction: 4.2 + Math.random() * 0.8, // Mock satisfaction score
        rank: pointsSummary.rank_position || 0
      };
    } catch (error) {
      console.error('Error loading broker stats:', error);
      return {
        totalLeads: 0,
        qualifiedLeads: 0,
        totalCalls: 0,
        totalMeetings: 0,
        totalSales: 0,
        totalRevenue: 0,
        monthlyPoints: 0,
        totalPoints: 0,
        conversionRate: 0,
        avgCallDuration: 0,
        satisfaction: 0,
        rank: 0
      };
    }
  };

  const getBrokerName = (brokerId: string): string => {
    const broker = brokers.find(b => b.id === brokerId);
    return broker?.name || '';
  };

  const handleCreateBroker = async (brokerData: any) => {
    try {
      const newBroker = await localDataService.createUser({
        name: brokerData.name,
        email: brokerData.email,
        role: brokerData.role,
        avatar: brokerData.avatar || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        permissions: brokerData.role === 'admin' ? ['*'] : ['leads:read', 'leads:write', 'meetings:read', 'meetings:write'],
        is_active: true
      });
      
      setBrokers(prev => [newBroker, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating broker:', error);
    }
  };

  const handleUpdateBroker = async (brokerId: string, updates: Partial<User>) => {
    try {
      const updatedBroker = await localDataService.updateUser(brokerId, updates);
      setBrokers(prev => prev.map(broker => 
        broker.id === brokerId ? updatedBroker : broker
      ));
      
      setEditingProfile(false);
      setSelectedBroker(updatedBroker);
    } catch (error) {
      console.error('Error updating broker:', error);
    }
  };

  const handleToggleBrokerStatus = async (brokerId: string, isActive: boolean) => {
    try {
      const updatedBroker = await localDataService.toggleUserStatus(brokerId, isActive);
      setBrokers(prev => prev.map(broker => 
        broker.id === brokerId ? updatedBroker : broker
      ));
    } catch (error) {
      console.error('Error toggling broker status:', error);
    }
  };

  const handleDeleteBroker = async (brokerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este broker? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await localDataService.deleteUser(brokerId);
      setBrokers(prev => prev.filter(broker => broker.id !== brokerId));
      if (selectedBroker?.id === brokerId) {
        setShowBrokerModal(false);
        setSelectedBroker(null);
      }
    } catch (error) {
      console.error('Error deleting broker:', error);
    }
  };

  const openBrokerProfile = (broker: User) => {
    setSelectedBroker(broker);
    setProfileForm({
      name: broker.name,
      email: broker.email,
      avatar: broker.avatar,
      role: broker.role
    });
    setShowBrokerModal(true);
    setEditingProfile(false);
  };

  const openBrokerStats = (broker: User) => {
    setSelectedBroker(broker);
    setShowStatsModal(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamaño del archivo (máx. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        return;
      }
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileForm(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.onerror = () => {
        alert('Error al leer el archivo. Por favor intenta de nuevo.');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && broker.is_active) ||
                         (statusFilter === 'inactive' && !broker.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Brokers</h1>
            <p className="text-slate-600">Cargando brokers...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Brokers</h1>
          <p className="text-slate-600">Administra el equipo de ventas y sus perfiles</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Broker</span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Brokers</p>
              <p className="text-2xl font-bold text-slate-900">{brokers.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Brokers Activos</p>
              <p className="text-2xl font-bold text-slate-900">
                {brokers.filter(b => b.is_active).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-slate-900">
                {Object.values(brokersStats).reduce((sum, stats) => sum + stats.totalSales, 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(Object.values(brokersStats).reduce((sum, stats) => sum + stats.totalRevenue, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar brokers..."
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
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Más filtros
          </button>
        </div>
      </div>

      {/* Brokers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBrokers.map((broker) => {
          const stats = brokersStats[broker.id] || {} as BrokerStats;
          return (
            <div key={broker.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={broker.avatar}
                      alt={broker.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      broker.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{broker.name}</h3>
                    <p className="text-sm text-slate-600">{broker.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        broker.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {broker.role === 'admin' ? 'Admin' : 'Broker'}
                      </span>
                      {stats.rank > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          #{stats.rank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => openBrokerProfile(broker)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver perfil"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openBrokerStats(broker)}
                    className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver estadísticas"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleToggleBrokerStatus(broker.id, !broker.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          broker.is_active
                            ? 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                            : 'text-slate-600 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={broker.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {broker.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBroker(broker.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{stats.totalLeads}</p>
                  <p className="text-xs text-slate-600">Leads</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{stats.totalSales}</p>
                  <p className="text-xs text-slate-600">Ventas</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-teal-600">{stats.monthlyPoints}</p>
                  <p className="text-xs text-slate-600">Puntos</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-slate-600">Conversión</p>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-slate-900">{stats.satisfaction.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-slate-600">satisfacción</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    ${(stats.totalRevenue / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>

              {/* Last Login */}
              {broker.last_login && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Último acceso: {format(new Date(broker.last_login), 'd MMM, HH:mm', { locale: es })}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Broker Profile Modal */}
      {showBrokerModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProfile ? 'Editar Perfil' : 'Perfil del Broker'}
                </h2>
                <div className="flex items-center space-x-2">
                  {!editingProfile && (user?.role === 'admin' || user?.id === selectedBroker.id) && (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowBrokerModal(false)}
                    disabled={isLoading}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {editingProfile ? (
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img
                        src={profileForm.avatar}
                        alt={profileForm.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">Foto de Perfil</h3>
                      <p className="text-sm text-slate-600">Haz clic en la imagen para cambiarla (JPG, PNG, máx. 5MB)</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
                      <select
                        value={profileForm.role}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, role: e.target.value as 'broker' | 'admin' }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="broker">Broker</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateBroker(selectedBroker.id, profileForm)}
                      className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-6">
                    <img
                      src={selectedBroker.avatar}
                      alt={selectedBroker.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedBroker.name}</h3>
                      <p className="text-slate-600">{selectedBroker.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedBroker.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedBroker.role === 'admin' ? 'Administrador' : 'Broker'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedBroker.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedBroker.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">Email</span>
                      </div>
                      <p className="text-slate-700">{selectedBroker.email}</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">Permisos</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedBroker.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Last Login */}
                  {selectedBroker.last_login && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">Último Acceso</span>
                      </div>
                      <p className="text-slate-700">
                        {format(new Date(selectedBroker.last_login), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Estadísticas de {selectedBroker.name}
                </h2>
                <button 
                  onClick={() => setShowStatsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <BrokerStatsContent 
                broker={selectedBroker} 
                stats={brokersStats[selectedBroker.id] || {} as BrokerStats} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Broker Modal */}
      {showCreateModal && (
        <CreateBrokerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateBroker}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Component for broker stats content
const BrokerStatsContent: React.FC<{ broker: User; stats: BrokerStats }> = ({ broker, stats }) => {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Leads</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalLeads}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ventas</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalSales}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Puntos del Mes</p>
              <p className="text-2xl font-bold text-purple-900">{stats.monthlyPoints}</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Conversión</p>
              <p className="text-2xl font-bold text-orange-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Actividades</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Total Llamadas</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.totalCalls}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-slate-700">Reuniones</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.totalMeetings}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">Leads Calificados</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.qualifiedLeads}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-slate-700">Duración Promedio</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.avgCallDuration.toFixed(1)} min</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Resultados</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-slate-700">Ingresos Totales</span>
              </div>
              <span className="font-semibold text-slate-900">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">Puntos Totales</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.totalPoints}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-slate-700">Satisfacción</span>
              </div>
              <span className="font-semibold text-slate-900">{stats.satisfaction.toFixed(1)}/5.0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">Ranking</span>
              </div>
              <span className="font-semibold text-slate-900">#{stats.rank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Rendimiento Mensual</h3>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">Gráfico de rendimiento disponible próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};



export default BrokersManager;