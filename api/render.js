import { Document, Packer, Paragraph, TextRun } from "docx";
import { promises as fs } from "fs";        // ✅ More compatible import
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
const doc = new Document({
  creator: "GPT Font Tool",
  title: "Generated Document",
  description: "A custom .docx file with selected font"
});
    doc.addSection({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: "Arial",    // We can update to apply actual font style later
              size: 24
            })
          ]
        })
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const tempPath = path.join(os.tmpdir(), `output-${Date.now()}.docx`);
    await fs.writeFile(tempPath, buffer);

    res.setHeader("Content-Disposition", "attachment; filename=generated.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    const fileBuffer = await fs.readFile(tempPath);
    res.status(200).send(fileBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
}
