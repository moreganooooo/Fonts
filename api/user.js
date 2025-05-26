import fs from "fs/promises";
import path from "path";
import os from "os";

const userStore = path.join(os.tmpdir(), "ultra-users.json");

async function loadUsers() {
  try {
    const raw = await fs.readFile(userStore, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveUsers(data) {
  await fs.writeFile(userStore, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  const { method, url, body } = req;

  try {
    const users = await loadUsers();

    if (method === "POST" && url.includes("/user/init")) {
      const { userId, name } = body;
      users[userId] = users[userId] || { name, preferences: {}, memory: [] };
      await saveUsers(users);
      return res.status(200).json({ message: "User initialized", user: users[userId] });
    }

    if (method === "POST" && url.includes("/user/prefs")) {
      const { userId, preferences } = body;
      if (!users[userId]) return res.status(404).json({ error: "User not found" });
      users[userId].preferences = { ...users[userId].preferences, ...preferences };
      await saveUsers(users);
      return res.status(200).json({ message: "Preferences saved" });
    }

    if (method === "POST" && url.includes("/memory/save")) {
      const { userId, entry } = body;
      if (!users[userId]) return res.status(404).json({ error: "User not found" });
      users[userId].memory.push({ entry, ts: Date.now() });
      await saveUsers(users);
      return res.status(200).json({ message: "Memory saved" });
    }

    if (method === "POST" && url.includes("/memory/search")) {
      const { userId, query } = body;
      const matches = users[userId]?.memory?.filter(m => m.entry.includes(query)) || [];
      return res.status(200).json({ matches });
    }

    if (method === "GET" && url.includes("/memory/list")) {
      const { userId } = req.query;
      const entries = users[userId]?.memory || [];
      return res.status(200).json({ entries });
    }

    if (method === "POST" && url.includes("/memory/delete")) {
      const { userId, index } = body;
      if (users[userId]?.memory?.length > index) {
        users[userId].memory.splice(index, 1);
        await saveUsers(users);
        return res.status(200).json({ message: "Entry deleted" });
      }
      return res.status(400).json({ error: "Invalid index" });
    }

    res.status(404).json({ error: "Unknown user endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message || "User handler error" });
  }
}
