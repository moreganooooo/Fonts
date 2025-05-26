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
  const { docxUrls } = req.body;

  if (!docxUrls || !Array.isArray(docxUrls) || docxUrls.length < 2) {
    return res.status(400).json({ error: "At least two valid .docx URLs are required" });
  }

  try {
    const paragraphs = [];

    for (const url of docxUrls) {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const { value: text } = await mammoth.extractRawText({ buffer });

      const lines = text.split("\n").filter(Boolean);
      for (const line of lines) {
        paragraphs.push(new Paragraph(line));
      }

      // Add a separator between documents
      paragraphs.push(new Paragraph("–––––––––––––––––––––––––––"));
    }

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const mergedBuffer = await Packer.toBuffer(doc);
    const fileName = `merged-${Date.now()}.docx`;
    const filePath = path.join(os.tmpdir(), fileName);
    await fs.writeFile(filePath, mergedBuffer);

    const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(fileName)}`;
    res.status(200).json({ fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
