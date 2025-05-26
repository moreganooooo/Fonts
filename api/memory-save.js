import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: true
  }
};

const memoryFilePath = path.join(process.cwd(), "memory.json");

export default async function handler(req, res) {
  const { type = "note", topic = "General", content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content to save" });
  }

  try {
    let memory = [];
    try {
      const file = await fs.readFile(memoryFilePath, "utf-8");
      memory = JSON.parse(file);
    } catch (err) {
      memory = [];
    }

    const entry = {
      id: \`mem-\${Date.now()}\`,
      type,
      topic,
      date: new Date().toISOString().split("T")[0],
      content
    };

    memory.push(entry);
    await fs.writeFile(memoryFilePath, JSON.stringify(memory, null, 2));

    res.status(200).json({ success: true, entry });
  } catch (err) {
    console.error("Memory save error:", err);
    res.status(500).json({ error: err.message });
  }
}
