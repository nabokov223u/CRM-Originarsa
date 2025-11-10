import { useEffect, useState } from "react";
import { getLeads } from "../services/leads";
import { Lead } from "../utils/types";
import LeadCard from "../components/LeadCard";

export default function CrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    getLeads().then(setLeads);
  }, []);

  const grouped = {
    Nuevo: leads.filter(l => l.status === "Nuevo"),
    Contactado: leads.filter(l => l.status === "Contactado"),
    Aprobado: leads.filter(l => l.status === "Aprobado"),
  };

  return (
    <div className="flex gap-4 p-6 bg-gray-100 min-h-screen">
      {Object.entries(grouped).map(([status, list]) => (
        <div key={status} className="flex-1 bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-lg mb-3">{status}</h2>
          {list.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ))}
    </div>
  );
}
