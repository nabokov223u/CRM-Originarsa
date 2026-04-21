import { saveLead } from "../services/leads";

export default function StepFinal({ formData }: { formData: any }) {
  async function handleSubmit() {
    await saveLead(formData);
    alert("✅ Datos enviados al CRM interno");
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-xl font-bold mb-4">Resumen final</h2>
      <button
        onClick={handleSubmit}
        className="bg-secondary text-white px-6 py-2 rounded-xl hover:bg-secondary-hover"
      >
        Enviar a CRM
      </button>
    </div>
  );
}
