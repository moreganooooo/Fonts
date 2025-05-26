import mammoth from "mammoth";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { docxUrl } = req.body;

  if (!docxUrl) {
    return res.status(400).json({ error: "Missing docxUrl" });
  }

  try {
    const response = await fetch(docxUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const { value: text } = await mammoth.extractRawText({ buffer });

    res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
