import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from "docx";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
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
    return new Paragraph({ text: "[Image Placeholder: Images not embedded in this version]" });
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { docxUrl, fileName, contentBlocks } = req.body;

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
