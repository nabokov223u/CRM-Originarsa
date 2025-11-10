# CrediExpress v0.9 — Mini-CRM Base

Esta versión agrega un panel interno (CRM) que recibe automáticamente los leads captados desde el wizard.

## 🚀 Instrucciones de instalación

1. Copia estas carpetas dentro de tu proyecto CrediExpress v0.8:
   - `/src/services`
   - `/src/pages`
   - `/src/components`
   - `/src/utils`
   - `/api`

2. Agrega una nueva ruta en tu router:
   ```tsx
   <Route path="/crm" element={<CrmDashboard />} />
   ```

3. En el último paso del wizard (StepFinal o StepSummary):
   ```tsx
   import { saveLead } from "../services/leads";
   await saveLead(formData);
   ```

4. Despliega en Vercel. `/api/leads` se comporta como una Serverless Function.

5. Abre `/crm` para ver el embudo de leads.

---

## 🧱 Estructura

- `api/leads.ts`: guarda y lista los leads (mock con JSON local)
- `src/services/leads.ts`: funciones para enviar y obtener leads
- `src/pages/CrmDashboard.tsx`: panel visual con embudo simple
- `src/components/LeadCard.tsx`: muestra cada lead
- `src/utils/types.ts`: define el tipo `Lead`

---

## 🧠 Próximas versiones

- v1.0 → Embudo visual drag & drop
- v1.1 → Notificaciones a vendedores (email / SMS)
- v1.2 → Dashboard analítico
