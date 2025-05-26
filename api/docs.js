import { Document, Packer, Paragraph, TextRun } from "docx";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  try {
    if (pathname.endsWith("/update")) {
      const { text = "", heading = "", font = "Arial", size = 24 } = req.body;

      const doc = new Document();
      doc.addSection({
        children: [
          new Paragraph({
            text: heading,
            heading: "Heading1"
          }),
          new Paragraph({
            children: [new TextRun({ text, font, size })]
          })
        ]
      });

      const buffer = await Packer.toBuffer(doc);
      const filePath = path.join(os.tmpdir(), `updated-${Date.now()}.docx`);
      await fs.writeFile(filePath, buffer);

      return res.status(200).json({
        fileUrl: \`https://fonts-nu.vercel.app/api/serve?file=\${path.basename(filePath)}\`
      });
    }

    if (pathname.endsWith("/template")) {
      const { title = "Untitled", sections = [], font = "Arial" } = req.body;

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                children: [new TextRun({ text: title, bold: true, size: 32 })]
              }),
              ...sections.map(section =>
                new Paragraph({
                  children: [new TextRun({ text: section, font, size: 24 })]
                })
              )
            ]
          }
        ]
      });

      const buffer = await Packer.toBuffer(doc);
      const filePath = path.join(os.tmpdir(), `template-${Date.now()}.docx`);
      await fs.writeFile(filePath, buffer);

      return res.status(200).json({
        fileUrl: \`https://fonts-nu.vercel.app/api/serve?file=\${path.basename(filePath)}\`
      });
    }

    if (pathname.endsWith("/search")) {
      const { text = "", keyword = "" } = req.body;

      if (!text || !keyword) {
        return res.status(400).json({ error: "Missing text or keyword" });
      }

      const results = text
        .split(/(?<=\.)\s+/)
        .filter(s => s.toLowerCase().includes(keyword.toLowerCase()));

      return res.status(200).json({ results });
    }

    if (pathname.endsWith("/serve")) {
      const { file } = req.query;
      if (!file) return res.status(400).json({ error: "Missing filename" });

      const tempPath = path.join(os.tmpdir(), file);
      const fileBuffer = await fs.readFile(tempPath);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", \`attachment; filename=\${file}\`);
      return res.status(200).send(fileBuffer);
    }

    return res.status(404).json({ error: "Route not found" });
  } catch (err) {
    console.error("Docs handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
