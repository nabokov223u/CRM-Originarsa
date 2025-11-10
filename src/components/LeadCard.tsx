import { Lead } from "../utils/types";

export default function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-2 shadow-sm bg-white hover:shadow-md">
      <p className="font-bold">{lead.nombres} {lead.apellidos}</p>
      <p className="text-sm text-gray-600">{lead.cedula}</p>
      <p className="text-sm text-gray-600">{lead.telefono}</p>
      <p className="text-sm text-gray-600 italic">{lead.modelo}</p>
    </div>
  );
}
