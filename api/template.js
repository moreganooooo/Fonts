import { Document, Packer, Paragraph } from "docx";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

function fillTemplate(template, values) {
  return template.replace(/{{(\\w+)}}/g, (_, key) => values[key] || "");
}

export default async function handler(req, res) {
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
