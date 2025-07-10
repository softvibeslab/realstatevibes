import React from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { localDataService } from '../services/localDataService';

interface SupabaseStatusProps {
  compact?: boolean;
}

const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ compact = false }) => {
  const [connected, setConnected] = React.useState(true); // Siempre conectado en modo local
  const [loading, setLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await localDataService.testConnection();
    } catch (error) {
      console.error('Error refreshing connection:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium text-slate-700">
            Local Data
          </span>
        </div>
        {loading && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            connected ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Database className={`w-5 h-5 ${connected ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Local Database</h3>
            <p className="text-sm text-slate-600">
              {connected ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
          ) : connected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {connected && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 font-medium">URL</p>
              <a 
                href="https://evolutionvibes-real_estate.gwhncw.easypanel.host/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="font-mono text-slate-900 truncate text-xs">
              LocalStorage + Demo Data
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-600 font-medium">Estado</p>
            <p className="font-medium text-green-600">Activo</p>
          </div>
        </div>
      )}

      {!connected && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Error de Conexión</h4>
              <p className="text-sm text-red-700">
                Error en el sistema local. Intenta refrescar la página.
              </p>
              <div className="mt-3">
                <button
                  onClick={handleRefresh}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar conexión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseStatus;