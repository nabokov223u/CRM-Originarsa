// src/components/PhaseMap.tsx
import React from 'react';
import { Target, Users, ShieldCheck, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

interface PhaseMapProps {
  phaseId: string;
}

export const PhaseMap: React.FC<PhaseMapProps> = ({ phaseId }) => {
  const getMapContent = () => {
    switch (phaseId) {
      case 'acquisition':
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
            <Node title="Lead Entrante" subtitle="Web / Concesionario" type="start" />
            <Arrow label="Ingreso" />
            <Node title="Pre-calificación" subtitle="Buró Automática" type="process" />
            <div className="flex flex-col gap-8 relative">
              <div className="flex items-center">
                <Arrow label="Aprobado" direction="right" />
                <Node title="Cierre Venta" subtitle="Compra Inmediata" type="success" />
              </div>
              <div className="absolute left-[-2rem] top-[50%] w-[2rem] h-[1px] bg-gray-300"></div>
              <div className="flex items-center mt-4">
                <Arrow label="No Compra" direction="right" isDotted />
                <Node title="Campaña Rescate" subtitle="WhatsApp / Llamada" type="action" highlight />
              </div>
            </div>
          </div>
        );
      case 'origination':
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
            <Node title="Crédito Aprobado" type="start" />
            <Arrow label="Gestión" />
            <Node title="Documentación" subtitle="Carpeta Física/Digital" type="process" />
            <Arrow />
            <Node title="Emisión Póliza" subtitle="Interbroker" type="process" />
            <Arrow />
            <Node title="Entrega Auto" subtitle="Kit Bienvenida" type="success" highlight />
          </div>
        );
      case 'life':
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
            <Node title="Cliente Activo" type="start" />
            <Arrow label="Mes a Mes" />
            <div className="flex flex-col gap-4 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Perfil A (Puntual)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">Perfil B (Retraso genérico)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">Perfil C (Mora > 5 días)</span>
              </div>
            </div>
            <Arrow label="Anual" />
            <Node title="Renovación Seguro" type="action" />
          </div>
        );
      case 'renewal':
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
             <Node title="Fin de Crédito" subtitle="Cuotas < 6" type="start" />
             <Arrow label="Filtro" />
             <Node title="Perfil A (VIP)" type="process" highlight />
             <Arrow label="Oferta" />
             <Node title="Campaña Upgrade" subtitle="Retoma Auto Viejo" type="action" />
             <Arrow label="Éxito" />
             <Node title="Nuevo Crédito" type="success" />
          </div>
        );
      case 'risk':
        return (
           <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
             <Node title="Mora Día 0" type="start" />
             <Arrow label="Preventiva" />
             <Node title="Aviso Amable" subtitle="WhatsApp Auto" type="action" />
             <Arrow label="Día 1-5" />
             <Node title="Gestión Mora" subtitle="Llamada Servicio" type="process" />
             <Arrow label="> Día 6" color="red" />
             <Node title="Cobranza Externa" subtitle="Recauda" type="end" />
           </div>
        );
      default:
        return <div className="text-center text-gray-400">Selecciona una fase para ver el flujo</div>;
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl border-t border-gray-200 p-8 mt-8">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
        Diagrama de Flujo: {phaseId}
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {getMapContent()}
        </div>
      </div>
    </div>
  );
};

// Sub-componentes para el diagrama
const Node = ({ title, subtitle, type = 'process', highlight = false }: any) => {
  const styles: any = {
    start: 'bg-white border-2 border-gray-800 text-gray-900 rounded-full px-6',
    process: 'bg-white border border-gray-300 text-gray-600 rounded-lg',
    action: 'bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm',
    success: 'bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm',
    end: 'bg-red-50 border border-red-200 text-red-700 rounded-lg',
  };

  return (
    <div className={`
      flex flex-col items-center justify-center p-3 min-w-[140px] text-center transition-all
      ${styles[type]} 
      ${highlight ? 'ring-2 ring-offset-2 ring-blue-400 transform scale-105' : ''}
    `}>
      <span className="font-bold text-sm">{title}</span>
      {subtitle && <span className="text-[10px] mt-1 opacity-80">{subtitle}</span>}
    </div>
  );
};

const Arrow = ({ label, direction = 'right', isDotted = false, color = 'gray' }: any) => (
  <div className="flex flex-col items-center px-2">
    {label && <span className="text-[10px] text-gray-400 mb-1 font-medium bg-white px-1">{label}</span>}
    <div className={`flex items-center text-gray-300 ${color === 'red' ? 'text-red-300' : ''}`}>
      <div className={`h-[2px] w-8 ${isDotted ? 'border-b-2 border-dotted border-current bg-transparent' : 'bg-current'}`}></div>
      <ArrowRight className="w-4 h-4 -ml-1" />
    </div>
  </div>
);
