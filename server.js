const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Wir lesen den API-Key aus einer Umgebungsvariable "OPENROUTER_API_KEY".
// Auf Render stellen wir die später ein.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Wenn JanitorAI einen POST an /proxy schickt, kommen wir hier rein:
app.post('/proxy', async (req, res) => {
  try {
    // Body, den JanitorAI schickt
    const clientBody = req.body;

    // Hier fügen wir die gewünschten "safety_settings" hinzu.
    // Du kannst beliebig anpassen, z. B. einzelne categories weglassen.
    const newBody = {
      ...clientBody, // Übernimmt alle Felder, die JanitorAI schon geschickt hat
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

    // Wir schicken den modifizierten Body an Openrouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      newBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`, // Auth mit unserem Key
        },
      }
    );

    // Anschließend schicken wir die Antwort 1:1 wieder zurück an JanitorAI
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
