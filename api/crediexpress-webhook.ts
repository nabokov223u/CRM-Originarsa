/**
 * API Endpoint para recibir leads desde CrediExpress
 * URL: /api/crediexpress-webhook
 * Método: POST
 */

import { leadsService } from '../src/services/firestore/leads';

export default async function handler(req: any, res: any) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const data = req.body;

    // Validar que vengan los datos mínimos
    if (!data.cedula || !data.nombres) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos',
        required: ['cedula', 'nombres', 'telefono']
      });
    }

    // Transformar datos de CrediExpress a formato Lead
    const leadData = {
      // Datos personales
      nombres: extractFirstName(data.nombres || ''),
      apellidos: extractLastName(data.nombres || ''),
      cedula: data.cedula,
      telefono: data.telefono || '',
      email: data.email || '',
      
      // Datos del vehículo y cotización
      modelo: data.vehiculoInteres || 'No especificado',
      presupuesto: data.montoVehiculo || 0,
      
      // Datos de la cotización
      notas: buildNotasFromCrediExpress(data),
      
      // Metadata
      status: 'Nuevo' as const,
      fuente: 'Web' as const,
      fechaCreacion: new Date().toISOString().split('T')[0],
      asignadoA: 'Sin asignar',
    };

    // Guardar en Firebase
    const leadId = await leadsService.create(leadData);

    return res.status(200).json({
      success: true,
      leadId,
      message: 'Lead creado exitosamente',
    });

  } catch (error) {
    console.error('Error procesando webhook de CrediExpress:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Utilidades para procesar datos

function extractFirstName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  return parts.slice(0, 2).join(' '); // Primeros dos nombres
}

function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  return parts.slice(2).join(' ') || parts[0]; // Apellidos o fallback
}

function buildNotasFromCrediExpress(data: any): string {
  const notas = [];
  
  if (data.montoVehiculo) {
    notas.push(`💰 Monto del vehículo: $${data.montoVehiculo.toLocaleString()}`);
  }
  
  if (data.entrada) {
    notas.push(`📥 Entrada: $${data.entrada.toLocaleString()}`);
  }
  
  if (data.montoFinanciar) {
    notas.push(`🏦 A financiar: $${data.montoFinanciar.toLocaleString()}`);
  }
  
  if (data.plazoMeses) {
    notas.push(`📅 Plazo: ${data.plazoMeses} meses`);
  }
  
  if (data.cuotaMensual) {
    notas.push(`💳 Cuota mensual estimada: $${data.cuotaMensual.toFixed(2)}`);
  }
  
  if (data.estadoCivil) {
    notas.push(`👤 Estado civil: ${data.estadoCivil}`);
  }
  
  notas.push(`🌐 Origen: CrediExpress Web`);
  notas.push(`🕒 Fecha de cotización: ${new Date().toLocaleString('es-EC')}`);
  
  return notas.join('\n');
}
