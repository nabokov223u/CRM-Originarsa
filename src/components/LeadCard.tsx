import { Lead } from "../utils/types";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="border border-gray-100 rounded-lg p-3 mb-2 shadow-sm bg-white hover:shadow-md transition-shadow">
      <p className="font-medium text-sm text-primary">{lead.nombres} {lead.apellidos}</p>
      <p className="text-xs text-gray-400">{lead.cedula}</p>
      <p className="text-xs text-gray-400">{lead.telefono}</p>
      <p className="text-xs text-gray-400 italic">{lead.modelo}</p>
    </div>
  );
}
