import { Document, Packer, Paragraph } from "docx";
import mammoth from "mammoth";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { docxUrl, method = "pages" } = req.body;

  if (!docxUrl || !["pages", "headings"].includes(method)) {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    const response = await fetch(docxUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const { value: text } = await mammoth.extractRawText({ buffer });

    const lines = text.split("\n").filter(Boolean);
    const chunks = [];

    if (method === "pages") {
      const pageSize = 30;
      for (let i = 0; i < lines.length; i += pageSize) {
        chunks.push(lines.slice(i, i + pageSize));
      }
    } else if (method === "headings") {
      let current = [];
      lines.forEach(line => {
        if (/^Heading/.test(line)) {
          if (current.length) chunks.push(current);
          current = [line];
        } else {
          current.push(line);
        }
      });
      if (current.length) chunks.push(current);
    }

    const urls = [];

    for (let i = 0; i < chunks.length; i++) {
      const doc = new Document({
        sections: [{
          children: chunks[i].map(p => new Paragraph(p))
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const filename = `split-${i + 1}-${Date.now()}.docx`;
      const filePath = path.join(os.tmpdir(), filename);
      await fs.writeFile(filePath, buffer);
      urls.push(`https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(filename)}`);
    }

    res.status(200).json({ parts: urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
