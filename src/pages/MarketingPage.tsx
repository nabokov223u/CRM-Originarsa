import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle,
  Plus,
  MessageCircle,
  Mail,
  List,
  Filter
  // Zap
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { PhaseMap } from '../components/PhaseMap';

// Definición de tipos para el modelo de Marketing
interface Strategy {
  id: string;
  title: string;
  description: string;
  valueProposition?: string;
  type: 'manual' | 'automated' | 'hybrid';
  channel: 'whatsapp' | 'email' | 'call' | 'mixed';
  trigger: string;
  script?: string;
  status: 'active' | 'draft' | 'paused';
  funnelStage?: string;
}

// Configuración del Embudo por Fase
const FUNNEL_STAGES: Record<string, { id: string, label: string, color: string, borderColor: string, textColor: string }[]> = {
  acquisition: [
    { id: 'awareness', label: 'Conciencia (Awareness)', color: 'bg-[#0d234a]/5', borderColor: 'border-[#0d234a]/10', textColor: 'text-[#0d234a]' },
    { id: 'consideration', label: 'Consideración', color: 'bg-[#0d234a]/10', borderColor: 'border-[#0d234a]/20', textColor: 'text-[#0d234a]' },
    { id: 'decision', label: 'Decisión', color: 'bg-[#0d234a]/20', borderColor: 'border-[#0d234a]/30', textColor: 'text-[#0d234a]' },
    { id: 'nutrition', label: 'Nutrición', color: 'bg-[#08BD8F]/10', borderColor: 'border-[#08BD8F]/30', textColor: 'text-[#00664d]' },
  ],
  origination: [
    { id: 'doc_collection', label: 'Recolección Documentos', color: 'bg-[#0d234a]/5', borderColor: 'border-[#0d234a]/10', textColor: 'text-[#0d234a]' },
    { id: 'risk_analysis', label: 'Análisis de Riesgo', color: 'bg-[#0d234a]/10', borderColor: 'border-[#0d234a]/20', textColor: 'text-[#0d234a]' },
    { id: 'approval', label: 'Aprobación', color: 'bg-[#0d234a]/20', borderColor: 'border-[#0d234a]/30', textColor: 'text-[#0d234a]' },
    { id: 'disbursement', label: 'Desembolso / Entrega', color: 'bg-[#08BD8F]/20', borderColor: 'border-[#08BD8F]/40', textColor: 'text-[#00664d]' },
  ],
  life: [
    { id: 'onboarding', label: 'Onboarding / Bienvenida', color: 'bg-[#08BD8F]/10', borderColor: 'border-[#08BD8F]/20', textColor: 'text-[#00664d]' },
    { id: 'maturation', label: 'Maduración (Pagos Regulares)', color: 'bg-[#0d234a]/10', borderColor: 'border-[#0d234a]/20', textColor: 'text-[#0d234a]' },
    { id: 'loyalty', label: 'Fidelización', color: 'bg-[#0d234a]/20', borderColor: 'border-[#0d234a]/30', textColor: 'text-[#0d234a]' },
  ],
  renewal: [
    { id: 'detection', label: 'Detección Oportunidad', color: 'bg-[#0d234a]/5', borderColor: 'border-[#0d234a]/10', textColor: 'text-[#0d234a]' },
    { id: 'offer', label: 'Presentación Oferta', color: 'bg-[#08BD8F]/10', borderColor: 'border-[#08BD8F]/20', textColor: 'text-[#00664d]' },
    { id: 'negotiation', label: 'Negociación / Cierre', color: 'bg-[#08BD8F]/20', borderColor: 'border-[#08BD8F]/40', textColor: 'text-[#00664d]' },
  ],
  risk: [
    { id: 'preventive', label: 'Preventiva (0 días)', color: 'bg-[#0d234a]/5', borderColor: 'border-[#0d234a]/10', textColor: 'text-[#0d234a]' },
    { id: 'early_late', label: 'Mora Temprana (1-30)', color: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' }, // Mantener rojo para riesgo
    { id: 'late', label: 'Mora Tardía (31-90)', color: 'bg-red-100', borderColor: 'border-red-300', textColor: 'text-red-900' },
    { id: 'legal', label: 'Judicial / Castigo', color: 'bg-red-200', borderColor: 'border-red-400', textColor: 'text-red-950' },
  ]
};

interface LifecyclePhase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  strategies: Strategy[];
}

export const MarketingPage = () => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('acquisition');
  const [viewMode, setViewMode] = useState<'funnel' | 'list'>('funnel');
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState<string | null>(null);
  // const [showScriptModal, setShowScriptModal] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  // Form states
  const [strategyForm, setStrategyForm] = useState<Partial<Strategy>>({});

  // Datos del ciclo de vida basados en el blueprint
  const initialPhases: LifecyclePhase[] = [
    {
      id: 'acquisition',
      title: 'Fase 1: Adquisición',
      subtitle: 'Adquisición & Rescate',
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20',
      description: 'Mapeo del recorrido desde el primer contacto hasta la validación. Incluye campañas de rescate para leads aprobados no cerrados.',
      strategies: [
        {
          id: 's1',
          title: 'Campaña "Rescate de Aprobados"',
          description: 'Reactivación de leads con cupo aprobado vigente (30-90 días) que no compraron.',
          type: 'hybrid',
          channel: 'mixed',
          trigger: 'Lead aprobado sin compra > 30 días',
          status: 'active',
          funnelStage: 'decision',
          script: `Hola [Nombre], soy [Asesor] de Originarsa. Te escribo porque revisando tu expediente, vi que tu cupo pre-aprobado para vehículo sigue vigente por 48 horas más. Queremos evitar que tengas que iniciar el papeleo de cero. ¿Sigues interesado en estrenar auto?`
        },
        {
          id: 's2',
          title: 'Nutrición de Leads Nuevos',
          description: 'Secuencia de educación para leads recién ingresados (Crediexpress).',
          type: 'automated',
          channel: 'email',
          trigger: 'Nuevo Lead registrado',
          status: 'active',
          funnelStage: 'awareness'
        }
      ]
    },
    {
      id: 'origination',
      title: 'Fase 2: Originación',
      subtitle: 'Conversión y Onboarding',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Gestión documental, cierre de venta y entrega del vehículo. Inclusión del seguro como valor agregado.',
      strategies: [
        {
          id: 's3',
          title: 'Kit de Bienvenida Digital',
          description: 'Envío de tabla de amortización, canales de pago y contactos clave post-entrega.',
          type: 'automated',
          channel: 'whatsapp',
          trigger: 'Cambio de estado a "Cliente Activo"',
          status: 'active',
          funnelStage: 'disbursement',
          script: `¡Felicidades por tu nuevo auto [Nombre]! 🚗\n\nAqui tienes tu Kit de Bienvenida Digital:\n1. Tu tabla de pagos 📄\n2. Guía rápida de pago fácil 💳\n3. Contacto directo de soporte 🤝\n\n¡Bienvenido a la familia Originarsa!`
        }
      ]
    },
    {
      id: 'life',
      title: 'Fase 3: Vida del Crédito',
      subtitle: 'Maduración & Clasificación',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Monitoreo de comportamiento de pago y clasificación automática (Scoring Interno A, B, C).',
      strategies: [
        {
          id: 's4',
          title: 'Recordatorio de Pago Mensual',
          description: 'Aviso preventivo 3 días antes de la fecha de corte.',
          type: 'automated',
          channel: 'whatsapp',
          trigger: 'Días vencimiento = -3',
          status: 'active',
          funnelStage: 'maturation'
        },
        {
          id: 's5',
          title: 'Renovación Póliza Anual',
          description: 'Gestión automática de renovación de seguro vehicular.',
          type: 'automated',
          channel: 'email',
          trigger: 'Vencimiento póliza = -30 días',
          status: 'draft',
          funnelStage: 'maturation',
        }
      ]
    },
    {
      id: 'renewal',
      title: 'Fase 4: Renovación',
      subtitle: 'Fidelización & Upgrade',
      icon: RefreshCw,
      color: 'text-secondary',
      bgColor: 'bg-secondary/5',
      borderColor: 'border-secondary/20',
      description: 'Estrategia para convertir el fin del crédito en una nueva venta (Trade-in).',
      strategies: [
        {
          id: 's6',
          title: 'Campaña "Upgrade VIP"',
          description: 'Oferta exclusiva para clientes Perfil A terminando su crédito.',
          type: 'manual',
          channel: 'call',
          trigger: 'Cuotas restantes < 6 y Perfil = A',
          status: 'active',
          funnelStage: 'offer',
          script: `Hola [Nombre], por tu excelente historial en Originarsa, has desbloqueado un beneficio VIP. Te pre-aprobamos un modelo 2026 usando tu auto actual como entrada. Nosotros nos encargamos de todo el trámite de venta y legal de tu auto viejo.`
        }
      ]
    },
    {
      id: 'risk',
      title: 'Fase 5: Riesgo',
      subtitle: 'Cobranza y Recuperación',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Gestión escalonada de cobranza preventiva, mora temprana y recuperación.',
      strategies: [
        {
          id: 's7',
          title: 'Cobranza Preventiva',
          description: 'Contacto amable previo al vencimiento para evitar olvidos.',
          type: 'automated',
          channel: 'whatsapp',
          trigger: 'Días Mora = 0',
          status: 'active',
          funnelStage: 'preventive'
        },
        {
          id: 's8',
          title: 'Recuperación Mora Temprana',
          description: 'Contacto de servicio al cliente para identificar problemas de pago.',
          type: 'manual',
          channel: 'call',
          trigger: 'Días Mora > 3',
          status: 'active',
          funnelStage: 'early_late',
          script: `Hola [Nombre], te saludamos de Originarsa. Notamos que tu cuota venció hace unos días. ¿Tuviste algún inconveniente con los canales de pago? Queremos ayudarte a evitar recargos.`
        }
      ]
    }
  ];

  const [phases, setPhases] = useState<LifecyclePhase[]>(initialPhases);

  const selectedPhase = phases.find(p => p.id === selectedPhaseId) || phases[0];

  const handleOpenModal = (strategy?: Strategy) => {
    if (strategy) {
      setEditingStrategy(strategy);
      setStrategyForm(strategy);
    } else {
      setEditingStrategy(null);
      setStrategyForm({
        type: 'manual',
        channel: 'whatsapp',
        status: 'draft',
        funnelStage: FUNNEL_STAGES[selectedPhaseId]?.[0]?.id
      });
    }
    setShowStrategyModal(true);
  };

  const handleSaveStrategy = () => {
    if (!strategyForm.title || !strategyForm.description) return;

    const newStrategy: Strategy = {
      id: editingStrategy?.id || Date.now().toString(),
      funnelStage: strategyForm.funnelStage || FUNNEL_STAGES[selectedPhaseId]?.[0]?.id || 'unknown',
      title: strategyForm.title || '',
      description: strategyForm.description || '',
      valueProposition: strategyForm.valueProposition || '',
      type: strategyForm.type as any || 'manual',
      channel: strategyForm.channel as any || 'whatsapp',
      trigger: strategyForm.trigger || '',
      script: strategyForm.script || '',
      status: strategyForm.status as any || 'draft',
    };

    setPhases(prevPhases => prevPhases.map(phase => {
      if (phase.id === selectedPhaseId) {
        if (editingStrategy) {
          // Edit existing
          return {
            ...phase,
            strategies: phase.strategies.map(s => s.id === editingStrategy.id ? newStrategy : s)
          };
        } else {
          // Add new
          return {
            ...phase,
            strategies: [...phase.strategies, newStrategy]
          };
        }
      }
      return phase;
    }));

    setShowStrategyModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Visual del Roadmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-x-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Ciclo de Vida del Cliente</h2>
        <div className="flex justify-between items-start min-w-[800px] relative">
          
          {/* Línea conectora de fondo */}
          <div className="absolute top-8 left-0 w-full h-1 bg-gray-100 -z-0"></div>

          {phases.map((phase) => {
            const isSelected = selectedPhaseId === phase.id;
            const Icon = phase.icon;
            
            return (
              <div 
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className={`relative flex flex-col items-center group cursor-pointer transition-all duration-300 z-10 flex-1 px-2`}
              >
                <div 
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-sm
                    ${isSelected 
                      ? `${phase.bgColor} ${phase.borderColor} scale-110 shadow-md` 
                      : 'bg-white border-white hover:border-gray-100 hover:bg-gray-50'}
                  `}
                >
                  <Icon className={`w-7 h-7 ${isSelected ? phase.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                </div>
                
                <div className="text-center mt-3 transition-opacity">
                  <p className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                    {phase.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[120px]">
                    {phase.subtitle}
                  </p>
                </div>

                {/* Indicador activo */}
                {isSelected && (
                  <div className={`absolute -bottom-10 w-2 h-2 rounded-full ${phase.color.replace('text-', 'bg-')}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle de la Fase Seleccionada */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Columna Izquierda: Información de Fase */}
        <div className="lg:col-span-1 space-y-6">
          <Card className={`border-t-4 ${selectedPhase.borderColor.replace('border-', 'border-t-')}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${selectedPhase.bgColor}`}>
                <selectedPhase.icon className={`w-8 h-8 ${selectedPhase.color}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedPhase.title}</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {selectedPhase.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Estrategias Activas</span>
                <span className="font-bold text-gray-900">{selectedPhase.strategies.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Automatizadas</span>
                <span className="font-bold text-gray-900">
                  {selectedPhase.strategies.filter(s => s.type === 'automated').length}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button 
                onClick={() => handleOpenModal()} 
                className="w-full flex items-center justify-center gap-2" 
                variant="secondary"
              >
                <Plus className="w-4 h-4" />
                Nueva Estrategia
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Columna Derecha: Embudo de Conversión (FUNNEL) o Lista */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {viewMode === 'funnel' ? 'Embudo de Estrategias' : 'Listado de Estrategias'}
              </h3>
              <p className="text-sm text-gray-500">Fluxo de conversión para {selectedPhase.title}</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
               <button
                 onClick={() => setViewMode('funnel')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                   viewMode === 'funnel' 
                     ? 'bg-white text-primary shadow-sm' 
                     : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 <Filter className="w-4 h-4" />
                 Embudo
               </button>
               <button
                 onClick={() => setViewMode('list')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                   viewMode === 'list' 
                     ? 'bg-white text-primary shadow-sm' 
                     : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 <List className="w-4 h-4" />
                 Lista
               </button>
            </div>
          </div>

          {viewMode === 'funnel' ? (
            <div className="flex flex-col items-center space-y-2 w-full max-w-2xl mx-auto animate-in fade-in duration-300">
              {FUNNEL_STAGES[selectedPhaseId] ? (
               FUNNEL_STAGES[selectedPhaseId].map((stage, index) => {
                 // Filtrar estrategias en este stage
                 const stageStrategies = selectedPhase.strategies.filter(s => s.funnelStage === stage.id);
                 // Calcular ancho decreciente (o constante si no es embudo estricto)
                 // Para embudo visual: 100% -> 90% -> 80% ...
                 const widthPercent = 100 - (index * 8); 

                 return (
                   <div 
                     key={stage.id}
                     className={`relative w-full transition-all duration-300`}
                     style={{ width: `${widthPercent}%` }}
                   >
                     {/* Stage Header / Container */}
                     <div className={`p-4 rounded-xl border-2 ${stage.color} ${stage.borderColor} relative group`}>
                       
                       <div className="flex items-center justify-between mb-2">
                         <h4 className={`font-bold text-sm uppercase tracking-wide ${stage.textColor}`}>{stage.label}</h4>
                         <span className="bg-white/80 px-2 py-0.5 rounded text-xs font-semibold text-gray-600 shadow-sm border border-gray-100">
                           {stageStrategies.length}
                         </span>
                       </div>

                       {/* List of Strategies inside this Funnel Stage */}
                       <div className="space-y-2 mt-2">
                         {stageStrategies.length === 0 ? (
                            <div className="text-center py-2 text-xs text-gray-400 italic border-t border-dashed border-gray-300/50 mt-2 pt-2">
                              Sin estrategias activas
                            </div>
                         ) : (
                           stageStrategies.map(strategy => (
                             <div 
                               key={strategy.id} 
                               className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between group/strategy cursor-pointer"
                               onClick={() => handleOpenModal(strategy)}
                             >
                                <div className="flex items-center gap-3">
                                  {strategy.channel === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-green-600" /> : 
                                   strategy.channel === 'email' ? <Mail className="w-4 h-4 text-blue-600" /> : 
                                   <Users className="w-4 h-4 text-gray-600" />}
                                  
                                  <div>
                                    <h5 className="font-semibold text-gray-800 text-sm">{strategy.title}</h5>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${
                                        strategy.type === 'automated' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                                      }`}>
                                        {strategy.type === 'automated' ? 'Auto' : 'Manual'}
                                      </span>
                                      <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                        {strategy.trigger}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button size="sm" variant="secondary" className="opacity-0 group-hover/strategy:opacity-100">
                                  Edit
                                </Button>
                             </div>
                           ))
                         )}
                         
                         {/* Quick Add Button per Stage */}
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setEditingStrategy(null);
                             setStrategyForm({
                               type: 'manual',
                               channel: 'whatsapp',
                               status: 'draft',
                               funnelStage: stage.id
                             });
                             setShowStrategyModal(true);
                           }}
                           className="w-full py-1.5 text-xs text-center text-gray-500 hover:text-gray-800 hover:bg-white/50 rounded transition-colors opacity-0 group-hover:opacity-100 border border-transparent hover:border-gray-200 mt-2"
                         >
                           + Añadir estrategia en {stage.label}
                         </button>
                       </div>
                     </div>
                     
                     {/* Connector Line (except for last item) */}
                     {index < FUNNEL_STAGES[selectedPhaseId].length - 1 && (
                       <div className="h-4 w-0.5 bg-gray-300 mx-auto opacity-50"></div>
                     )}
                   </div>
                 );
               })
             ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  No hay configuración de embudo para esta fase.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
               {selectedPhase.strategies.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-gray-500">No hay estrategias definidas para esta fase.</p>
                    <Button onClick={() => handleOpenModal()} variant="secondary" className="mt-4">
                      Crear Primera Estrategia
                    </Button>
                  </div>
               ) : (
                  selectedPhase.strategies.map((strategy) => (
                    <div key={strategy.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        strategy.status === 'active' ? 'bg-green-500' : 
                        strategy.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}></div>
                      
                      <div className="flex flex-col md:flex-row gap-4 items-start justify-between pl-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{strategy.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              strategy.type === 'automated' ? 'bg-purple-100 text-purple-700' :
                              strategy.type === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {strategy.type === 'automated' ? 'Automática' : strategy.type === 'manual' ? 'Manual' : 'Híbrida'}
                            </span>
                            {/* Funnel Stage Badge */}
                            {strategy.funnelStage && (
                              <span className="px-2 py-0.5 rounded-full text-xs border bg-gray-50 text-gray-500">
                                {FUNNEL_STAGES[selectedPhaseId]?.find(s => s.id === strategy.funnelStage)?.label || strategy.funnelStage}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-1.5">
                              {/* <Zap className="w-3.5 h-3.5 text-yellow-600" /> */}
                              <span className="font-medium text-yellow-700">Trigger:</span> {strategy.trigger}
                            </div>
                            <div className="w-px h-3 bg-gray-300 hidden md:block"></div>
                            <div className="flex items-center gap-1.5">
                              {strategy.channel === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5 text-green-600" /> : 
                              strategy.channel === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-600" /> : 
                              <Users className="w-3.5 h-3.5 text-gray-600" />}
                              <span className="capitalize">{strategy.channel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col gap-2 shrink-0">
                          {strategy.script && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => setShowScriptModal(strategy.id)}
                              className="text-xs"
                            >
                              Ver Script
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="text-xs"
                            onClick={() => handleOpenModal(strategy)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
               )}
            </div>
          )}

          <PhaseMap phaseId={selectedPhaseId} />
        </div>
      </div>

      {/* Modal de Visualización de Script */}
      <Modal
        isOpen={!!showScriptModal}
        onClose={() => setShowScriptModal(null)}
        title="Script de la Estrategia"
        footer={
          <Button onClick={() => setShowScriptModal(null)}>
            Cerrar
          </Button>
        }
      >
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {selectedPhase.strategies.find(s => s.id === showScriptModal)?.script || 'Sin script definido.'}
          </pre>
        </div>
      </Modal>

      {/* Modal de Crear/Editar Estrategia */}
      <Modal
        isOpen={showStrategyModal}
        onClose={() => setShowStrategyModal(false)}
        title={editingStrategy ? "Editar Estrategia" : "Nueva Estrategia de Embudo"}
        footer={
          <>
            <Button onClick={handleSaveStrategy}>
              Guardar Estrategia
            </Button>
            <Button variant="secondary" onClick={() => setShowStrategyModal(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Título de la Estrategia"
            value={strategyForm.title || ''}
            onChange={(val) => setStrategyForm({...strategyForm, title: val})}
            placeholder="Ej: Campaña de Reactivación"
            required
          />

          <div>
             <label className="block text-xs font-semibold text-gray-700 mb-1.5">Etapa del Embudo</label>
             <select
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                value={strategyForm.funnelStage || ''}
                onChange={(e) => setStrategyForm({...strategyForm, funnelStage: e.target.value})}
             >
               {FUNNEL_STAGES[selectedPhaseId]?.map(stage => (
                 <option key={stage.id} value={stage.id}>
                   {stage.label}
                 </option>
               ))}
             </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descripción</label>
            <textarea
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
              value={strategyForm.description || ''}
              onChange={(e) => setStrategyForm({...strategyForm, description: e.target.value})}
              placeholder="¿De qué trata esta estrategia?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Propuesta de Valor 💡</label>
            <textarea
              className="w-full px-4 py-2 text-sm border border-yellow-200 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              rows={2}
              value={strategyForm.valueProposition || ''}
              onChange={(e) => setStrategyForm({...strategyForm, valueProposition: e.target.value})}
              placeholder="¿Qué gana el cliente? (Ej: Saltarse la fila, Aprobación inmediata...)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo</label>
              <select
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                value={strategyForm.type || 'manual'}
                onChange={(e) => setStrategyForm({...strategyForm, type: e.target.value as any})}
              >
                <option value="manual">Manual (Asesor)</option>
                <option value="automated">Automática (Bot)</option>
                <option value="hybrid">Híbrida</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Canal</label>
              <select
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
                value={strategyForm.channel || 'whatsapp'}
                onChange={(e) => setStrategyForm({...strategyForm, channel: e.target.value as any})}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="call">Llamada</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
          </div>

          {strategyForm.channel === 'whatsapp' && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in">
              <label className="block text-xs font-bold text-green-800 mb-2 flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                Configuración WhatsApp Business API
              </label>
              
              <div className="space-y-3">
                <div>
                   <label className="block text-[10px] uppercase text-green-700 font-semibold mb-1">Plantilla Aprobada (Meta)</label>
                   <select className="w-full px-3 py-1.5 text-xs border border-green-200 rounded bg-white">
                     <option value="">Seleccionar plantilla...</option>
                     <option value="bienvenida_cliente_v1">bienvenida_cliente_v1 (Marketing)</option>
                     <option value="recordatorio_pago_simple">recordatorio_pago_simple (Utility)</option>
                     <option value="oferta_renovacion_vip">oferta_renovacion_vip (Marketing)</option>
                   </select>
                   <p className="text-[10px] text-green-600 mt-1">
                     * Requiere configuración de credenciales en Backend.
                   </p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Trigger (Disparador)"
            value={strategyForm.trigger || ''}
            onChange={(val) => setStrategyForm({...strategyForm, trigger: val})}
            placeholder="Ej: Lead creado hace 30 días"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Script / Plantilla</label>
            <textarea
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              rows={4}
              value={strategyForm.script || ''}
              onChange={(e) => setStrategyForm({...strategyForm, script: e.target.value})}
              placeholder="Hola [Nombre]..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estado</label>
            <div className="flex gap-4">
              {['active', 'draft', 'paused'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={strategyForm.status === status}
                    onChange={() => setStrategyForm({...strategyForm, status: status as any})}
                  />
                  <span className="capitalize text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};


/*
                  
                  <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-yellow-600" />
                      <span className="font-medium">Trigger:</span> {strategy.trigger}
                    </div>
                    <div className="w-px h-3 bg-gray-300 hidden md:block"></div>
                    <div className="flex items-center gap-1.5">
                      {strategy.channel === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5 text-green-600" /> : 
                       strategy.channel === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-600" /> : 
                       <Users className="w-3.5 h-3.5 text-gray-600" />}
                      <span className="capitalize">{strategy.channel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0">
                  {strategy.script && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setShowScriptModal(strategy.id)}
                      className="text-xs"
                    >
                      Ver Script
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" className="text-xs">
                    Editar
                  </Button>
                </div>
              </div>

              // COMMENT REMOVED
              {showScriptModal === strategy.id && strategy.script && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-primary text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    Preview del Script
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-mono relative">
                    {strategy.script}
                    <button 
                      onClick={() => setShowScriptModal(null)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs underline"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
            </div>
        </div>
      </div>
*/
