import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true
  }
};

const memoryFilePath = path.join(process.cwd(), "memory.json");

export default async function handler(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const file = await fs.readFile(memoryFilePath, "utf-8");
    const memory = JSON.parse(file);

    const results = memory.filter(item =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({ results });
  } catch (err) {
    console.error("Memory search error:", err);
    res.status(500).json({ error: err.message });
  }
}
