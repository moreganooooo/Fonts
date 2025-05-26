import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export const config = {
  api: {
    bodyParser: true
  }
};

const JOBRIGHT_BASE = "https://jobright.ai";

export default async function handler(req, res) {
  const { path = "/", keyword = "" } = req.body;

  try {
    const response = await fetch(\`\${JOBRIGHT_BASE}\${path}\`);
    const html = await response.text();
    const dom = new JSDOM(html);
    const textContent = dom.window.document.body.textContent || "";
    const cleanText = textContent.replace(/\s+/g, " ").trim();

    const matches = keyword
      ? cleanText
          .split(/(?<=\.)\s+/)
          .filter(sentence => sentence.toLowerCase().includes(keyword.toLowerCase()))
      : [cleanText.slice(0, 3000)];

    res.status(200).json({ matches });
  } catch (err) {
    console.error("JobRight fetch error:", err);
    res.status(500).json({ error: err.message });
  }
}
