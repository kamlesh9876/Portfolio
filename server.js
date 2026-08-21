const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── SERVER-SIDE SYSTEM PROMPT + KB (never trust client for these) ──
const YUTSUMI_RULES = `
You are Yutsumi — a professional AI portfolio assistant representing Kamlesh Pawar.
Answer only what is explicitly asked.
Do not introduce yourself unless asked.
If asked your name, respond exactly: "I'm Yutsumi, Kamlesh's portfolio assistant."
Use only the knowledge base provided. Do not invent or assume.
Keep answers 1–3 sentences unless more detail is requested.
Never share: personal phone number, exact home address, credentials, internal company details.
Salary expectation: only say "open to discuss".
If the answer is not in the knowledge base, respond: "I don't have that information."
`;

const KAMLESH_KB = `
ABOUT
- Full Name: Kamlesh Sharad Pawar
- Role: Python Backend & AI Developer / Full-Stack Developer
- Location: Pune, Maharashtra, India
- Education: B.Tech Computer Science, Ajeenkya D.Y. Patil University (ADYPU) · 2022–2026
- CGPA: 7.51 (Clean academic standing)
- Status: Available for internships and entry-level software development roles

CURRENT INTERNSHIP
Software Development Intern — Nelumbus Technologies, Pune (Dec 2025 – Present)
- Contributing to AI-powered online assessment platform (Python)
- Building backend features, real-time timer logic, and auto-submission
- Optimizing agent workflows, performance tuning, and production debugging

PAST EXPERIENCE
IT Support Specialist — ADYPU (Jan 2025 – Apr 2025)
- End-to-end technical support, hardware/software, LAN networking, infrastructure

TECH STACK
Frontend: React, Next.js, TypeScript, JavaScript, Tailwind, HTML, CSS
Backend: Python, FastAPI, Flask, REST APIs, WebSockets, Apache Kafka
AI / GenAI: LLMs, RAG Pipelines, Prompt Engineering, LangChain, FAISS, Gemini API, Groq
Databases: SQL, MongoDB, Firestore
Mobile: Android, Kotlin, Java, Firebase
Tools: Git, GitHub, Linux, Docker, Vercel, Figma

FEATURED PROJECTS
1. DOC Analyser Using LLM: RAG pipeline with FAISS + Gemini for grounded document Q&A
2. Online Code Editor: Real-time collaborative browser code editor with backend persistence
3. W-People Chat App: Real-time Android messenger with Firebase Auth + Firestore
4. Flight Booking System: Python + Tkinter GUI desktop ticketing application
5. Yutsumi AI Assistant: Node.js Express backend + Groq Llama 3.1 8B instant

CONTACT
Email: kamleshsharadpawar@gmail.com
GitHub: github.com/kamlesh9876
LinkedIn: linkedin.com/in/kamleshpawar-softwaredev
`;

// ── CORS: restrict to known origins ──
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'https://kamlesh9876.vercel.app',
  'https://kamlesh9876.github.io'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(__dirname, {
  etag: false,
  maxAge: 0,
  lastModified: false,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-store')
}));

app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(__dirname + '/index.html');
});

// ── SIMPLE RATE LIMITER (in-memory, per IP) ──
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per window

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }
  next();
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS * 2;
  for (const [ip, entry] of rateLimitMap) {
    if (entry.windowStart < cutoff) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// ── CHAT PROXY (uses server-side prompts only) ──
app.post('/api/chat', rateLimit, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Validate message shape
    const valid = messages.every(m =>
      m && typeof m.role === 'string' && typeof m.content === 'string'
    );
    if (!valid) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 300,
        temperature: 0.2,
        messages: [
          { role: 'system', content: YUTSUMI_RULES },
          { role: 'system', content: `KNOWLEDGE BASE (use only this):\n${KAMLESH_KB}` },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', response.status, errorData.error?.message);
      return res.status(response.status).json({ error: 'AI service temporarily unavailable' });
    }

    const data = await response.json();
    const formattedResponse = {
      content: [{ text: data.choices[0].message.content }]
    };

    res.json(formattedResponse);

  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
