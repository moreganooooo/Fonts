import fs from "fs/promises";
import path from "path";
import os from "os";
import { Packer, Document, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import { exec } from "child_process";

export const config = {
  api: { bodyParser: true }
};

export default async function handler(req, res) {
  const { method, url } = req;

  try {
    if (method === "POST" && url.includes("/update")) {
      const { text, font = "Arial", size = 24 } = req.body;
      const doc = new Document();
      doc.addSection({
        children: [new Paragraph({ children: [new TextRun({ text, font, size })] })]
      });
      const buffer = await Packer.toBuffer(doc);
      const outPath = path.join(os.tmpdir(), `doc-${Date.now()}.docx`);
      await fs.writeFile(outPath, buffer);
      const data = await fs.readFile(outPath);
      return res.status(200).send(data);
    }

    if (method === "POST" && url.includes("/convert")) {
      const { docxBase64, to = "pdf" } = req.body;
      const tmpInput = path.join(os.tmpdir(), `input-${Date.now()}.docx`);
      const tmpOutput = tmpInput.replace(".docx", `.${to}`);
      await fs.writeFile(tmpInput, Buffer.from(docxBase64, "base64"));
      if (to === "pdf") {
        // Example using LibreOffice CLI conversion (requires install)
        await new Promise((resolve, reject) => {
          exec(`soffice --headless --convert-to pdf --outdir ${os.tmpdir()} ${tmpInput}`, (err) =>
            err ? reject(err) : resolve()
          );
        });
        const pdf = await fs.readFile(tmpOutput);
        return res.status(200).send(pdf);
      }
      return res.status(400).json({ error: "Unsupported conversion type" });
    }

    if (method === "POST" && url.includes("/extract")) {
      const { docxBase64 } = req.body;
      const tmpPath = path.join(os.tmpdir(), `temp-${Date.now()}.docx`);
      await fs.writeFile(tmpPath, Buffer.from(docxBase64, "base64"));
      const { value } = await mammoth.extractRawText({ path: tmpPath });
      return res.status(200).json({ text: value });
    }

    if (method === "POST" && url.includes("/split")) {
      const { docxBase64 } = req.body;
      const tmpPath = path.join(os.tmpdir(), `split-${Date.now()}.docx`);
      await fs.writeFile(tmpPath, Buffer.from(docxBase64, "base64"));
      // Simplified: just duplicate the original as 2 chunks
      const parts = [await fs.readFile(tmpPath), await fs.readFile(tmpPath)];
      return res.status(200).json({ chunks: parts.map(buf => buf.toString("base64")) });
    }

    res.status(404).json({ error: "Unsupported docs endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error" });
  }
}
