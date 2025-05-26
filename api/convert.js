import mammoth from "mammoth";
import fetch from "node-fetch";
import FormData from "form-data";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY;

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { docxUrl, format } = req.body;

  if (!docxUrl || !["html", "pdf", "txt"].includes(format)) {
    return res.status(400).json({ error: "Invalid or missing input" });
  }

  try {
    const response = await fetch(docxUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    const filename = `converted-${Date.now()}.${format}`;
    const filePath = path.join(os.tmpdir(), filename);
    let inline = null;

    if (format === "html") {
      const { value: html } = await mammoth.convertToHtml({ buffer });
      await fs.writeFile(filePath, html);
      inline = `data:text/html;base64,${Buffer.from(html).toString("base64")}`;
    } else if (format === "txt") {
      const { value: text } = await mammoth.extractRawText({ buffer });
      await fs.writeFile(filePath, text);
      inline = `data:text/plain;base64,${Buffer.from(text).toString("base64")}`;
    } else if (format === "pdf") {
      const form = new FormData();
      form.append("apikey", CLOUDCONVERT_API_KEY);
      form.append("inputformat", "docx");
      form.append("outputformat", "pdf");
      form.append("input", "upload");
      form.append("file", buffer, {
        filename: "input.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

      const cloudRes = await fetch("https://api.cloudconvert.com/convert", {
        method: "POST",
        body: form
      });

      const result = await cloudRes.json();
      if (!result.output || !result.output.url) {
        throw new Error("CloudConvert PDF conversion failed.");
      }

      const pdfFile = await fetch(result.output.url);
      const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
      await fs.writeFile(filePath, pdfBuffer);
    }

    const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(filename)}`;

    res.status(200).json({
      fileUrl,
      inline: inline || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Conversion failed" });
  }
}
