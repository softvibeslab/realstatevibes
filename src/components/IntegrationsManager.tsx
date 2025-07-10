import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  BarChart3,
  Save,
  Download,
  Upload,
  Copy,
  Key,
  Globe,
  Webhook,
  TestTube,
  ExternalLink,
  Shield,
  Clock,
  Activity,
  Database,
  MessageSquare,
  Phone,
  Building2,
  Bot
} from 'lucide-react';
import { Integration, Pipeline, Automation } from '../types';
import { configService } from '../services/configService';
import type { ApiConfiguration, WebhookConfiguration } from '../services/configService';
import WhatsAppQRSetup from './WhatsAppQRSetup';
import ApiConnectionStatus from './ApiConnectionStatus';
import { localDataService } from '../services/localDataService';

const IntegrationsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'apis' | 'webhooks' | 'automations'>('integrations');
  const [apiConfigs, setApiConfigs] = useState<ApiConfiguration[]>([]);
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfiguration[]>([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedApiConfig, setSelectedApiConfig] = useState<ApiConfiguration | null>(null);
  const [selectedWebhookConfig, setSelectedWebhookConfig] = useState<WebhookConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  const [automations, setAutomations] = useState<Automation[]>([]);

  // Load configurations on component mount
  useEffect(() => {
    loadConfigurations();
    loadIntegrationsData();
  }, []);

  const loadConfigurations = () => {
    setApiConfigs(configService.getApiConfigurations());
    setWebhookConfigs(configService.getWebhookConfigurations());
  };

  const loadIntegrationsData = async () => {
    try {
      // Load integrations from Supabase
      const integrationsData = await localDataService.getIntegrations();
      const transformedIntegrations = integrationsData.map((integration: any) => ({
        id: integration.id,
        name: integration.name,
        status: integration.status,
        config: integration.config,
        lastSync: new Date(integration.last_sync || Date.now())
      }));
      setIntegrations(transformedIntegrations);

      // Load automations
      const automationsData = await localDataService.getAutomations();
      const transformedAutomations = automationsData.map((automation: any) => ({
        id: automation.id,
        name: automation.name,
        trigger: automation.trigger_type,
        actions: automation.actions,
        isActive: automation.is_active
      }));
      setAutomations(transformedAutomations);

    } catch (error) {
      console.error('Error loading integrations data:', error);
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      await localDataService.toggleAutomation(automationId, isActive);
      setAutomations(prev => prev.map(automation => 
        automation.id === automationId 
          ? { ...automation, isActive }
          : automation
      ));
    } catch (error) {
      console.error('Error toggling automation:', error);
    }
  };

  const getIntegrationIcon = (name: string) => {
    const icons = {
      ghl: Building2,
      n8n: Zap,
      vapi: Phone,
      whatsapp: MessageSquare
    };
    return icons[name as keyof typeof icons] || Globe;
  };

  const getIntegrationName = (name: string) => {
    const names = {
      ghl: 'GoHighLevel',
      n8n: 'n8n Workflows',
      vapi: 'Vapi AI Calls',
      whatsapp: 'WhatsApp Business'
    };
    return names[name as keyof typeof names] || name;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'disconnected':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace menos de 1 min';
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const handleSaveApiConfig = async (formData: any) => {
    setIsLoading(true);
    try {
      const config = configService.saveApiConfiguration({
        name: formData.name,
        type: formData.type,
        config: formData.config,
        isActive: formData.isActive ?? true,
      });
      
      loadConfigurations();
      setShowApiModal(false);
      setSelectedApiConfig(null);
      
      // Test the configuration after saving
      await testApiConfiguration(config);
    } catch (error) {
      console.error('Error saving API configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWebhookConfig = (formData: any) => {
    setIsLoading(true);
    try {
      configService.saveWebhookConfiguration({
        name: formData.name,
        service: formData.service,
        url: formData.url,
        events: formData.events,
        isActive: formData.isActive ?? true,
        description: formData.description,
        headers: formData.headers,
        secret: formData.secret,
      });
      
      loadConfigurations();
      setShowWebhookModal(false);
      setSelectedWebhookConfig(null);
    } catch (error) {
      console.error('Error saving webhook configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiConfiguration = async (config: ApiConfiguration) => {
    setIsLoading(true);
    try {
      const result = await configService.testApiConfiguration(config);
      setTestResults(prev => ({ ...prev, [config.id]: result }));
      loadConfigurations(); // Reload to get updated test results
      return result;
    } catch (error) {
      console.error('Error testing API configuration:', error);
      setTestResults(prev => ({ ...prev, [config.id]: false }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testWebhookConfiguration = async (config: WebhookConfiguration) => {
    setIsLoading(true);
    try {
      const result = await configService.testWebhook(config);
      setTestResults(prev => ({ ...prev, [config.id]: result }));
      loadConfigurations(); // Reload to get updated stats
      return result;
    } catch (error) {
      console.error('Error testing webhook configuration:', error);
      setTestResults(prev => ({ ...prev, [config.id]: false }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiConfiguration = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta configuración?')) {
      configService.deleteApiConfiguration(id);
      loadConfigurations();
    }
  };

  const deleteWebhookConfiguration = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este webhook?')) {
      configService.deleteWebhookConfiguration(id);
      loadConfigurations();
    }
  };

  const exportConfigurations = () => {
    const data = configService.exportConfigurations();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real_estate-integrations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importConfigurations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = configService.importConfigurations(content);
        
        if (result.success) {
          loadConfigurations();
          alert('Configuraciones importadas exitosamente');
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        alert('Error al leer el archivo');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integraciones y Automatización</h1>
          <p className="text-slate-600">Gestiona las conexiones con herramientas externas y automatizaciones</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importConfigurations}
            className="hidden"
            id="import-config"
          />
          <label
            htmlFor="import-config"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </label>
          <button
            onClick={exportConfigurations}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Connection Status Overview */}
      <ApiConnectionStatus showDetails={false} />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'integrations', name: 'Integraciones', icon: Zap },
              { id: 'apis', name: 'Configuración de APIs', icon: Settings },
              { id: 'webhooks', name: 'Webhooks', icon: Webhook },
              { id: 'automations', name: 'Automatizaciones', icon: Bot }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Integraciones Activas</h2>
                <button 
                  onClick={() => setShowWhatsAppSetup(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Configurar WhatsApp</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => {
                  const IconComponent = getIntegrationIcon(integration.name);
                  return (
                    <div key={integration.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{getIntegrationName(integration.name)}</h3>
                            <p className="text-sm text-slate-600">Última sincronización: {formatLastSync(integration.lastSync)}</p>
                          </div>
                        </div>
                        {getStatusIcon(integration.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        {integration.name === 'ghl' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Location ID:</span>
                              <span className="font-mono text-slate-900">{integration.config.locationId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">API Key:</span>
                              <span className="font-mono text-slate-900">{integration.config.apiKey}</span>
                            </div>
                          </>
                        )}
                        {integration.name === 'n8n' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Base URL:</span>
                              <span className="font-mono text-slate-900">{integration.config.baseUrl}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Workflows Activos:</span>
                              <span className="font-semibold text-green-600">{integration.config.activeWorkflows}</span>
                            </div>
                          </>
                        )}
                        {integration.name === 'vapi' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Assistant ID:</span>
                              <span className="font-mono text-slate-900">{integration.config.assistantId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Teléfono:</span>
                              <span className="font-mono text-slate-900">{integration.config.phoneNumber}</span>
                            </div>
                          </>
                        )}
                        {integration.name === 'whatsapp' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Tipo:</span>
                              <span className="font-mono text-slate-900">{integration.config.type}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Instancia:</span>
                              <span className="font-mono text-slate-900">{integration.config.instanceName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Status:</span>
                              <span className="text-red-600 font-medium">Error de conexión</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Sincronizar">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        <button className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors">
                          Configurar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* APIs Configuration Tab */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Configuración de APIs</h2>
                <button
                  onClick={() => {
                    setSelectedApiConfig(null);
                    setShowApiModal(true);
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva API</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {apiConfigs.map((config) => {
                  const IconComponent = getIntegrationIcon(config.type);
                  const testResult = testResults[config.id] ?? config.testResult;
                  
                  return (
                    <div key={config.id} className="border border-slate-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{getIntegrationName(config.type)}</h3>
                            <p className="text-sm text-slate-600">
                              {config.isActive ? 'Activo' : 'Inactivo'} • 
                              Actualizado: {config.updatedAt.toLocaleDateString()}
                            </p>
                            {config.lastTested && (
                              <p className="text-xs text-slate-500">
                                Último test: {config.lastTested.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {testResult !== undefined && (
                              <div className={`w-3 h-3 rounded-full ${testResult ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            )}
                            <span className="text-sm text-slate-600">
                              {testResult === true ? 'Conectado' : testResult === false ? 'Error' : 'Sin probar'}
                            </span>
                          </div>

                          <button
                            onClick={() => testApiConfiguration(config)}
                            disabled={isLoading}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Probar conexión"
                          >
                            <TestTube className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedApiConfig(config);
                              setShowApiModal(true);
                            }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => deleteApiConfiguration(config.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {Object.entries(config.config).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-slate-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="font-mono text-slate-900 truncate">
                              {key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') 
                                ? '****' + String(value).slice(-4)
                                : String(value)
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Configuración de Webhooks</h2>
                <button
                  onClick={() => {
                    setSelectedWebhookConfig(null);
                    setShowWebhookModal(true);
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Webhook</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {webhookConfigs.map((webhook) => (
                  <div key={webhook.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Webhook className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{webhook.name}</h3>
                          <p className="text-sm text-slate-600">{webhook.service} • {webhook.events.length} eventos</p>
                          {webhook.description && (
                            <p className="text-xs text-slate-500 mt-1">{webhook.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <p className="font-medium text-slate-900">{webhook.totalCalls} llamadas</p>
                          <p className="text-slate-600">{webhook.successRate}% éxito</p>
                        </div>

                        <button
                          onClick={() => testWebhookConfiguration(webhook)}
                          disabled={isLoading}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Probar webhook"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedWebhookConfig(webhook);
                            setShowWebhookModal(true);
                          }}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteWebhookConfiguration(webhook.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 font-medium mb-1">URL del Webhook</p>
                          <p className="font-mono text-slate-900 break-all">{webhook.url}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium mb-1">Eventos</p>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automations Tab */}
          {activeTab === 'automations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Automatizaciones</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nueva Automatización</span>
                </button>
              </div>

              <div className="space-y-4">
                {automations.map((automation) => (
                  <div key={automation.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${automation.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{automation.name}</h3>
                          <p className="text-sm text-slate-600">Trigger: {automation.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`p-2 rounded-lg transition-colors ${
                            automation.isActive 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={automation.isActive ? 'Pausar' : 'Activar'}
                        >
                          {automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Acciones:</h4>
                      {automation.actions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="capitalize font-medium">{action.type}</span>
                          <span>•</span>
                          <span>{action.delay ? `Esperar ${action.delay / 3600}h` : 'Inmediato'}</span>
                          <span>•</span>
                          <span className="truncate">{JSON.stringify(action.config).substring(0, 50)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Configuration Modal */}
      {showApiModal && (
        <ApiConfigModal
          config={selectedApiConfig}
          onSave={handleSaveApiConfig}
          onClose={() => {
            setShowApiModal(false);
            setSelectedApiConfig(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Webhook Configuration Modal */}
      {showWebhookModal && (
        <WebhookConfigModal
          config={selectedWebhookConfig}
          onSave={handleSaveWebhookConfig}
          onClose={() => {
            setShowWebhookModal(false);
            setSelectedWebhookConfig(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* WhatsApp Setup Modal */}
      {showWhatsAppSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Configuración de WhatsApp</h2>
                <button 
                  onClick={() => setShowWhatsAppSetup(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <WhatsAppQRSetup 
                instanceName="real_estate"
                showAdvanced={true}
                onConnectionChange={(connected) => {
                  console.log('WhatsApp connection changed:', connected);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// API Configuration Modal Component
const ApiConfigModal: React.FC<{
  config: ApiConfiguration | null;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ config, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    type: config?.type || 'ghl',
    isActive: config?.isActive ?? true,
    config: config?.config || {}
  });

  const apiTypes = [
    { value: 'ghl', label: 'GoHighLevel', fields: ['apiKey', 'locationId', 'baseUrl'] },
    { value: 'vapi', label: 'VAPI', fields: ['apiKey', 'assistantId', 'phoneNumber', 'baseUrl'] },
    { value: 'n8n', label: 'n8n', fields: ['baseUrl', 'apiKey', 'webhookUrl'] },
    { value: 'whatsapp', label: 'WhatsApp (Evolution API)', fields: ['baseUrl', 'apiKey', 'instanceName'] }
  ];

  const selectedApiType = apiTypes.find(type => type.value === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateConfigField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {config ? 'Editar' : 'Nueva'} Configuración de API
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de API</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                {apiTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">
              Configuración activa
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Configuración de {selectedApiType?.label}</h3>
            
            {selectedApiType?.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={field.toLowerCase().includes('key') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                  value={formData.config[field] || ''}
                  onChange={(e) => updateConfigField(field, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={`Ingresa ${field}`}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Webhook Configuration Modal Component
const WebhookConfigModal: React.FC<{
  config: WebhookConfiguration | null;
  onSave: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ config, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    service: config?.service || 'ghl',
    url: config?.url || '',
    events: config?.events || [],
    isActive: config?.isActive ?? true,
    description: config?.description || '',
    headers: config?.headers || {},
    secret: config?.secret || ''
  });

  const services = ['ghl', 'vapi', 'n8n', 'whatsapp'];
  const availableEvents = {
    ghl: ['contact.create', 'contact.update', 'contact.delete', 'appointment.create', 'appointment.update', 'opportunity.create'],
    vapi: ['call.started', 'call.ended', 'call.transcript', 'call.analysis'],
    n8n: ['workflow.started', 'workflow.completed', 'workflow.error'],
    whatsapp: ['message.received', 'message.sent', 'message.status', 'instance.connected', 'instance.disconnected']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {config ? 'Editar' : 'Nuevo'} Webhook
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Servicio</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value, events: [] }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                {services.map(service => (
                  <option key={service} value={service}>{service.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">URL del Webhook</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="https://tu-dominio.com/webhook"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Describe qué hace este webhook..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Eventos</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents[formData.service as keyof typeof availableEvents]?.map(event => (
                <label key={event} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Secret (Opcional)</label>
            <input
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Secret para validar el webhook"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="webhookActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="webhookActive" className="ml-2 text-sm text-slate-700">
              Webhook activo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              <span>Guardar Webhook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegrationsManager;