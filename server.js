const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// WICHTIG: CORS noch *vor* allen Routen aktivieren
app.use(cors());
app.use(express.json());

// Openrouter API-Key aus Env-Var lesen (in Render.com hinterlegt)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Routen-Endpunkt --> /v1/chat/completions
// Damit JanitorAI denkt, sie spricht mit "OpenAI-Style" Endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const clientBody = req.body;

    // safety_settings hinzufügen
    const newBody = {
      ...clientBody,
      safety_settings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    // An Openrouter schicken
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      newBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
      }
    );

    // Openrouter-Antwort zurück an den Client
    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.toString() || 'Fehler beim Proxy-Request',
    });
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
