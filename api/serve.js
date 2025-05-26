import { createReadStream } from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: "Missing file parameter" });
  }

  const safeFileName = path.basename(file); // prevent path traversal
  const filePath = path.join(os.tmpdir(), safeFileName);

  try {
    const stream = createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Failed to serve file" });
  }
}
