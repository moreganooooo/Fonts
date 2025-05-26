import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: { bodyParser: true }
};

const memoryFilePath = path.join(process.cwd(), "memory.json");

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  try {
    if (pathname.endsWith("/save")) {
      const { type = "note", topic = "General", content } = req.body;
      if (!content) return res.status(400).json({ error: "Missing content" });

      let memory = [];
      try {
        const file = await fs.readFile(memoryFilePath, "utf-8");
        memory = JSON.parse(file);
      } catch {}

      const entry = {
        id: `mem-${Date.now()}`,
        type,
        topic,
        date: new Date().toISOString().split("T")[0],
        content
      };

      memory.push(entry);
      await fs.writeFile(memoryFilePath, JSON.stringify(memory, null, 2));
      return res.status(200).json({ success: true, entry });
    }

    if (pathname.endsWith("/search")) {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Missing search query" });

      const file = await fs.readFile(memoryFilePath, "utf-8");
      const memory = JSON.parse(file);
      const results = memory.filter(item =>
        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      );

      return res.status(200).json({ results });
    }

    res.status(404).json({ error: "Route not found" });
  } catch (err) {
    console.error("Memory handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
