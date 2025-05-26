import fs from "fs/promises";
import path from "path";
import os from "os";

const usersDir = path.join(os.tmpdir(), "gpt-users");

async function ensureUserFile(userId) {
  await fs.mkdir(usersDir, { recursive: true });
  const userFile = path.join(usersDir, `${userId}.json`);
  try {
    await fs.access(userFile);
  } catch {
    await fs.writeFile(userFile, JSON.stringify({ userId, preferences: {}, memory: [] }, null, 2));
  }
  return userFile;
}

export const config = {
  api: { bodyParser: true }
};

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];
  const { userId, preferences = {} } = req.body;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const userFile = await ensureUserFile(userId);

    if (pathname.endsWith("/init")) {
      const userData = { userId, preferences: {}, memory: [] };
      await fs.writeFile(userFile, JSON.stringify(userData, null, 2));
      return res.status(200).json({ message: "User initialized", userId });
    }

    if (pathname.endsWith("/prefs") && req.method === "POST") {
      const data = JSON.parse(await fs.readFile(userFile));
      data.preferences = { ...data.preferences, ...preferences };
      await fs.writeFile(userFile, JSON.stringify(data, null, 2));
      return res.status(200).json({ message: "Preferences saved", preferences: data.preferences });
    }

    if (pathname.endsWith("/prefs") && req.method === "GET") {
      const data = JSON.parse(await fs.readFile(userFile));
      return res.status(200).json({ preferences: data.preferences || {} });
    }

    res.status(404).json({ error: "Invalid route" });
  } catch (err) {
    console.error("User error:", err);
    res.status(500).json({ error: err.message });
  }
}
