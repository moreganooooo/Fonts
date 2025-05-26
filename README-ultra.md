# 📘 Ultra Document & Web Intelligence Toolkit

This project powers a custom GPT with advanced capabilities for working with `.docx` documents, web content, fonts, visualizations, and persistent memory—all deployed through Vercel.

---

## 🌐 Live API
Base URL: `https://fonts-nu.vercel.app/api`

---

## ✅ Available Endpoints (19 Total)

### 🗂️ Document Tools
- `POST /docs/update` – Create or edit a document with custom fonts and content
- `POST /docs/template` – Build a branded document from structured sections
- `POST /docs/search` – Keyword search inside plain document text
- `GET /docs/serve` – Serve and download generated files

### 🔁 Conversion + Extraction
- `POST /convert` – Convert .docx to PDF or HTML
- `POST /summarize` – Summarize .docx content using GPT
- `POST /extract` – Extract plain text from uploaded .docx
- `POST /split` – Split documents by page or heading
- `POST /bundle` – Merge and zip multiple documents

### 🎨 Fonts + Visuals
- `GET /fonts` – List available fonts from hosted directory
- `GET /render` – Render preview text in selected font
- `GET /preview` – Generate font preview image in HTML
- `POST /visuals/chart` – Create a bar, line, or pie chart from JSON data

### 🌍 Web & Custom Sources
- `POST /search` – Search the web using Brave Search API
- `POST /fetch` – Fetch and return webpage content from any public URL
- `POST /jobright` – Custom scraper for jobright.ai (by path + keyword)
- `POST /analyze` – Analyze site UX, tone, and structure with GPT-4

### 🧠 Persistent Memory
- `POST /memory/save` – Save a summary, insight, or doc metadata to memory
- `POST /memory/search` – Search for past entries from custom memory JSON

---

## 🔐 Environment Variables

| Name | Purpose |
|------|---------|
| `OPENAI_API_KEY` | Used for summarization and website analysis |
| `CLOUDCONVERT_API_KEY` | Used for PDF conversion |
| `BRAVE_API_KEY` | Used for web search queries |

---

## 🧪 Local Development

```bash
npm install
vercel dev
```

Deploy via GitHub → auto-deploys to Vercel

---

## 🧠 Prompt Examples

```plaintext
"Build me a branded doc with the title 'Sales Report Q2'"
"Search jobright.ai/blog for 'marketplaces'"
"Summarize this docx: [Google Drive link]"
"Generate a line chart from these sales figures..."
"Add this note to memory: 'We started automation phase 2 on May 1'"
```

---

MIT License — by you & OpenAI 💙