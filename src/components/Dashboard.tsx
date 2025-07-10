import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, DollarSign, Calendar, Eye, Handshake, Building2, Phone, Video, MapPin } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { localDataService } from '../services/localDataService';
import { useAuth } from '../contexts/AuthContext';

interface Agent {
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

interface Activity {
  id: string;
  agentName: string;
  type: string;
  points: number;
  timestamp: Date;
  description: string;
  icon: React.ComponentType<any>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getLeaderboard, getUserPointsSummary, getNotifications } = useSupabase();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load leaderboard
      const leaderboardData = await getLeaderboard();
      const transformedAgents = leaderboardData.map((item: any, index: number) => ({
        id: item.user_id,
        name: item.user_name,
        avatar: item.user_avatar,
        totalPoints: item.total_points,
        monthlyPoints: item.monthly_points,
        presentations: {
          zoomBroker: Math.floor(Math.random() * 20),
          eventBroker: Math.floor(Math.random() * 10),
          zoomRealtors: Math.floor(Math.random() * 15),
          zoomClient: Math.floor(Math.random() * 20),
          physicalBroker: Math.floor(Math.random() * 8),
          physicalRealtors: Math.floor(Math.random() * 6),
          physicalClient: Math.floor(Math.random() * 10)
        },
        results: {
          bookings: Math.floor(Math.random() * 3) + 1,
          allianceSales: Math.floor(Math.random() * 2),
          directSales: Math.floor(Math.random() * 2)
        },
        trend: index < 2 ? 'up' : index < 4 ? 'stable' : 'down'
      }));
      setAgents(transformedAgents);

      // Load user stats
      if (user.id) {
        const stats = await getUserPointsSummary(user.id);
        setUserStats(stats);
      }

      // Load recent activities
      const activities = await localDataService.getRecentActivities(10);
      const transformedActivities = activities.map((activity: any) => ({
        id: activity.id,
        agentName: activity.user_name,
        type: activity.type,
        points: activity.points_earned || 0,
        timestamp: new Date(activity.created_at),
        description: activity.description || activity.title,
        icon: getActivityIcon(activity.type)
      }));
      setRecentActivities(transformedActivities);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'meeting': return Video;
      case 'whatsapp': return MessageSquare;
      case 'email': return Mail;
      case 'note': return Eye;
      default: return DollarSign;
    }
  };

  const calculatePresentationPoints = (presentations: Agent['presentations']) => {
    return (
      presentations.zoomBroker * 1 +
      presentations.eventBroker * 1 +
      presentations.zoomRealtors * 2 +
      presentations.zoomClient * 3 +
      presentations.physicalBroker * 3 +
      presentations.physicalRealtors * 4 +
      presentations.physicalClient * 5
    );
  };

  const calculateResultPoints = (results: Agent['results']) => {
    return (
      results.bookings * 10 +
      results.allianceSales * 15 +
      results.directSales * 20
    );
  };

  const totalMonthlyPoints = agents.reduce((sum, agent) => sum + agent.monthlyPoints, 0);
  const totalBookings = agents.reduce((sum, agent) => sum + agent.results.bookings, 0);
  const totalSales = agents.reduce((sum, agent) => sum + agent.results.allianceSales + agent.results.directSales, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Metas grupales
  const pointsGoal = 270;
  const salesGoal = 6;
  const pointsProgress = (totalMonthlyPoints / pointsGoal) * 100;
  const salesProgress = (totalSales / salesGoal) * 100;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `hace ${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `hace ${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Real Estate CRM</h1>
                <p className="text-slate-600">Sistema de Puntos y Ventas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Última actualización</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date().toLocaleString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Puntos del Mes</p>
                <p className="text-3xl font-bold text-slate-900">{totalMonthlyPoints}</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(pointsProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {Math.round(pointsProgress)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Meta: {pointsGoal} puntos</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Apartados</p>
                <p className="text-3xl font-bold text-slate-900">{totalBookings}</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Handshake className="w-4 h-4 mr-1" />
                  {Math.round((totalBookings / 15) * 100)}% de meta estimada
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ventas</p>
                <p className="text-3xl font-bold text-slate-900">{totalSales}</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(salesProgress, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {Math.round(salesProgress)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Meta: {salesGoal} ventas</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Agentes Activos</p>
                <p className="text-3xl font-bold text-slate-900">{agents.length}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <Users className="w-4 h-4 mr-1" />
                  100% participación
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-teal-600" />
                    Leaderboard del Mes
                  </h2>
                  <div className="text-sm text-slate-600">
                    Enero 2025
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {agents
                    .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
                    .map((agent, index) => (
                      <div
                        key={agent.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] ${
                          index === 0
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
                            : index === 1
                            ? 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200'
                            : index === 2
                            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div
                              className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                  : index === 1
                                  ? 'bg-gradient-to-r from-slate-400 to-gray-500 text-white'
                                  : index === 2
                                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white'
                                  : 'bg-slate-300 text-slate-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <span>{agent.monthlyPoints} pts este mes</span>
                              {getTrendIcon(agent.trend)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {agent.totalPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-600">puntos totales</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                  Actividad Reciente
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.agentName}
                          </p>
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                            +{activity.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-teal-600" />
                Desglose de Puntuación
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Presentations Points */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Presentaciones</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">Zoom Broker</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">1 punto</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium">Eventos Broker</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">1 punto</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium">Zoom Inmobiliarias (+3)</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">2 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium">Zoom Cliente Final</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">3 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium">Física Broker</span>
                      </div>
                      <span className="text-sm font-bold text-teal-600">3 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium">Física Inmobiliarias (+3)</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">4 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium">Física Cliente Final</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">5 puntos</span>
                    </div>
                  </div>
                </div>

                {/* Results Points */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Resultados</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Handshake className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-blue-900">Apartado</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">10 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-amber-600" />
                        <span className="font-medium text-amber-900">Venta Alianza/Broker</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600">+5 puntos</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-green-900">Venta Propia</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">+10 puntos</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                    <h4 className="font-semibold text-teal-900 mb-2">Meta Grupal</h4>
                    <div className="space-y-2 text-sm text-teal-700">
                      <div className="flex items-center justify-between">
                        <span>Puntos del mes:</span>
                        <span className="font-bold">{totalMonthlyPoints} / {pointsGoal}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ventas del mes:</span>
                        <span className="font-bold">{totalSales} / {salesGoal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2">Integración Técnica</h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>GoHighLevel: CRM y Pipeline</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>n8n: Automatización de workflows</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>Vapi: Integración de llamadas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;