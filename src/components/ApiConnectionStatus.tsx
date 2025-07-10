import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock
} from 'lucide-react';
import { useApiIntegrations } from '../hooks/useApiIntegrations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SupabaseStatus from './SupabaseStatus';

interface ApiConnectionStatusProps {
  showDetails?: boolean;
  compact?: boolean;
}

const ApiConnectionStatus: React.FC<ApiConnectionStatusProps> = ({ 
  showDetails = false, 
  compact = false 
}) => {
  const {
    status,
    errors,
    isLoading,
    lastChecked,
    testConnections,
    retryConnection,
    clearErrors,
    getConnectionSummary,
  } = useApiIntegrations();

  const summary = getConnectionSummary();

  const getServiceIcon = (service: string) => {
    const icons = {
      ghl: '🏢',
      vapi: '📞',
      n8n: '🔄',
      whatsapp: '💬',
    };
    return icons[service as keyof typeof icons] || '⚡';
  };

  const getServiceName = (service: string) => {
    const names = {
      ghl: 'GoHighLevel',
      vapi: 'VAPI',
      n8n: 'n8n',
      whatsapp: 'WhatsApp',
    };
    return names[service as keyof typeof names] || service;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {summary.connected === summary.total ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : summary.connected > 0 ? (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium text-slate-700">
            {summary.connected}/{summary.total}
          </span>
        </div>
        <button
          onClick={testConnections}
          disabled={isLoading}
          className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
          title="Verificar conexiones"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            summary.connected === summary.total 
              ? 'bg-green-100' 
              : summary.connected > 0 
              ? 'bg-yellow-100' 
              : 'bg-red-100'
          }`}>
            {summary.connected === summary.total ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : summary.connected > 0 ? (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Estado de Integraciones</h3>
            <p className="text-sm text-slate-600">
              {summary.connected} de {summary.total} servicios conectados ({summary.percentage}%)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastChecked && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Última verificación</p>
              <p className="text-xs font-medium text-slate-700">
                {format(lastChecked, 'HH:mm:ss', { locale: es })}
              </p>
            </div>
          )}
          <button
            onClick={testConnections}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Verificar</span>
          </button>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(status).map(([service, connected]) => (
          <div
            key={service}
            className={`p-4 rounded-lg border-2 transition-colors ${
              connected 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{getServiceIcon(service)}</span>
              {connected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <h4 className="font-medium text-slate-900">{getServiceName(service)}</h4>
            <p className={`text-xs ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </p>
            {!connected && (
              <button
                onClick={() => retryConnection(service as keyof typeof status)}
                className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-red-900">Errores de Conexión</h4>
            <button
              onClick={clearErrors}
              className="text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Limpiar
            </button>
          </div>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error.service}</p>
                  <p className="text-xs text-red-700">{error.error}</p>
                  <p className="text-xs text-red-600">
                    {format(error.timestamp, "HH:mm:ss", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-medium text-slate-900 mb-3">Configuración de APIs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-slate-700 mb-2">GoHighLevel</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• CRM y gestión de leads</li>
                <li>• Calendario y citas</li>
                <li>• Pipeline de ventas</li>
                <li>• Automatizaciones</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-slate-700 mb-2">VAPI</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• Llamadas automatizadas</li>
                <li>• Análisis de conversaciones</li>
                <li>• Transcripciones</li>
                <li>• Métricas de llamadas</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-slate-700 mb-2">n8n</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• Workflows automatizados</li>
                <li>• Generación de scripts IA</li>
                <li>• Procesamiento de datos</li>
                <li>• Integraciones personalizadas</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-slate-700 mb-2">WhatsApp Business</h5>
              <ul className="space-y-1 text-slate-600">
                <li>• Mensajería automatizada</li>
                <li>• Templates de mensajes</li>
                <li>• Seguimiento de leads</li>
                <li>• Notificaciones</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Status */}
      <div className="mt-6">
        <SupabaseStatus />
      </div>
    </div>
  );
};

export default ApiConnectionStatus;