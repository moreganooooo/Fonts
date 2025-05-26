# 📘 Ultra Document, Web, and Job Intelligence Toolkit

This toolkit powers your custom GPT with full document control, font rendering, web search, email discovery, job search, and persistent memory—all hosted via Vercel.

---

## 🌐 Base URL

```
https://fonts-nu.vercel.app/api
```

---

## ✅ Available API Endpoints (21)

### 📄 Document Actions
- `POST /docs/update` – Update or create a .docx document
- `POST /docs/template` – Generate structured doc from title + sections
- `POST /docs/search` – Search keywords in a document
- `GET /docs/serve` – Serve downloadable document by name

### 🔁 Convert & Summarize
- `POST /convert` – Convert .docx to PDF or HTML
- `POST /summarize` – Generate summary of uploaded .docx
- `POST /extract` – Extract raw text from .docx
- `POST /split` – Break document into parts
- `POST /bundle` – Merge documents into zip

### ✍️ Fonts & Visuals
- `GET /fonts` – List all available fonts
- `GET /render` – Render preview in chosen font
- `GET /preview` – Image preview of font styling
- `POST /visuals/chart` – Generate bar, pie, or line chart

### 🌍 Web Search & Reading
- `POST /search` – Search the web (via Brave API)
- `POST /fetch` – Extract main readable text from a URL
- `POST /jobright` – Search jobright.ai for relevant content
- `POST /analyze` – Get GPT analysis of a website
- `POST /reader/emails` – Extract email addresses from any website

### 💼 Job Board Supersearch
- `POST /jobs/search` – Search jobs from Google, Remotive, Arbeitnow

### 🧠 Memory
- `POST /memory/save` – Save a summary, doc, or insight to memory
- `POST /memory/search` – Search previously saved entries

---

## 🔐 Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Summarization and GPT analysis |
| `CLOUDCONVERT_API_KEY` | PDF conversion |
| `BRAVE_API_KEY` | Web search |
| `GOOGLE_CREDENTIALS_JSON` | Google Cloud Talent API auth |

---

## 🧪 Local Testing

```bash
npm install
vercel dev
```

---

## 🧠 Example GPT Prompts

- “Summarize this job description from Google Docs”
- “Build a branded resume template”
- “Find jobs for ‘AI Product Manager’ near Berlin”
- “Extract emails from the OpenAI research team page”
- “Search my memory for anything I said about invoices”

---

MIT License — Built by you, supercharged by OpenAI 💙