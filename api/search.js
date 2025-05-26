import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: true
  }
};

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

export default async function handler(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const response = await fetch(
      \`https://api.search.brave.com/res/v1/web/search?q=\${encodeURIComponent(query)}&count=5\`,
      {
        headers: {
          "Accept": "application/json",
          "X-Subscription-Token": BRAVE_API_KEY
        }
      }
    );

    const data = await response.json();

    const results = data.web?.results?.map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.description
    })) || [];

    res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
