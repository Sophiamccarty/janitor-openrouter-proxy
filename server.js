/*************************************************
 * server.js - Beispiel mit Node/Express + Axios + CORS
 *************************************************/
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Erzeuge eine Express-App
const app = express();

// 1) CORS erlauben (wichtig für Browser-Anfragen)
app.use(cors());

// 2) JSON mit erhöhtem Limit parsen, z. B. 5MB
//    So verhinderst du den 413 "Payload Too Large" Fehler.
app.use(express.json({ limit: '100mb' }));

// Lies den Openrouter-API-Key aus der Umgebung.
// Setze in Render -> Environment -> OPENROUTER_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Deine Proxy-Route. Hier simulieren wir z. B. OpenAI-Style /v1/chat/completions
app.post('/v1/chat/completions', async (req, res) => {
  try {
    // Log: sieh nach, was vom Client (z. B. Janitor) geschickt wird
    console.log("== Neue Anfrage von Janitor? ==");
    console.log("Request Body:", JSON.stringify(req.body));

    // Body übernehmen, den Janitor schickt
    const clientBody = req.body;

    // Du fügst hier die safety_settings hinzu
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

    // Leite es an Openrouter weiter:
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions', // Ziel
      newBody,                                        // Body
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
      }
    );

    // Antwort von Openrouter an den Client zurückgeben
    console.log("== Openrouter-Antwort ==", response.data);
    return res.json(response.data);

  } catch (error) {
    // Fehlerbehandlung
    console.error("Error in Proxy:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.toString() || 'Fehler beim Proxy-Request',
    });
  }
});

// Starte den Express-Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy läuft auf Port ${PORT}`);
});
