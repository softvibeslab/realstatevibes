import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  AlertCircle,
  Phone,
  MessageSquare,
  Settings,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { evolutionApiService } from '../services/evolutionApiService';
import type { QRCodeResponse, ConnectionState, InstanceInfo } from '../services/evolutionApiService';

interface WhatsAppQRSetupProps {
  instanceName?: string;
  onConnectionChange?: (connected: boolean) => void;
  showAdvanced?: boolean;
}

const WhatsAppQRSetup: React.FC<WhatsAppQRSetupProps> = ({ 
  instanceName = 'real_estate',
  onConnectionChange,
  showAdvanced = false
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [connectionState, setConnectionState] = useState<'close' | 'connecting' | 'open'>('close');
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Polling for connection state
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await evolutionApiService.getConnectionState(instanceName);
        setConnectionState(state.state);
        
        if (state.state === 'open') {
          const info = await evolutionApiService.getInstanceInfo(instanceName);
          setInstanceInfo(info);
          setQrCode(''); // Clear QR code when connected
        }
        
        onConnectionChange?.(state.state === 'open');
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    // Check immediately
    checkConnection();

    // Then check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [instanceName, onConnectionChange]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // First, try to create/restart the instance
      try {
        await evolutionApiService.createInstance(instanceName);
      } catch (createError) {
        // If instance already exists, try to restart it
        try {
          await evolutionApiService.restartInstance(instanceName);
        } catch (restartError) {
          console.warn('Could not restart instance, continuing with QR generation');
        }
      }

      // Wait a moment for instance to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate QR code
      const qrResponse = await evolutionApiService.generateQRCode(instanceName);
      setQrCode(qrResponse.base64);
      setConnectionState('connecting');
      setRetryCount(prev => prev + 1);
      
    } catch (error) {
      setError(`Error generando código QR: ${(error as Error).message}`);
      console.error('QR Generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await evolutionApiService.logoutInstance(instanceName);
      setConnectionState('close');
      setInstanceInfo(null);
      setQrCode('');
      onConnectionChange?.(false);
    } catch (error) {
      setError(`Error desconectando: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInstance = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta instancia? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await evolutionApiService.deleteInstance(instanceName);
      setConnectionState('close');
      setInstanceInfo(null);
      setQrCode('');
      onConnectionChange?.(false);
    } catch (error) {
      setError(`Error eliminando instancia: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'open':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />;
      case 'close':
      default:
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'open':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'close':
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'open':
        return 'bg-green-50 border-green-200';
      case 'connecting':
        return 'bg-yellow-50 border-yellow-200';
      case 'close':
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">WhatsApp Business</h3>
            <p className="text-sm text-slate-600">Evolution API - Instancia: {instanceName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          
          {connectionState === 'open' && (
            <button
              onClick={disconnectWhatsApp}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <WifiOff className="w-4 h-4" />
              <span>Desconectar</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {connectionState === 'close' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-slate-600" />
          </div>
          <h4 className="text-lg font-medium text-slate-900 mb-2">Conectar WhatsApp</h4>
          <p className="text-slate-600 mb-6">
            Escanea el código QR con tu WhatsApp para conectar tu cuenta
          </p>
          
          <button
            onClick={generateQRCode}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 mx-auto"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <QrCode className="w-5 h-5" />
            )}
            <span>{isLoading ? 'Generando...' : 'Generar Código QR'}</span>
          </button>
        </div>
      )}

      {qrCode && connectionState === 'connecting' && (
        <div className="text-center py-8">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-300 inline-block mb-4">
            <img 
              src={`data:image/png;base64,${qrCode}`} 
              alt="WhatsApp QR Code" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          
          <h4 className="text-lg font-medium text-slate-900 mb-2">Escanea el Código QR</h4>
          <div className="text-slate-600 space-y-2 mb-6">
            <p>1. Abre WhatsApp en tu teléfono</p>
            <p>2. Ve a Configuración → Dispositivos vinculados</p>
            <p>3. Toca "Vincular un dispositivo"</p>
            <p>4. Escanea este código QR</p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={generateQRCode}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerar QR</span>
            </button>
            
            <span className="text-sm text-slate-500">
              Intento #{retryCount}
            </span>
          </div>
        </div>
      )}

      {connectionState === 'open' && instanceInfo && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h4 className="font-medium text-green-900">¡WhatsApp Conectado!</h4>
            </div>
            <p className="text-sm text-green-700">
              Tu cuenta de WhatsApp está conectada y lista para enviar mensajes.
            </p>
          </div>

          {/* Instance Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Información de la Instancia</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Nombre:</span>
                  <span className="font-medium">{instanceInfo.instance.instanceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estado:</span>
                  <span className="font-medium text-green-600">{instanceInfo.instance.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Última actualización:</span>
                  <span className="font-medium">{lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2">Configuración</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Webhook:</span>
                  <span className="font-medium">
                    {instanceInfo.webhook ? 'Configurado' : 'No configurado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">WebSocket:</span>
                  <span className="font-medium">
                    {instanceInfo.websocket?.enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-slate-200 pt-6">
            <h5 className="font-medium text-slate-900 mb-4">Acciones Rápidas</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Enviar Mensaje</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Contactos</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configurar</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">Exportar</span>
              </button>
            </div>
          </div>

          {showAdvanced && (
            <div className="border-t border-slate-200 pt-6">
              <h5 className="font-medium text-slate-900 mb-4">Configuración Avanzada</h5>
              <div className="space-y-3">
                <button
                  onClick={() => evolutionApiService.restartInstance(instanceName)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reiniciar Instancia</span>
                </button>
                
                <button
                  onClick={deleteInstance}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Instancia</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppQRSetup;