# UltraGPT Toolkit (v4)

This repo powers your custom GPT with document, design, memory, and intelligence superpowers — all deployable on Vercel's free plan.

---

## 🧠 Capabilities Summary

| Category         | Feature Description |
|------------------|---------------------|
| **Fonts**        | List, preview, and render any font |
| **.docx Editing**| Edit, style, convert, split, and extract from .docx |
| **Templates**    | Generate brand-styled documents |
| **Web**          | Web search, scrape, and structured content analysis |
| **Jobs**         | Unified job search from multiple APIs |
| **Memory**       | Save, retrieve, and manage per-user memory |
| **Visuals**      | Generate embeddable charts |
| **Bundles**      | Merge, serve, and download file packages |

---

## 🧩 Endpoints Overview

### 🎨 Fonts
- `GET /fonts` — list available fonts
- `GET /render` — render text with font
- `GET /preview` — generate font preview image

### 📄 Documents
- `POST /docs/update` — edit/append content into a .docx
- `POST /docs/template` — create brand-styled documents
- `POST /docs/search` — search a document for phrases
- `GET /docs/serve` — serve a downloadable file
- `POST /convert` — convert .docx to PDF/HTML

### 🌍 Web + Scraping
- `POST /search` — run Brave, DuckDuckGo, or Google search
- `POST /fetch` — fetch raw HTML or extract key info
- `POST /analyze` — structured analysis of site content

### 🧠 Memory
- `POST /user/init` — initialize memory for a user
- `POST /user/prefs` — update user preferences
- `POST /memory/save` — store structured memories
- `POST /memory/search` — query memory records
- `POST /memory/list` — list memory entries
- `POST /memory/delete` — delete a memory item

### 👥 Jobs
- `POST /jobs/search` — search multiple job APIs (Google Cloud, Adzuna, etc.)

### 📊 Visuals
- `POST /visuals/chart` — generate PNG from bar, pie, line, scatter data

---

## 📦 Hosting Guide (Vercel)

1. Sign up at [vercel.com](https://vercel.com)
2. Create a project from your GitHub repo
3. Add environment variables:
   - `CLOUDCONVERT_API_KEY`
   - `GOOGLE_APPLICATION_CREDENTIALS`
   - `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
   - `BRAVE_API_KEY` (optional)
4. Deploy & test

---

## 🧪 Testing Actions

In the GPT builder:
- Use `Test` next to each action path
- Or run live calls with `GET/POST` directly

---

## 💡 Suggestions

- Keep merged endpoints below 12 for Hobby tier
- Use Google Drive + CloudConvert for rich workflows
- Add OpenAI-compatible JSON schema to actions

---

Built with ❤️ to supercharge GPTs.