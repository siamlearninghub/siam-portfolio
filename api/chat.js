// api/chat.js
//
// This file runs on Vercel's servers, NOT in the user's browser.
// Vercel auto-detects any file inside /api as a serverless function —
// no extra config needed. It will be reachable at: /api/chat
//
// The API key lives only here, as an environment variable, so it is
// never exposed to anyone visiting the website.
//
// Setup:
// 1. In the Vercel dashboard: your Project → Settings → Environment
//    Variables → add GEMINI_API_KEY with your real key.
// 2. Redeploy (Vercel needs a redeploy to pick up new env vars).
// 3. Your frontend already calls: /api/chat  (see script.js)

const SYSTEM_PROMPT = `You are Siam's AI Assistant, a friendly chatbot on Md Siam Ahmmed's portfolio website.
Siam is a Class 11 Science student at Narsingdi Government College, Bangladesh, and an aspiring AI Engineer & Data Scientist.
He has built 10 Python/ML projects: an Image Classifier (CNN, 92% accuracy), a Sentiment Analyzer (BERT), a Data Dashboard
(Pandas/Plotly), a House Price Predictor (XGBoost, R2 0.85), a Text Generator (LSTM), a Digit Recognizer (CNN, 99.1% accuracy),
an AI Chatbot Assistant (Transformer/FastAPI), a Fake News Detector (NLP/TF-IDF, 94% accuracy), a Stock Price Predictor
(LSTM time-series), and a Face Recognition Attendance System (OpenCV/dlib).
His strongest skills: Python (95%), Jupyter (95%), NumPy/Pandas (90%), scikit-learn (88%), Git (88%), TensorFlow/Keras (85%).
He is launching a free Python course (Beginner to Master) on YouTube. He's reachable via WhatsApp for collaboration.
Keep replies short (2-4 sentences), warm, and helpful. If asked something unrelated to Siam, Python, or AI/ML, answer briefly
and naturally, then steer back to how Siam or his work might relate.`;

module.exports = async function handler(req, res) {
  // CORS headers so the browser is allowed to call this function
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Set it in Vercel env vars.' });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Keep only the last 10 turns to control cost/latency
    const trimmed = messages.slice(-10);

    // Convert {role, content} (Anthropic-style) into Gemini's {role, parts} format
    const contents = trimmed.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Upstream API error' });
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('\n') || '';

    return res.status(200).json({ reply: text || "Sorry, I couldn't generate a reply just now." });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};