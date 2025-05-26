import mammoth from "mammoth";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { docxUrl } = req.body;

  if (!docxUrl) {
    return res.status(400).json({ error: "Missing docxUrl" });
  }

  try {
    const response = await fetch(docxUrl);
    const buffer = await response.arrayBuffer();

    const { value: text } = await mammoth.extractRawText({ buffer });

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
