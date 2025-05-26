export const config = {
  api: {
    bodyParser: true
  }
};

function convertGoogleDriveLink(sharedLink) {
  const match = sharedLink.match(/[-\w]{25,}/);
  if (!match) return null;

  const fileId = match[0];
  return \`https://drive.google.com/uc?export=download&id=\${fileId}\`;
}

export default async function handler(req, res) {
  const { driveLink } = req.body;

  if (!driveLink) {
    return res.status(400).json({ error: "Missing Google Drive link" });
  }

  const directUrl = convertGoogleDriveLink(driveLink);

  if (!directUrl) {
    return res.status(400).json({ error: "Invalid Google Drive link" });
  }

  res.status(200).json({ directUrl });
}
