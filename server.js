const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // ✅ Import axios
require('dotenv').config(); // ✅ Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Test route to check if the server is running
app.get('/test', (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ AI Route using Anthropic API (Claude AI)
app.post('/ask-ai', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 🔥 Make request to Anthropic API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-2", // 🔥 Specify the AI model (e.g., "claude-2")
        max_tokens: 300, // 🔥 Define response length
        messages: [{ role: "user", content: prompt }] // 🔥 Correct JSON structure
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`, // ✅ Secure API Key
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.ANTHROPIC_API_KEY // ✅ Anthropic-specific header
        }
      }
    );

    // ✅ Send AI response to frontend
    res.json({ response: response.data.completion });
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// ✅ Handle 404 Errors
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

