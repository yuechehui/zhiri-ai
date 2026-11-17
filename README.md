# Zhiri AI

**Zhiri AI** (知日, "know the day") is an AI-powered daily life guide inspired by Eastern culture. A single static page with four sections:

- **Today** — a daily theme, suggestions and a reflection question. The content rotates through 30 guides, one per day of the year, so it changes every day.
- **My Profile** — name, birth date (Gregorian or Lunar), birth time in the 12 traditional Chinese hours, and birth place. Saved in the browser only (localStorage); nothing is uploaded. When Lunar is selected, the lunar date of the entered Gregorian birth date is shown using the browser's built-in Chinese calendar.
- **I Ching** — a real three-coin cast: three coins per line, six lines from the bottom up, matched against the 64 hexagrams of the King Wen sequence, with changing lines and the resulting changed hexagram. A reflection tool, not a prediction.
- **AI Assistant** — asks Zhiri a question. It calls `POST /api/chat` on the same site; the AI backend must be deployed (see below) for real answers.

## View the site

Once GitHub Pages is enabled, the site is live at:

**https://yuechehui.github.io/zhiri-ai/**

### Enable GitHub Pages (one-time, 2 taps)

1. Open the repository → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow) — the site deploys automatically.

## Preview locally

Open `index.html` in a browser, or run a local server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Note: the AI Assistant tab needs the backend (below); without it, it shows a "not connected yet" message.

## Enable the AI Assistant (Vercel)

The AI chat runs as a serverless function in `api/chat.js`. It talks to any OpenAI-compatible API — a TikBit relay key works too.

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → **Import** this repository (`yuechehui/zhiri-ai`).
2. In the project → **Settings → Environment Variables**, add:
   - `AI_API_URL` — the API base URL, e.g. `https://api.openai.com` (or your relay base URL, without a trailing `/v1`)
   - `AI_API_KEY` — your API key
   - `AI_MODEL` — optional, e.g. `gpt-4o-mini` (default)
3. **Deploy.** The assistant at your Vercel URL will answer real questions, using the saved profile as context when relevant.

Never put an API key in `index.html` or anywhere in this repository — it is public and the key would be stolen within minutes. Keys live only in Vercel environment variables.

## Project structure

```
index.html                  # the whole site (HTML + CSS + JS)
api/chat.js                 # Vercel serverless function for the AI chat
vercel.json                 # Vercel function settings
.github/workflows/pages.yml  # GitHub Pages deploy workflow
```
