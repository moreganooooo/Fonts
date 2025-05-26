import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const { text, fontUrl } = req.query;

  if (!text || !fontUrl) {
    return res.status(400).json({ error: "Missing text or fontUrl" });
  }

  try {
    // Create a simple doc (custom font not truly embedded without template setup)
    const doc = new Document();
    doc.addSection({
      children: [
        new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 24 })]
        })
      ]
    });

    // Generate the .docx file
    const buffer = await Packer.toBuffer(doc);

    // Save to temp file
    const tempPath = path.join(os.tmpdir(), `output-${Date.now()}.docx`);
    await fs.writeFile(tempPath, buffer);

    // Set headers to download
    res.setHeader("Content-Disposition", "attachment; filename=generated.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    // Pipe the file back
    const fileBuffer = await fs.readFile(tempPath);
    res.status(200).send(fileBuffer);
  } catch (err) {
  res.status(500).json({ error: err.message || "Unknown error" });
}
