export async function saveLead(formData: any) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return response.json();
}

export async function getLeads() {
  const response = await fetch("/api/leads");
  return response.json();
}
