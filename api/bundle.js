import archiver from "archiver";
import { createWriteStream } from "fs";
import { promises as fs } from "fs/promises";
import path from "path";
import os from "os";
import fetch from "node-fetch";
import { Document, Packer, Paragraph } from "docx";
import mammoth from "mammoth";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  if (pathname.endsWith("/bundle")) {
    const { docxUrls, zipName = "bundle.zip" } = req.body;

    if (!Array.isArray(docxUrls) || docxUrls.length === 0) {
      return res.status(400).json({ error: "docxUrls must be a non-empty array" });
    }

    try {
      const zipPath = path.join(os.tmpdir(), zipName);
      const output = createWriteStream(zipPath);
      const archive = archiver("zip");

      archive.pipe(output);

      for (let i = 0; i < docxUrls.length; i++) {
        const url = docxUrls[i];
        const fileName = `doc-${i + 1}.docx`;

        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());
        archive.append(buffer, { name: fileName });
      }

      await archive.finalize();
      await new Promise(resolve => output.on("close", resolve));

      const fileUrl = \`https://fonts-nu.vercel.app/api/serve?file=\${encodeURIComponent(zipName)}\`;
      return res.status(200).json({ fileUrl });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  else if (pathname.endsWith("/merge")) {
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
      const fileName = \`merged-\${Date.now()}.docx\`;
      const filePath = path.join(os.tmpdir(), fileName);
      await fs.writeFile(filePath, mergedBuffer);

      const fileUrl = \`https://fonts-nu.vercel.app/api/serve?file=\${encodeURIComponent(fileName)}\`;
      return res.status(200).json({ fileUrl });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  else {
    return res.status(404).json({ error: "Unknown route" });
  }
}
