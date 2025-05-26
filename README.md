# 🧠 DocxUltraAPI – GPT Document Superpowers

This repository powers a full OpenAI GPT Action integration for handling `.docx` files with advanced styling, formatting, extraction, and conversion features.

## 🚀 Live Vercel Endpoint
Your API is deployed at:
```
https://fonts-nu.vercel.app
```

## 📦 Endpoints

### 1. `/api/fonts` (GET)
Returns a list of available fonts hosted under `/public/fonts`.

### 2. `/api/render` (GET)
Renders input text with a selected font and returns a `.docx` file.

### 3. `/api/update` (POST)
Updates or creates a document from structured content blocks:
- text (with styles)
- tables
- image placeholders

### 4. `/api/convert` (POST)
Converts a `.docx` URL to:
- `html` (inline + hosted)
- `pdf` (via CloudConvert)
- `txt`

### 5. `/api/serve` (GET)
Streams files stored temporarily in `/tmp`.

### 6. `/api/extract` (POST)
Extracts raw plain text from a `.docx` file.

### 7. `/api/merge` (POST)
Merges an array of `.docx` file URLs into one combined document.

### 8. `/api/split` (POST)
Splits a `.docx` file by:
- `pages` (every ~30 lines)
- `headings` (lines starting with "Heading")

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
Push to GitHub. Vercel will auto-deploy from your linked repo.

---

## 🔐 Required Env Variables

| Name | Description |
|------|-------------|
| `CLOUDCONVERT_API_KEY` | API key for converting `.docx` to PDF |

---

## 🤖 GPT Setup
Use the `DocxUltraAPI-POLISHED-ultra-schema.json` file in the GPT “Actions” panel to register all endpoints.

---

## 🧠 Prompt Templates

```plaintext
"Create a document with the following text in bold: 'Hello, GPT!'"
"Convert this docx file to PDF: [URL]"
"Extract all text from this file: [URL]"
"Merge these docs: [URL1, URL2]"
"Split this document by headings: [URL]"
```

---

© MIT License — by you & OpenAI 💙