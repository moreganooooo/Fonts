import mammoth from "mammoth";
import fetch from "node-fetch";
import FormData from "form-data";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const config = {
  api: { bodyParser: true }
};

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  if (pathname.endsWith("/convert")) {
    const { docxUrl, format } = req.body;

    if (!docxUrl || !["html", "pdf", "txt"].includes(format)) {
      return res.status(400).json({ error: "Missing or invalid input" });
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
        if (!result.output?.url) throw new Error("PDF conversion failed.");

        const pdfRes = await fetch(result.output.url);
        const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
        await fs.writeFile(filePath, pdfBuffer);
      }

      const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(filename)}`;
      res.status(200).json({ fileUrl, inline: inline || null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Conversion failed" });
    }
  }

  else if (pathname.endsWith("/summarize")) {
    const { docxUrl } = req.body;

    if (!docxUrl) return res.status(400).json({ error: "Missing docxUrl" });

    try {
      const doc = await fetch(docxUrl);
      const buffer = Buffer.from(await doc.arrayBuffer());
      const { value: text } = await mammoth.extractRawText({ buffer });

      const prompt = `Summarize the following document content:\n\n${text}`;

      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500
        })
      });

      const data = await gptRes.json();
      const summary = data.choices?.[0]?.message?.content || "No summary returned";

      res.status(200).json({ summary });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  else {
    res.status(404).json({ error: "Unknown route" });
  }
}
