require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const site = require('./data/site.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Le numéro peut être surchargé depuis le fichier .env
if (process.env.WHATSAPP_NUMBER) {
  site.whatsapp.number = process.env.WHATSAPP_NUMBER.replace(/\D/g, '');
}

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: null,
      },
    },
  })
);
app.use(compression());

// Données du site (services, contact, message WhatsApp)
app.get('/api/site', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(site);
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

app.use((req, res) => {
  // Image, CSS ou script introuvable : vraie erreur 404 (sans page HTML)
  if (path.extname(req.path)) return res.sendStatus(404);
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ADS en ligne sur http://localhost:${PORT}`);
});
