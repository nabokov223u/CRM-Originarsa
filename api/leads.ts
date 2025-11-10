import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "leads.json");

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    const data = await fs.readFile(DB_PATH, "utf-8").catch(() => "[]");
    res.status(200).json(JSON.parse(data));
  }

  if (req.method === "POST") {
    const newLead = req.body;
    const data = await fs.readFile(DB_PATH, "utf-8").catch(() => "[]");
    const leads = JSON.parse(data);
    leads.push({ ...newLead, id: Date.now(), status: "Nuevo" });
    await fs.writeFile(DB_PATH, JSON.stringify(leads, null, 2));
    res.status(200).json({ ok: true });
  }
}
