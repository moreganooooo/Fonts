import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: { bodyParser: true }
};

function createContentBlock(block) {
  if (block.type === "text") {
    const run = new TextRun({
      text: block.text,
      bold: block.style?.bold,
      italics: block.style?.italic,
      underline: block.style?.underline,
      size: block.style?.fontSize ? block.style.fontSize * 2 : undefined
    });

    return new Paragraph({
      alignment: block.style?.alignment || AlignmentType.LEFT,
      children: [run]
    });
  }

  if (block.type === "image") {
    return new Paragraph({ text: "[Image Placeholder]" });
  }

  if (block.type === "table") {
    const rows = block.rows.map(row =>
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
            children: [new Paragraph(cell)]
          })
        )
      })
    );

    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  }

  return null;
}

function fillTemplate(template, values) {
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key] || "");
}

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  if (pathname.endsWith("/update")) {
    const { docxUrl, fileName, contentBlocks } = req.body;

    if (!contentBlocks) {
      return res.status(400).json({ error: "Missing contentBlocks" });
    }

    try {
      const children = [];

      for (const block of contentBlocks) {
        const content = createContentBlock(block);
        if (content) children.push(content);
      }

      const doc = new Document({
        sections: [{ children }]
      });

      const buffer = await Packer.toBuffer(doc);
      const finalName = fileName || `Updated-${Date.now()}.docx`;
      const filePath = path.join(os.tmpdir(), finalName);
      await fs.writeFile(filePath, buffer);

      const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(finalName)}`;
      res.status(200).json({ fileUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else if (pathname.endsWith("/template")) {
    const { template, values, fileName = "template-filled.docx" } = req.body;

    if (!template || typeof values !== "object") {
      return res.status(400).json({ error: "Missing or invalid input" });
    }

    try {
      const filledText = fillTemplate(template, values);
      const doc = new Document({
        sections: [{ children: [new Paragraph(filledText)] }]
      });

      const buffer = await Packer.toBuffer(doc);
      const filePath = path.join(os.tmpdir(), fileName);
      await fs.writeFile(filePath, buffer);

      const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(fileName)}`;
      res.status(200).json({ fileUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(404).json({ error: "Unknown route" });
  }
}
