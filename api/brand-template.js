import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: true
  }
};

function hexToRgb(hex) {
  const match = hex.replace("#", "").match(/.{1,2}/g);
  return match ? match.map(h => parseInt(h, 16)) : [0, 0, 0];
}

export default async function handler(req, res) {
  const { brandName = "Your Brand", primaryColor = "#0000FF", font = "Arial", tone = "professional" } = req.body;

  try {
    const colorRgb = hexToRgb(primaryColor);
    const title = new Paragraph({
      text: brandName + " Overview",
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: brandName + " Overview",
          color: primaryColor.replace("#", ""),
          bold: true,
          size: 48
        })
      ]
    });

    const body = new Paragraph({
      children: [
        new TextRun({
          text: `This is a sample branded document styled in a ${tone} tone, using the font ${font}. Customize this content further to match your brand's voice and format.`,
          size: 24,
          font
        })
      ]
    });

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font
            }
          }
        ]
      },
      sections: [{ children: [title, body] }]
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `brand-template-${Date.now()}.docx`;
    const filePath = path.join(os.tmpdir(), fileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `https://fonts-nu.vercel.app/api/serve?file=${encodeURIComponent(fileName)}`;
    res.status(200).json({ fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
