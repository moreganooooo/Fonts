import fetch from "node-fetch";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const pathname = req.url.split("?")[0];

  if (pathname.endsWith("/preview")) {
    const { text, fontUrl } = req.query;

    if (!text || !fontUrl) {
      return res.status(400).send("Missing text or fontUrl");
    }

    const html = `
      <html>
        <head>
          <style>
            @font-face {
              font-family: 'PreviewFont';
              src: url('${fontUrl}');
            }
            body {
              font-family: 'PreviewFont', sans-serif;
              font-size: 24px;
              padding: 20px;
            }
          </style>
        </head>
        <body>${text}</body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  }

  else if (pathname.endsWith("/chart")) {
    const { type, data } = req.body;

    if (!type || !data || !["bar", "line", "pie"].includes(type)) {
      return res.status(400).json({ error: "Invalid chart type or missing data" });
    }

    try {
      const chartConfig = {
        type,
        data,
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Generated Chart" }
          }
        }
      };

      const chartUrl = `https://quickchart.io/chart?width=600&height=400&format=png&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
      const fileName = `chart-${Date.now()}.png`;
      const filePath = path.join(os.tmpdir(), fileName);

      const imageRes = await fetch(chartUrl);
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

      await fs.writeFile(filePath, imageBuffer);

      const fileUrl = \`https://fonts-nu.vercel.app/api/serve?file=\${encodeURIComponent(fileName)}\`;
      const inline = \`data:image/png;base64,\${imageBuffer.toString("base64")}\`;

      return res.status(200).json({ imageUrl: fileUrl, inline });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  else {
    return res.status(404).json({ error: "Unknown route" });
  }
}
