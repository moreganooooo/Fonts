import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

const usersDir = path.join(os.tmpdir(), "gpt-users");

async function getUserFile(userId) {
  const file = path.join(usersDir, `${userId}.json`);
  try {
    const data = await fs.readFile(file, "utf-8");
    return { file, data: JSON.parse(data) };
  } catch {
    throw new Error("User not found or not initialized.");
  }
}

export const config = {
  api: { bodyParser: true }
};

export default async function handler(req, res) {
  const { userId, text = "", topic = "", type = "", search = "", id = "" } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const { file, data } = await getUserFile(userId);

    if (req.method === "POST" && req.url.endsWith("/save")) {
      const entry = { id: randomUUID(), type, topic, text, date: new Date().toISOString() };
      data.memory.unshift(entry);
      await fs.writeFile(file, JSON.stringify(data, null, 2));
      return res.status(200).json({ saved: entry });
    }

    if (req.method === "POST" && req.url.endsWith("/search")) {
      const matches = data.memory.filter(entry =>
        entry.text.toLowerCase().includes(search.toLowerCase()) ||
        entry.topic.toLowerCase().includes(search.toLowerCase())
      );
      return res.status(200).json({ matches });
    }

    if (req.method === "GET" && req.url.includes("/list")) {
      return res.status(200).json({ memory: data.memory });
    }

    if (req.method === "DELETE" && req.url.endsWith("/delete")) {
      const filtered = data.memory.filter(m => m.id !== id);
      data.memory = filtered;
      await fs.writeFile(file, JSON.stringify(data, null, 2));
      return res.status(200).json({ deleted: id });
    }

    res.status(404).json({ error: "Invalid memory route" });
  } catch (err) {
    console.error("Memory error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
