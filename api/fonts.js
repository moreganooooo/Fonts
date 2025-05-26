import fs from "fs/promises";
import path from "path";
import { createCanvas } from "canvas";

const fontsDir = path.join(process.cwd(), "public/fonts");

export const config = {
  api: { bodyParser: true }
};

function getFontList() {
  return fs.readdir(fontsDir)
    .then(files =>
      files.filter(name => name.endsWith(".ttf") || name.endsWith(".otf"))
          .map(name => ({ name: name.replace(/\.(ttf|otf)$/, ""), url: `/fonts/${name}` }))
    );
}

async function renderTextSample(text, fontName, size = 32) {
  const canvas = createCanvas(800, 120);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000";
  ctx.font = `${size}px '${fontName}'`;
  ctx.fillText(text, 50, 70);

  return canvas.toBuffer("image/png");
}

export default async function handler(req, res) {
  const { method, url, query } = req;

  try {
    if (method === "GET" && url.includes("/fonts")) {
      const fonts = await getFontList();
      return res.status(200).json({ fonts });
    }

    if (method === "GET" && url.includes("/render")) {
      const { text = "Sample Text", font = "Arial", size = "32" } = query;
      const buffer = await renderTextSample(text, font, parseInt(size));
      res.setHeader("Content-Type", "image/png");
      return res.status(200).send(buffer);
    }

    if (method === "GET" && url.includes("/preview")) {
      const { font = "Arial" } = query;
      const buffer = await renderTextSample("The quick brown fox", font, 28);
      res.setHeader("Content-Type", "image/png");
      return res.status(200).send(buffer);
    }

    res.status(404).json({ error: "Unsupported font endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
