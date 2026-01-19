# 📍 Blueprint: Ciclo de Vida del Cliente & Estrategia Comercial (Originarsa)

**Objetivo:** Mapear el recorrido del cliente desde el primer contacto hasta la renovación, integrando operaciones regulares con campañas estratégicas de reactivación y fidelización.
**Alcance:** Originarsa (Principal), Interbroker (Soporte Operativo), Recauda (Gestión de Riesgo).
**Infraestructura:** CRM In-house + Carga de Bases Manuales (Fase Actual).

---

## 🔁 VISTA GENERAL DEL MODELO

El cliente no sigue una línea recta. Entra, vive el crédito y se bifurca según su comportamiento (Pago Puntual vs. Mora) o según nuestra gestión proactiva (Campaña Manual).

1.  **Fase 1: Adquisición & Rescate** (Entrada de Leads + Reactivación de Aprobados).
2.  **Fase 2: Originación** (Cierre, Seguro Obligatorio y Entrega).
3.  **Fase 3: Vida del Crédito** (Pagos, Comportamiento y Servicio).
4.  **Fase 4: El "Loop" de Renovación** (Estrategia de Upgrade para buenos clientes).
5.  **Fase 5: Gestión de Riesgo** (Cobranza Preventiva y Recuperación).

---

## FASE 1: ADQUISICIÓN Y RESCATE (El Embudo de Entrada)

### A. Flujo Estándar (BAU - Business As Usual)
* **Entrada Digital:** Lead llega a Landing Page -> Completa formulario en **Crediexpress**.
    * *Acción Sistema:* Pre-calificación automática (Buró).
    * *Acción Futura:* Nutrición automática (Email/WhatsApp de educación).
* **Entrada Física:** Cliente visita Concesionario -> Asesor carga datos en App/CRM.
    * *Acción Humana:* Validación de identidad y buró en sitio.

### B. Inyección Táctica: 🚨 CAMPAÑA "RESCATE DE APROBADOS"
*Objetivo: Cerrar ventas de leads que pasaron el riesgo pero no compraron en los últimos meses.*

* **Fuente:** Base manual (Excel) de leads aprobados (últimos 30-90 días).
* **Segmentación en CRM:** Etiqueta `Campaña_Rescate_MesActual`.
* **Script de Ataque (WhatsApp/Llamada):**
    > "Hola [Nombre], soy [Asesor] de Originarsa. Te escribo porque revisando tu expediente, vi que tu cupo pre-aprobado para vehículo sigue vigente por 48 horas más. Queremos evitar que tengas que iniciar el papeleo de cero. ¿Sigues interesado en estrenar auto?"
* **Oferta de Valor:** "Saltarse la fila" (Trámite ya hecho) + Asesoría personalizada para buscar el auto si el concesionario anterior falló.

---

## FASE 2: ORIGINACIÓN Y ONBOARDING (La Conversión)

* **Estado CRM:** `En Análisis` -> `Aprobado` -> `Instrumentación`.
* **Gestión Documental:** Recopilación de requisitos físicos/digitales.
* **El "Handoff" Bancario:** Originarsa gestiona la venta de la cartera al banco, manteniendo la cara frente al cliente.

### El Rol de Interbroker (Operativo)
* **Momento:** Firma de Contrato.
* **Acción:** Emisión de Póliza de Seguro Vehicular (Mandatorio).
* **Estrategia:** No se hace venta agresiva. Se posiciona como parte del "Paquete de Protección Originarsa" para asegurar la inversión del cliente desde el kilómetro cero.

### Cierre y Bienvenida
* **Hito:** Entrega del Vehículo.
* **Acción CRM:** Cambio de estado a `Cliente Activo`.
* **Onboarding:** Entrega de "Kit de Bienvenida Digital":
    1.  Tabla de Amortización.
    2.  Canales de Pago (Énfasis en cómo pagar fácil).
    3.  Contactos de Soporte.

---

## FASE 3: VIDA DEL CRÉDITO (Maduración & Clasificación)

Durante los meses/años de pago, el CRM clasifica silenciosamente al cliente para preparar la Fase 4 o 5.

### Clasificación de Comportamiento (Scoring Interno)
* 🟢 **Perfil A (Prime):** Paga antes o en la fecha exacta. (Target para Renovación).
* 🟡 **Perfil B (Regular):** Paga con 1-3 días de retraso, requiere recordatorio.
* 🔴 **Perfil C (Riesgo):** Mora recurrente >5 días. (Target para Recauda).

### Puntos de Contacto
* **Mensual:** Estado de cuenta digital y recordatorio de pago.
* **Anual:** Renovación automática de póliza Interbroker.

---

## FASE 4: EL "LOOP" DE RENOVACIÓN (Fidelización)

Aquí convertimos el final del crédito en un nuevo principio.

### A. Flujo Estándar (Reactivo)
* El cliente termina de pagar.
* Solicita levantamiento de prenda (Trámite administrativo lento).
* Cliente se va (Churn).

### B. Inyección Táctica: 💎 CAMPAÑA "UPGRADE / RENUEVA TU AUTO"
*Objetivo: Captar al cliente ANTES de que termine de pagar para venderle un auto nuevo.*

* **Fuente:** Base manual de clientes `Perfil A (Prime)` a los que les faltan 6-12 cuotas o recién terminaron.
* **Segmentación en CRM:** Etiqueta `Campaña_Upgrade_VIP`.
* **La Estrategia:** Usar el buen historial como "moneda de cambio".
* **Script de Ataque:**
    > "Hola [Nombre], por tu excelente historial de pagos en Originarsa, has desbloqueado un beneficio VIP. Te pre-aprobamos un modelo 2026 usando tu auto actual como entrada. Nosotros nos encargamos de todo el trámite de venta y legal de tu auto viejo."
* **Solución al "Pain Point":**
    * En lugar de sufrir el trámite de **Levantamiento de Prenda**, Originarsa lo asume internamente como parte del proceso de retoma del vehículo. El cliente solo entrega llaves viejas y recibe nuevas.

---

## FASE 5: GESTIÓN DE RIESGO Y COBRANZA (La Red de Seguridad)

Si el cliente cae en `Perfil C (Riesgo)`, se activa este flujo.

### Etapa 1: Preventiva (Originarsa)
* **Tiempo:** Días -3 a 0 (Antes del vencimiento).
* **Acción:** Recordatorios automáticos (Email/SMS). Tono amable y de servicio.

### Etapa 2: Mora Temprana (Originarsa)
* **Tiempo:** Días 1 a 5 de impago.
* **Acción:** Contacto de servicio al cliente. "¿Hubo algún error en tu transferencia? Ayúdanos a identificar tu pago".

### Etapa 3: Cobranza Especializada (Recauda)
* **Tiempo:** Día 6 en adelante.
* **Trigger:** El CRM bloquea ofertas comerciales y pasa el caso a la bandeja de **Recauda**.
* **Acción:** Gestión de cobro, acuerdos de pago y refinanciamiento.
* **Última Instancia:** Proceso legal y decomisación del vehículo (Recuperación de garantía).

---

## 🛠 REQUERIMIENTOS PARA TU CRM (Checklist)

Para que esto funcione "Interactivamente", tu equipo de sistemas debe configurar:

1.  **Etiquetado Dinámico:** Capacidad de subir un Excel y que el CRM asigne tags masivos (`Campaña_X`) a esos usuarios.
2.  **Vista de Pipeline Diferenciada:**
    * *Pipeline Nuevos:* Fases de aprobación estándar.
    * *Pipeline Renovación:* Fases específicas para la toma del auto usado y entrega del nuevo.
3.  **Historial Centralizado:** Que el asesor pueda ver si un cliente `Perfil A` está siendo contactado, para no ofrecerle un crédito nuevo si acaba de caer en mora ayer (Sincronización de estados).