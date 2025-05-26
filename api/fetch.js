import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const textContent = dom.window.document.body.textContent || "";

    const cleanText = textContent
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000); // Limit for GPT token safety

    res.status(200).json({ text: cleanText });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
}
