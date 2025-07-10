import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Phone, 
  Calendar, 
  DollarSign, 
  Target, 
  Award, 
  Clock, 
  Eye, 
  Download, 
  Filter, 
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Zap,
  MessageSquare,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Building2,
  Briefcase,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabase } from '../hooks/useSupabase';
import { localDataService } from '../services/localDataService';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportData {
  period: string;
  leads: number;
  calls: number;
  meetings: number;
  sales: number;
  revenue: number;
  conversion: number;
}

interface AgentPerformance {
  id: string;
  name: string;
  avatar: string;
  leads: number;
  calls: number;
  meetings: number;
  sales: number;
  revenue: number;
  points: number;
  conversion: number;
  avgCallDuration: number;
  satisfaction: number;
}

interface ChannelPerformance {
  channel: string;
  leads: number;
  conversion: number;
  cost: number;
  roi: number;
  trend: 'up' | 'down' | 'stable';
}

interface ActivityMetrics {
  presentations: {
    zoom: number;
    physical: number;
    total: number;
  };
  calls: {
    manual: number;
    vapi: number;
    total: number;
    avgDuration: number;
  };
  meetings: {
    scheduled: number;
    completed: number;
    noShow: number;
    conversion: number;
  };
}

const ReportsManager: React.FC = () => {
  const { user } = useAuth();
  const { getLeaderboard, getUserPointsSummary } = useSupabase();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod, user]);

  const loadReportsData = async () => {
    setIsLoading(true);
    
    try {
      // Load performance summary from Supabase
      const performanceData = await localDataService.getUserPerformanceSummary();
      
      const transformedPerformance = performanceData.map((item: any) => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        leads: item.total_leads || 0,
        calls: Math.floor(Math.random() * 50) + 10, // Mock data for now
        meetings: Math.floor(Math.random() * 20) + 5,
        sales: item.closed_deals || 0,
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
        points: item.monthly_points || 0,
        conversion: item.total_leads > 0 ? ((item.closed_deals || 0) / item.total_leads * 100) : 0,
        avgCallDuration: Math.floor(Math.random() * 10) + 15,
        satisfaction: 4.0 + Math.random() * 1.0
      }));
      
      setAgentPerformance(transformedPerformance);

      // Generate mock report data (can be replaced with real data later)
      const mockReportData: ReportData[] = Array.from({ length: 12 }, (_, i) => {
        const baseLeads = 45 + Math.floor(Math.random() * 20);
        const baseCalls = baseLeads * (0.7 + Math.random() * 0.2);
        const baseMeetings = baseCalls * (0.4 + Math.random() * 0.2);
        const baseSales = baseMeetings * (0.15 + Math.random() * 0.1);
        
        return {
          period: selectedPeriod === 'week' 
            ? `Semana ${12 - i}` 
            : selectedPeriod === 'month'
            ? format(subDays(new Date(), i * 30), 'MMM yyyy', { locale: es })
            : `Q${Math.ceil((12 - i) / 3)} 2024`,
          leads: Math.floor(baseLeads),
          calls: Math.floor(baseCalls),
          meetings: Math.floor(baseMeetings),
          sales: Math.floor(baseSales),
          revenue: Math.floor(baseSales * (1800000 + Math.random() * 1200000)),
          conversion: Math.round((baseSales / baseLeads) * 100 * 10) / 10
        };
      }).reverse();
      
      setReportData(mockReportData);

      // Generate mock channel performance data
      const mockChannelPerformance: ChannelPerformance[] = [
        {
          channel: 'Facebook Ads',
          leads: 45,
          conversion: 12.8,
          cost: 85000,
          roi: 285,
          trend: 'up'
        },
        {
          channel: 'Google Ads',
          leads: 32,
          conversion: 15.6,
          cost: 120000,
          roi: 320,
          trend: 'up'
        },
        {
          channel: 'Referidos',
          leads: 18,
          conversion: 22.2,
          cost: 0,
          roi: 999,
          trend: 'stable'
        },
        {
          channel: 'Instagram',
          leads: 28,
          conversion: 8.9,
          cost: 65000,
          roi: 180,
          trend: 'down'
        },
        {
          channel: 'WhatsApp',
          leads: 15,
          conversion: 18.7,
          cost: 25000,
          roi: 420,
          trend: 'up'
        },
        {
          channel: 'Eventos',
          leads: 12,
          conversion: 25.0,
          cost: 150000,
          roi: 200,
          trend: 'stable'
        }
      ];

      // Generate activity metrics
      const mockActivityMetrics: ActivityMetrics = {
        presentations: {
          zoom: 156,
          physical: 89,
          total: 245
        },
        calls: {
          manual: 198,
          vapi: 87,
          total: 285,
          avgDuration: 18.7
        },
        meetings: {
          scheduled: 80,
          completed: 68,
          noShow: 12,
          conversion: 85.0
        }
      };

      setChannelPerformance(mockChannelPerformance);
      setActivityMetrics(mockActivityMetrics);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentPeriodData = reportData[reportData.length - 1];
  const previousPeriodData = reportData[reportData.length - 2];

  const calculateGrowth = (current: number, previous: number) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  };

  const totalRevenue = agentPerformance.reduce((sum, agent) => sum + agent.revenue, 0);
  const totalSales = agentPerformance.reduce((sum, agent) => sum + agent.sales, 0);
  const totalLeads = agentPerformance.reduce((sum, agent) => sum + agent.leads, 0);
  const avgConversion = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes y Análisis</h1>
          <p className="text-slate-600">Dashboard completo de métricas y rendimiento del equipo</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="week">Semanal</option>
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral</option>
          </select>
          <button
            onClick={loadReportsData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-slate-600">
        Última actualización: {format(lastUpdated, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              {previousPeriodData && (
                <div className="flex items-center mt-1">
                  {getTrendIcon(calculateGrowth(currentPeriodData?.revenue || 0, previousPeriodData?.revenue || 0) > 0 ? 'up' : 'down')}
                  <span className={`text-sm ml-1 ${
                    calculateGrowth(currentPeriodData?.revenue || 0, previousPeriodData?.revenue || 0) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateGrowth(currentPeriodData?.revenue || 0, previousPeriodData?.revenue || 0))}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-slate-900">{totalSales}</p>
              {previousPeriodData && (
                <div className="flex items-center mt-1">
                  {getTrendIcon(calculateGrowth(currentPeriodData?.sales || 0, previousPeriodData?.sales || 0) > 0 ? 'up' : 'down')}
                  <span className={`text-sm ml-1 ${
                    calculateGrowth(currentPeriodData?.sales || 0, previousPeriodData?.sales || 0) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateGrowth(currentPeriodData?.sales || 0, previousPeriodData?.sales || 0))}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Leads Totales</p>
              <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
              {previousPeriodData && (
                <div className="flex items-center mt-1">
                  {getTrendIcon(calculateGrowth(currentPeriodData?.leads || 0, previousPeriodData?.leads || 0) > 0 ? 'up' : 'down')}
                  <span className={`text-sm ml-1 ${
                    calculateGrowth(currentPeriodData?.leads || 0, previousPeriodData?.leads || 0) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateGrowth(currentPeriodData?.leads || 0, previousPeriodData?.leads || 0))}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conversión Promedio</p>
              <p className="text-2xl font-bold text-slate-900">{avgConversion.toFixed(1)}%</p>
              {previousPeriodData && (
                <div className="flex items-center mt-1">
                  {getTrendIcon(calculateGrowth(currentPeriodData?.conversion || 0, previousPeriodData?.conversion || 0) > 0 ? 'up' : 'down')}
                  <span className={`text-sm ml-1 ${
                    calculateGrowth(currentPeriodData?.conversion || 0, previousPeriodData?.conversion || 0) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {Math.abs(calculateGrowth(currentPeriodData?.conversion || 0, previousPeriodData?.conversion || 0))}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Tendencia de Rendimiento</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm px-3 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="overview">General</option>
              <option value="leads">Leads</option>
              <option value="sales">Ventas</option>
              <option value="revenue">Ingresos</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {reportData.slice(-8).map((data, index) => {
              const maxValue = Math.max(...reportData.map(d => 
                selectedMetric === 'leads' ? d.leads :
                selectedMetric === 'sales' ? d.sales :
                selectedMetric === 'revenue' ? d.revenue / 1000000 :
                d.leads
              ));
              
              const value = selectedMetric === 'leads' ? data.leads :
                           selectedMetric === 'sales' ? data.sales :
                           selectedMetric === 'revenue' ? data.revenue / 1000000 :
                           data.leads;
              
              const height = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all duration-500 hover:from-teal-600 hover:to-teal-500"
                    style={{ height: `${height}%` }}
                    title={`${data.period}: ${value}`}
                  ></div>
                  <p className="text-xs text-slate-600 mt-2 text-center">{data.period.split(' ')[0]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Rendimiento por Canal</h2>
          <div className="space-y-4">
            {channelPerformance.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{channel.channel}</p>
                    <p className="text-sm text-slate-600">{channel.leads} leads • {channel.conversion}% conversión</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">ROI: {channel.roi}%</p>
                    <p className="text-xs text-slate-600">{formatCurrency(channel.cost)}</p>
                  </div>
                  {getTrendIcon(channel.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Rendimiento por Agente</h2>
            <div className="flex items-center space-x-2">
              <button className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors">
                <Eye className="w-3 h-3 inline mr-1" />
                Ver detalles
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-slate-600">
                  <th className="pb-3">Agente</th>
                  <th className="pb-3">Leads</th>
                  <th className="pb-3">Llamadas</th>
                  <th className="pb-3">Reuniones</th>
                  <th className="pb-3">Ventas</th>
                  <th className="pb-3">Ingresos</th>
                  <th className="pb-3">Conversión</th>
                  <th className="pb-3">Puntos</th>
                  <th className="pb-3">Satisfacción</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {agentPerformance
                  .sort((a, b) => b.points - a.points)
                  .map((agent, index) => (
                    <tr key={agent.id} className="border-t border-slate-100">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-400 text-gray-900' :
                                'bg-orange-400 text-orange-900'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{agent.name}</p>
                            <p className="text-sm text-slate-600">Broker</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-900">{agent.leads}</td>
                      <td className="py-4 text-slate-900">{agent.calls}</td>
                      <td className="py-4 text-slate-900">{agent.meetings}</td>
                      <td className="py-4 font-medium text-slate-900">{agent.sales}</td>
                      <td className="py-4 font-medium text-green-600">{formatCurrency(agent.revenue)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.conversion >= 15 ? 'bg-green-100 text-green-800' :
                          agent.conversion >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {agent.conversion}%
                        </span>
                      </td>
                      <td className="py-4 font-bold text-teal-600">{agent.points}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-900">{agent.satisfaction}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      {activityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Presentations */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Presentaciones</h3>
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Zoom</span>
                <span className="font-medium text-slate-900">{activityMetrics.presentations.zoom}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Presenciales</span>
                <span className="font-medium text-slate-900">{activityMetrics.presentations.physical}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">{activityMetrics.presentations.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Llamadas</h3>
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Manuales</span>
                <span className="font-medium text-slate-900">{activityMetrics.calls.manual}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">VAPI</span>
                <span className="font-medium text-slate-900">{activityMetrics.calls.vapi}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Duración Promedio</span>
                <span className="font-medium text-slate-900">{activityMetrics.calls.avgDuration} min</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Total</span>
                  <span className="text-lg font-bold text-green-600">{activityMetrics.calls.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Reuniones</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Programadas</span>
                <span className="font-medium text-slate-900">{activityMetrics.meetings.scheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Completadas</span>
                <span className="font-medium text-slate-900">{activityMetrics.meetings.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">No Show</span>
                <span className="font-medium text-red-600">{activityMetrics.meetings.noShow}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">Conversión</span>
                  <span className="text-lg font-bold text-purple-600">{activityMetrics.meetings.conversion}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Estado de Integraciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'GoHighLevel', status: 'connected', lastSync: '2 min ago', icon: Building2 },
            { name: 'n8n Workflows', status: 'connected', lastSync: '5 min ago', icon: Zap },
            { name: 'VAPI', status: 'connected', lastSync: '1 min ago', icon: Phone },
            { name: 'WhatsApp', status: 'error', lastSync: '2 hours ago', icon: MessageSquare }
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  integration.status === 'connected' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <integration.icon className={`w-4 h-4 ${
                    integration.status === 'connected' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{integration.name}</p>
                  <p className="text-xs text-slate-600">Sync: {integration.lastSync}</p>
                </div>
              </div>
              {integration.status === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Progreso de Metas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Meta de Ventas Mensual</span>
              <span className="text-sm text-slate-600">{totalSales}/15</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalSales / 15) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-1">{Math.round((totalSales / 15) * 100)}% completado</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Meta de Ingresos Mensual</span>
              <span className="text-sm text-slate-600">{formatCurrency(totalRevenue)}/{formatCurrency(45000000)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalRevenue / 45000000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-1">{Math.round((totalRevenue / 45000000) * 100)}% completado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;