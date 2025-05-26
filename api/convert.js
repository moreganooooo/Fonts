import mammoth from "mammoth";
import fetch from "node-fetch";
import FormData from "form-data";

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_API_KEY;

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { docxUrl, format } = req.body;

  if (!docxUrl || !["html", "pdf"].includes(format)) {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    const response = await fetch(docxUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    if (format === "html") {
      const { value: html } = await mammoth.convertToHtml({ buffer });
      const htmlB64 = Buffer.from(html).toString("base64");
      return res.status(200).json({ fileUrl: `data:text/html;base64,${htmlB64}` });
    }

    if (format === "pdf") {
      const form = new FormData();
      form.append("apikey", CLOUDCONVERT_API_KEY);
      form.append("inputformat", "docx");
      form.append("outputformat", "pdf");
      form.append("input", "upload");
      form.append("file", buffer, { filename: "input.docx", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

      const cloudRes = await fetch("https://api.cloudconvert.com/convert", {
        method: "POST",
        body: form
      });

      const result = await cloudRes.json();

      if (!result.output || !result.output.url) {
        throw new Error("PDF conversion failed.");
      }

      return res.status(200).json({ fileUrl: result.output.url });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Conversion error" });
  }
}
