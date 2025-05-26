export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
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
  res.status(200).send(html);
}
