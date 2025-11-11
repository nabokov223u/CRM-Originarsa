import React from 'react';
import { Actividad } from '../utils/types';

interface ActivityTimelineProps {
  activities: Actividad[];
  loading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  loading = false,
}) => {
  const getActivityIcon = (tipo: Actividad['tipo']) => {
    switch (tipo) {
      case 'Llamada':
        return '📞';
      case 'Reunión':
        return '🤝';
      case 'Email':
        return '📧';
      case 'WhatsApp':
        return '📱';
      case 'Nota':
        return '📝';
      case 'Tarea':
        return '✅';
      case 'Cambio de Estado':
        return '🔄';
      default:
        return '📌';
    }
  };

  const getActivityColor = (tipo: Actividad['tipo']) => {
    switch (tipo) {
      case 'Llamada':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Reunión':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Email':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WhatsApp':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Nota':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Cambio de Estado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📭</div>
        <p>No hay actividades registradas</p>
        <p className="text-sm mt-1">Las interacciones aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          {/* Icono y línea temporal */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${getActivityColor(
                activity.tipo
              )}`}
            >
              <span className="text-lg">{getActivityIcon(activity.tipo)}</span>
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            )}
          </div>

          {/* Contenido de la actividad */}
          <div className="flex-1 pb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{activity.titulo}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{formatDate(activity.fecha)}</span>
                    {activity.userName && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <span className="mr-1">👤</span>
                          {activity.userName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(
                    activity.tipo
                  )}`}
                >
                  {activity.tipo}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {activity.descripcion}
              </p>

              {/* Metadata adicional */}
              {activity.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {activity.metadata.estadoAnterior && activity.metadata.estadoNuevo && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                        {activity.metadata.estadoAnterior}
                      </span>
                      <span>→</span>
                      <span className="px-2 py-1 bg-blue-100 rounded text-blue-700 font-medium">
                        {activity.metadata.estadoNuevo}
                      </span>
                    </div>
                  )}
                  {activity.metadata.duracionLlamada && (
                    <div className="text-sm text-gray-600">
                      ⏱️ Duración: {activity.metadata.duracionLlamada} minutos
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
