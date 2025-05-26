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

    const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(fileName)}`;
    const inline = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    res.status(200).json({ imageUrl: fileUrl, inline });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
