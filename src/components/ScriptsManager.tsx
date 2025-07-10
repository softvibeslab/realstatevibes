import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Bot, 
  User, 
  Play, 
  Pause, 
  BarChart3, 
  BookOpen, 
  Lightbulb, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Wand2,
  Brain,
  Zap,
  FileText,
  Tag,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { SalesScript, CallScript, KnowledgeBase, ScriptTemplate } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { localDataService } from '../services/localDataService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ScriptsManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'scripts' | 'templates' | 'knowledge' | 'analytics'>('scripts');
  const [scripts, setScripts] = useState<SalesScript[]>([]);
  const [templates, setTemplates] = useState<ScriptTemplate[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState<SalesScript | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplate | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeBase | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadScriptsData();
  }, [user]);

  const loadScriptsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load scripts
      const scriptsData = await localDataService.getScripts();
      setScripts(scriptsData);

      // Load knowledge base
      // Simular knowledge base
      const mockKnowledge: KnowledgeBase[] = [
        {
          id: '1',
          title: 'Información del Proyecto Selva Dentro',
          category: 'proyecto',
          content: `Real Estate CRM es un desarrollo residencial de lujo ubicado en la Riviera Maya...`,
          tags: ['proyecto', 'precios', 'amenidades', 'unidades'],
          isActive: true,
          priority: 'high',
          lastUpdated: new Date(Date.now() - 86400000 * 2),
          usageCount: 156
        }
      ];
      setKnowledgeBase(mockKnowledge);

    } catch (error) {
      console.error('Error loading scripts data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateScript = async (scriptData: any) => {
    try {
      const newScript = await localDataService.createScript({
        ...scriptData,
        usage: 0,
        effectiveness: 0
      });
      
      setScripts(prev => [newScript, ...prev]);
      setShowScriptModal(false);
    } catch (error) {
      console.error('Error creating script:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Scripts</h1>
            <p className="text-slate-600">Cargando scripts...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

    const mockTemplates: ScriptTemplate[] = [
      {
        id: '1',
        name: 'Template Descubrimiento Básico',
        description: 'Estructura básica para llamadas de descubrimiento con nuevos leads',
        structure: {
          opening: 'Saludo personalizado y confirmación de interés',
          discovery: 'Preguntas abiertas para entender necesidades',
          presentation: 'Presentación breve del valor único',
          closing: 'Próximos pasos y agendamiento'
        },
        variables: ['NOMBRE_CLIENTE', 'NOMBRE_AGENTE', 'FUENTE_LEAD'],
        category: 'discovery',
        isActive: true
      },
      {
        id: '2',
        name: 'Template Presentación Premium',
        description: 'Estructura para presentaciones de propiedades de lujo',
        structure: {
          opening: 'Agradecimiento y contexto de la reunión',
          presentation: 'Presentación detallada con beneficios emocionales y racionales',
          proof: 'Testimonios y casos de éxito',
          closing: 'Manejo de objeciones y cierre'
        },
        variables: ['NOMBRE_CLIENTE', 'TIPO_PROPIEDAD', 'PRECIO', 'ROI'],
        category: 'presentation',
        isActive: true
      }
    ];

    const mockKnowledge: KnowledgeBase[] = [
      {
        id: '1',
        title: 'Información del Proyecto Selva Dentro',
        category: 'proyecto',
        content: `Real Estate CRM es un desarrollo residencial de lujo ubicado en la Riviera Maya, específicamente en Tulum, Quintana Roo.

**Características Principales:**
- 120 unidades distribuidas en 3 torres
- Frente de playa de 150 metros
- Amenidades de clase mundial
- Entrega: Diciembre 2025

**Tipos de Unidades:**
- Studios: 45-55 m² | $1,200,000 - $1,500,000 MXN
- 1 Recámara: 65-75 m² | $1,800,000 - $2,200,000 MXN  
- 2 Recámaras: 85-95 m² | $2,500,000 - $3,000,000 MXN
- Penthouses: 120-150 m² | $4,000,000 - $6,000,000 MXN

**Amenidades:**
- Beach Club privado
- Spa y gimnasio
- 3 piscinas (infinity, familiar, niños)
- Restaurante gourmet
- Concierge 24/7
- Estacionamiento subterráneo
- Helipuerto`,
        tags: ['proyecto', 'precios', 'amenidades', 'unidades'],
        isActive: true,
        priority: 'high',
        lastUpdated: new Date(Date.now() - 86400000 * 2),
        usageCount: 156
      },
      {
        id: '2',
        title: 'Opciones de Financiamiento',
        category: 'financiero',
        content: `Ofrecemos múltiples opciones de financiamiento para facilitar tu inversión:

**Plan Tradicional:**
- Enganche: 30%
- Pagos durante construcción: 50% (24 meses)
- Entrega: 20%

**Plan Flexible:**
- Enganche: 20%
- Pagos durante construcción: 60% (30 meses)
- Entrega: 20%

**Plan Premium (Sin Intereses):**
- Enganche: 50%
- Pagos durante construcción: 50% (18 meses)
- Sin intereses ni comisiones

**Financiamiento Bancario:**
- Convenios con BBVA, Santander, Banorte
- Hasta 70% de financiamiento
- Tasas preferenciales desde 8.5% anual
- Plazos hasta 20 años

**Beneficios Adicionales:**
- Descuento por pago de contado: 8%
- Programa de referidos: 3% de comisión
- Garantía de recompra: 95% del valor después de 3 años`,
        tags: ['financiamiento', 'pagos', 'descuentos', 'bancos'],
        isActive: true,
        priority: 'high',
        lastUpdated: new Date(Date.now() - 86400000 * 1),
        usageCount: 89
      },
      {
        id: '3',
        title: 'Manejo de Objeciones Comunes',
        category: 'ventas',
        content: `**Objeción: "Está muy caro"**
Respuesta: Entiendo tu preocupación. Comparemos con propiedades similares en la zona... [mostrar análisis de mercado]. Además, considera el valor agregado incluido...

**Objeción: "Necesito pensarlo"**
Respuesta: Por supuesto, es una decisión importante. ¿Qué información específica te ayudaría a sentirte más cómodo? ¿Hay alguna preocupación particular que podamos resolver hoy?

**Objeción: "No conozco la zona"**
Respuesta: Excelente punto. Tulum es una de las zonas con mayor crecimiento en México... [datos de crecimiento]. ¿Te gustaría que organicemos una visita para que conozcas personalmente?

**Objeción: "¿Y si no se renta?"**
Respuesta: Tenemos un programa de rentas garantizado con ROI mínimo del 8% anual. Además, nuestro track record muestra ocupación promedio del 85%...`,
        tags: ['objeciones', 'ventas', 'respuestas', 'técnicas'],
        isActive: true,
        priority: 'medium',
        lastUpdated: new Date(Date.now() - 86400000 * 3),
        usageCount: 67
      }
    ];

    setTemplates(mockTemplates);
    setKnowledgeBase(mockKnowledge);

  const generateAIScript = async (type: string, context: string) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newScript: SalesScript = {
      id: Date.now().toString(),
      name: `Script ${type} Generado por IA`,
      type: type as any,
      content: `Este es un script generado automáticamente por IA para ${type}.\n\nContexto: ${context}\n\n[Contenido del script generado...]`,
      variables: ['NOMBRE_CLIENTE', 'NOMBRE_AGENTE'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: 0,
      effectiveness: 0,
      aiGenerated: true
    };
    
    setScripts(prev => [newScript, ...prev]);
    setIsGenerating(false);
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || script.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredKnowledge = knowledgeBase.filter(kb => {
    const matchesSearch = kb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kb.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || kb.category === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      discovery: Target,
      presentation: BarChart3,
      objection: AlertCircle,
      closing: CheckCircle
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      discovery: 'bg-blue-100 text-blue-800',
      presentation: 'bg-green-100 text-green-800',
      objection: 'bg-orange-100 text-orange-800',
      closing: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      proyecto: Building2,
      financiero: DollarSign,
      ventas: TrendingUp,
      objeciones: AlertCircle,
      legal: FileText
    };
    return icons[category as keyof typeof icons] || BookOpen;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Scripts</h1>
          <p className="text-slate-600">Administra scripts de ventas, templates y base de conocimientos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span>Generar con IA</span>
          </button>
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Script</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'scripts', name: 'Scripts', icon: MessageSquare },
              { id: 'templates', name: 'Templates', icon: FileText },
              { id: 'knowledge', name: 'Base de Conocimientos', icon: BookOpen },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
          {/* Scripts Tab */}
          {activeTab === 'scripts' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar scripts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="discovery">Descubrimiento</option>
                    <option value="presentation">Presentación</option>
                    <option value="objection">Objeciones</option>
                    <option value="closing">Cierre</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Importar</span>
                  </button>
                </div>
              </div>

              {/* AI Generation Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Generador de Scripts con IA</h3>
                      <p className="text-sm text-slate-600">Crea scripts personalizados usando inteligencia artificial</p>
                    </div>
                  </div>
                  {isGenerating && (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generando...</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => generateAIScript('discovery', 'Lead nuevo de Facebook Ads')}
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-2 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Descubrimiento</span>
                  </button>
                  
                  <button
                    onClick={() => generateAIScript('presentation', 'Penthouse para inversión')}
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-2 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Presentación</span>
                  </button>
                  
                  <button
                    onClick={() => generateAIScript('objection', 'Precio alto')}
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-2 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Objeciones</span>
                  </button>
                  
                  <button
                    onClick={() => generateAIScript('closing', 'Cliente interesado')}
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-2 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Cierre</span>
                  </button>
                </div>
              </div>

              {/* Scripts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredScripts.map((script) => {
                  const TypeIcon = getTypeIcon(script.type);
                  return (
                    <div key={script.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{script.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(script.type)}`}>
                                {script.type}
                              </span>
                              {script.aiGenerated && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center space-x-1">
                                  <Bot className="w-3 h-3" />
                                  <span>IA</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver script">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Copiar">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Uso:</span>
                          <span className="font-medium">{script.usage} veces</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Efectividad:</span>
                          <span className={`font-medium ${
                            script.effectiveness >= 80 ? 'text-green-600' :
                            script.effectiveness >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {script.effectiveness}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Variables:</span>
                          <span className="font-medium">{script.variables.length}</span>
                        </div>
                      </div>

                      <div className="text-sm text-slate-600 mb-4">
                        <p className="line-clamp-3">{script.content.substring(0, 150)}...</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Actualizado: {format(script.updatedAt, 'd MMM', { locale: es })}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors">
                            Usar Script
                          </button>
                          <div className={`w-3 h-3 rounded-full ${script.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Templates de Scripts</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-slate-700">Estructura:</h4>
                      {Object.entries(template.structure).map(([key, value]) => (
                        <div key={key} className="flex items-start space-x-2 text-sm">
                          <span className="font-medium text-slate-600 capitalize min-w-0 w-20">{key}:</span>
                          <span className="text-slate-700 flex-1">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Variables: {template.variables.length}
                      </div>
                      <button className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors">
                        Usar Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Base de Conocimientos</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Artículo</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar en base de conocimientos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="financiero">Financiero</option>
                  <option value="ventas">Ventas</option>
                  <option value="objeciones">Objeciones</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredKnowledge.map((kb) => {
                  const CategoryIcon = getCategoryIcon(kb.category);
                  return (
                    <div key={kb.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{kb.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-slate-600 capitalize">{kb.category}</span>
                              <span className={`w-2 h-2 rounded-full ${getPriorityColor(kb.priority)}`}></span>
                              <span className={`text-xs ${getPriorityColor(kb.priority)}`}>{kb.priority}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-slate-600 mb-4">
                        <p className="line-clamp-3">{kb.content.substring(0, 200)}...</p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-wrap gap-1">
                          {kb.tags.slice(0, 4).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {kb.tags.length > 4 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{kb.tags.length - 4}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Usado {kb.usageCount} veces
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                          Actualizado: {format(kb.lastUpdated, 'd MMM yyyy', { locale: es })}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${kb.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Analytics de Scripts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Scripts Totales</p>
                      <p className="text-2xl font-bold text-slate-900">{scripts.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Efectividad Promedio</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {Math.round(scripts.reduce((acc, s) => acc + s.effectiveness, 0) / scripts.length)}%
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Generados por IA</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {scripts.filter(s => s.aiGenerated).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics Detallados</h3>
                <p className="text-slate-600">Los reportes detallados estarán disponibles próximamente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptsManager;