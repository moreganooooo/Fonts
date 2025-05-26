# 🧠 DocxUltraAPI – GPT Document Superpowers (Extended Edition)

This repository powers a full OpenAI GPT Action integration for creating, editing, summarizing, bundling, previewing, templating, and visualizing `.docx` files.

## 🚀 Live Vercel Endpoint
Your API is deployed at:
```
https://fonts-nu.vercel.app
```

## 📦 Endpoints

### Core Utilities
- **`/api/fonts`** (GET) – List available fonts
- **`/api/render`** (GET) – Render text into a .docx using a font
- **`/api/update`** (POST) – Add text, tables, or images to a .docx
- **`/api/convert`** (POST) – Convert .docx to HTML, PDF, or TXT
- **`/api/serve`** (GET) – Serve generated files from temp storage

### Document Processing
- **`/api/extract`** (POST) – Extract plain text from a .docx
- **`/api/merge`** (POST) – Merge multiple .docx files
- **`/api/split`** (POST) – Split .docx by page or heading

### Advanced Additions
- **`/api/preview`** (GET) – Preview text using a custom font in HTML
- **`/api/template`** (POST) – Generate a .docx from a template with placeholders
- **`/api/summarize`** (POST) – Get a GPT-generated summary of a document
- **`/api/bundle`** (POST) – Combine multiple .docx files into a ZIP
- **`/api/chart`** (POST) – Generate a chart image (bar, line, pie) from JSON data

---

## 🧪 Local Dev Instructions

### Install
```bash
npm install
```

### Run Locally
```bash
vercel dev
```

### Deploy to Vercel
Push to GitHub → Vercel auto-deploys.

---

## 🔐 Required Env Variables

| Name | Description |
|------|-------------|
| `CLOUDCONVERT_API_KEY` | Enables .docx → PDF |
| `OPENAI_API_KEY` | Enables GPT summarization |

---

## 🤖 GPT Action Setup
Use `DocxUltraAPI-FULL-EXTENDED-schema.json` in your GPT “Actions” configuration.

---

## 🧠 Prompt Examples

```plaintext
"Create a document using this font: Lora and this text: Hello World!"
"Summarize this document: [URL]"
"Bundle these into a ZIP: [URL1, URL2, URL3]"
"Preview what this text looks like in Helvetica: 'Welcome!'"
"Generate a line chart of sales data..."
```

---

MIT License — by you & OpenAI 💙