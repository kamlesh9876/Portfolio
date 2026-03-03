const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// Proxy endpoint for Anthropic API
app.post('/api/chat', async (req, res) => {
  try {
    console.log('📥 Received request:', JSON.stringify(req.body, null, 2));
    
const { messages, system, kb } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format');
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    console.log('🔑 API Key exists:', !!process.env.GROQ_API_KEY);
    
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
          { role: 'system', content: system || '' },
          { role: 'system', content: `KNOWLEDGE BASE (use only this):\n${kb || ''}` },
          ...messages
        ]
      })
    });

    console.log('📤 Groq response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Groq API Error:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    // Convert Groq format to match expected format
    const formattedResponse = {
      content: [{ text: data.choices[0].message.content }]
    };
    
    console.log('✅ Success, sending response');
    res.json(formattedResponse);
    
  } catch (error) {
    console.error('💥 Proxy Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: error.message });
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
