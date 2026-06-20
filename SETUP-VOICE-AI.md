# AI Chatbot Setup — Voice + Real Claude API (Vercel)

Your chatbox supports:
- 🎤 **Voice input** — tap the mic, speak, it auto-sends
- 🔊 **Voice output** — bot speaks replies (toggle with the speaker icon)
- 🤖 **Real AI replies** — powered by the Claude API, called through a hidden backend

## Why a backend is needed

The API key can never be safely placed in `script.js` — anyone could open
DevTools and steal it. Instead, the key lives only on Vercel's servers,
as an environment variable. Your browser talks to a small serverless
function, and that function talks to Claude.

```
Browser (script.js) → /api/chat → Claude API
                         (key hidden here)
```

## Files involved

- `api/chat.js` — the secure backend function. Vercel automatically turns
  any file inside an `/api` folder into a live serverless endpoint —
  no config file needed. This one becomes reachable at `/api/chat`.
- `package.json` — minimal Node config
- `script.js` — already set to call `/api/chat`

## Deployment steps

1. **Get a Claude API key**
   Go to https://console.anthropic.com → API Keys → Create Key. Copy it.

2. **Push this whole folder to your Vercel project**
   - If your site is connected to a GitHub repo: replace your old files
     with these (including the new `api` folder), commit, and push.
     Vercel will auto-deploy.
   - If you deploy by uploading/dragging a folder, or via the Vercel CLI
     (`vercel deploy`), just include the `api` folder along with the rest.

3. **Add your API key as an environment variable**
   In the Vercel dashboard:
   `Your Project → Settings → Environment Variables`
   - Key: `ANTHROPIC_API_KEY`
   - Value: *(paste your real key)*
   - Environment: select Production (and Preview if you want it there too)
   Then **redeploy** — Vercel needs a fresh deploy to pick up new env vars
   (Deployments tab → ⋯ menu on the latest deployment → Redeploy).

4. **Test it**
   Open your live `.vercel.app` (or custom) domain, unlock the site,
   scroll to the chatbot, and ask something. If the function isn't
   reachable yet, the chatbot automatically falls back to simple
   built-in replies instead of breaking.

## Notes

- Voice input/output use the browser's **free built-in** Web Speech API —
  no extra cost, but quality/availability varies slightly by browser
  (works best in Chrome). Safari/Firefox support for speech recognition
  is more limited.
- If you ever want nicer-sounding AI voices later, that requires a paid
  text-to-speech API (e.g. ElevenLabs) — let me know if you want that upgrade.
- Each visitor's conversation uses your Claude API credits, so keep an eye
  on usage in the Anthropic console, especially once the site gets traffic.
- Local testing: running `index.html` by just opening the file (or via
  Vercel CLI's `vercel dev`) will let you test the UI; the real `/api/chat`
  call only works once deployed (or under `vercel dev`, which emulates
  the function locally).