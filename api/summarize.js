import mammoth from "mammoth";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true
  }
};

async function summarizeWithGPT(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI API key");

  const prompt = `Summarize the following document content:\n\n${text}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No summary available.";
}

export default async function handler(req, res) {
  const { docxUrl } = req.body;

  if (!docxUrl) return res.status(400).json({ error: "Missing docxUrl" });

  try {
    const doc = await fetch(docxUrl);
    const buffer = Buffer.from(await doc.arrayBuffer());
    const { value: text } = await mammoth.extractRawText({ buffer });

    const summary = await summarizeWithGPT(text);
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
