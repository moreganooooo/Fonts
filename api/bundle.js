import archiver from "archiver";
import fetch from "node-fetch";
import { createWriteStream } from "fs";
import { promises as fs } from "fs/promises";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
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

    const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(zipName)}`;
    res.status(200).json({ fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
