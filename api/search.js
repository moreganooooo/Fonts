import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export const config = {
  api: { bodyParser: true }
};

async function searchWeb(query) {
  const apiKey = process.env.BRAVE_API_KEY;
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey }
  });
  const data = await response.json();
  return data.web?.results?.map(r => ({ title: r.title, url: r.url, description: r.description })) || [];
}

async function fetchPageText(url) {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  return body ? body.textContent.trim().replace(/\s+/g, " ").slice(0, 10000) : "";
}

async function analyzeSiteContent(url) {
  const text = await fetchPageText(url);
  const tone = text.includes("!") ? "Excited" : "Neutral";
  const keywords = [...new Set(text.split(/\W+/).filter(w => w.length > 6))].slice(0, 10);
  return { tone, keywords, sample: text.slice(0, 300) };
}

export default async function handler(req, res) {
  const { method, url: reqUrl, body } = req;

  try {
    if (method === "POST" && reqUrl.includes("/search")) {
      const { query } = body;
      const results = await searchWeb(query);
      return res.status(200).json({ results });
    }

    if (method === "POST" && reqUrl.includes("/fetch")) {
      const { url } = body;
      const content = await fetchPageText(url);
      return res.status(200).json({ content });
    }

    if (method === "POST" && reqUrl.includes("/analyze")) {
      const { url } = body;
      const analysis = await analyzeSiteContent(url);
      return res.status(200).json({ analysis });
    }

    res.status(404).json({ error: "Unknown search endpoint" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Search handler error" });
  }
}
