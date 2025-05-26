import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export const config = {
  api: {
    bodyParser: true
  }
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function analyzeWithGPT(text) {
  const prompt = `Analyze the following website content for:
1. Main content sections (e.g. blog, pricing, about)
2. UX tone (casual, corporate, technical)
3. Design feel (clean, busy, minimal)
4. Content type (marketing, educational, product)

Respond in JSON format.\n\nWebsite Content:\n\n${text.slice(0, 6000)}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${OPENAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No analysis returned";
}

export default async function handler(req, res) {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const cleanText = dom.window.document.body.textContent.replace(/\s+/g, " ").trim();

    const analysis = await analyzeWithGPT(cleanText);
    res.status(200).json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message });
  }
}
