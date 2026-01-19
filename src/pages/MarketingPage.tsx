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
  Zap
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
}

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

  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);

  // Form states
  const [strategyForm, setStrategyForm] = useState<Partial<Strategy>>({});

  // Datos base
  const initialPshowScriptModal, setShowScriptModal] = useState<string | null>(null);

  // Datos del ciclo de vida basados en el blueprint
  const phases: LifecyclePhase[] = [
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
          script: `Hola [Nombre], soy [Asesor] de Originarsa. Te escribo porque revisando tu expediente, vi que tu cupo pre-aprobado para vehículo sigue vigente por 48 horas más. Queremos evitar que tengas que iniciar el papeleo de cero. ¿Sigues interesado en estrenar auto?`
        },
        {
          id: 's2',
          title: 'Nutrición de Leads Nuevos',
          description: 'Secuencia de educación para leads recién ingresados (Crediexpress).',
          type: 'automated',
          channel: 'email',
          trigger: 'Nuevo Lead registrado',
          status: 'active'
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
          status: 'active'
        },
        {
          id: 's5',
          title: 'Renovación Póliza Anual',
          description: 'Gestión automática de renovación de seguro vehicular.',
          type: 'automated',
          channel: 'email',
          trigger: 'Vencimiento póliza = -30 días',
          status: 'draft'
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
          status: 'active'
        },
        {
          id: 's8',
          title: 'Recuperación Mora Temprana',
          description: 'Contacto de servicio al cliente para identificar problemas de pago.',
          type: 'manual',
          channel: 'call',
        [phases, setPhases] = useState<LifecyclePhase[]>(initialPhases);

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
        status: 'draft'
      });
    }
    setShowStrategyModal(true);
  };

  const handleSaveStrategy = () => {
    if (!strategyForm.title || !strategyForm.description) return;

    const newStrategy: Strategy = {
      id: editingStrategy?.id || Date.now().toString(),
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
  }
          status: 'active',
          script: `Hola [Nombre], te saludamos de Originarsa. Notamos que tu cuota venció hace unos días. ¿Tuviste algún inconveniente con los canales de pago? Queremos ayudarte a evitar recargos.`
        }
      ]
    }
  ];

  const selectedPhase = phases.find(p => p.id === selectedPhaseId) || phases[0];

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
                  clas
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

        {/* Columna Derecha: Estrategias */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Estrategias de Marketing & Comunicación</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedPhase.strategies.length} Habilitadas
            </span>
          </div>

          <div className="space-y-4 min-h-[400px]">
            {selectedPhase.strategies.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500">No hay estrategias definidas para esta fase.</p>
                <Button onClick={() => handleOpenModal()} variant="secondary" className="mt-4">
                  Crear Primera Estrategia
                </Button>
              </div>
            )}

            {selectedPhase.strategies.map((strategy) => (
              <div 
                key={strategy.id} 
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Status strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  strategy.status === 'active' ? 'bg-green-500' : 
                  strategy.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{strategy.title}</h4>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                        strategy.type === 'automated' ? 'bg-purple-100 text-purple-700' : 
                        strategy.type === 'manual' ? 'bg-orange-100 text-orange-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {strategy.type === 'automated' ? 'Automática' : strategy.type === 'manual' ? 'Manual' : 'Híbrida'}
                      </span>
                     <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                        strategy.status === 'active' ? 'border-green-200 text-green-700 bg-green-50' : 
                        strategy.status === 'paused' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                        'border-gray-200 text-gray-500 bg-gray-50'
                      }`}>
                        {strategy.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{strategy.description}</p>
                    
                    {strategy.valueProposition && (
                      <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-md">
                        <span className="text-xs font-bold text-yellow-800 block mb-1">💡 Propuesta de Valor:</span>
                        <p className="text-xs text-yellow-900 italic">"{strategy.valueProposition}"</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-2">
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

                  <div className="flex md:flex-col gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
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

                {/* Modal inline de Script */}
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
                )}
              </div>
            ))}
          </div>
          
          {/* Diagrama de Flujo (Nuevo) */}
          <PhaseMap phaseId={selectedPhaseId} />
          
        </div>
      </div>

      {/* Modal de Crear/Editar Estrategia */}
      <Modal
        isOpen={showStrategyModal}
        onClose={() => setShowStrategyModal(false)}
        title={editingStrategy ? "Editar Estrategia" : "Nueva Estrategia"}
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
      </Modal           {strategy.type === 'automated' ? 'Automática' : strategy.type === 'manual' ? 'Manual' : 'Híbrida'}
                    </span>
                  </div>
                  
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

              {/* Modal inline de Script (Simulado) */}
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
