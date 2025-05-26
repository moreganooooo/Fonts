import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export const config = {
  api: {
    bodyParser: true
  }
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function convertGoogleDriveLink(link) {
  const match = link.match(/[-\w]{25,}/);
  if (!match) return null;
  return \`https://drive.google.com/uc?export=download&id=\${match[0]}\`;
}

async function analyzeWithGPT(text) {
  const prompt = \`Analyze the following website content for:
1. Main content sections
2. UX tone
3. Design feel
4. Content type

Respond in JSON format.\n\nWebsite Content:\n\${text.slice(0, 6000)}\`;

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

function extractEmails(text) {
  const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  return [...new Set(text.match(regex) || [])];
}

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];
  const { url, driveLink, path = "/", keyword = "" } = req.body;

  try {
    if (pathname.endsWith("/fetch") || pathname.endsWith("/emails") || pathname.endsWith("/analyze")) {
      if (!url || !url.startsWith("http")) return res.status(400).json({ error: "Invalid URL" });
      const html = await fetch(url).then(r => r.text());
      const dom = new JSDOM(html);
      const text = dom.window.document.body.textContent.replace(/\s+/g, " ").trim();

      if (pathname.endsWith("/emails")) {
        const emails = extractEmails(text);
        return res.status(200).json({ emails });
      }

      if (pathname.endsWith("/analyze")) {
        const analysis = await analyzeWithGPT(text);
        return res.status(200).json({ analysis });
      }

      return res.status(200).json({ text: text.slice(0, 5000) });
    }

    if (pathname.endsWith("/drive")) {
      if (!driveLink) return res.status(400).json({ error: "Missing link" });
      const directUrl = convertGoogleDriveLink(driveLink);
      if (!directUrl) return res.status(400).json({ error: "Invalid Drive link" });
      return res.status(200).json({ directUrl });
    }

    if (pathname.endsWith("/jobright")) {
      const fullURL = \`https://jobright.ai\${path}\`;
      const html = await fetch(fullURL).then(r => r.text());
      const dom = new JSDOM(html);
      const fullText = dom.window.document.body.textContent.replace(/\s+/g, " ").trim();
      const matches = keyword
        ? fullText.split(/(?<=\.)\s+/).filter(s => s.toLowerCase().includes(keyword.toLowerCase()))
        : [fullText.slice(0, 3000)];
      return res.status(200).json({ matches });
    }

    res.status(404).json({ error: "Route not found" });
  } catch (err) {
    console.error("Reader error:", err);
    res.status(500).json({ error: err.message });
  }
}
