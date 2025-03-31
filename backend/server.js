const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require('fs');

const app = express();
const PORT = 5000;

// Autoriser toutes les origines (ou restreindre si besoin)
app.use(cors());

app.get("/api/cards", async (req, res) => {
  try {
    const apiUrl = "https://api.dotgg.gg/cgfw/getcards?game=pokepocket&mode=indexed&cache=992";
    const response = await fetch(apiUrl);
    const rawData = await response.json();

    const columnNames = rawData.names;
    const rawCards = rawData.data;

    const formattedCards = rawCards.map((cardArray) => {
      let cardObject = {};
      columnNames.forEach((key, index) => {
        cardObject[key] = cardArray[index];
      });
      return cardObject;
    });

    res.json(formattedCards);
  } catch (err) {
    console.error("Erreur proxy :", err);
    res.status(500).json({ error: "Erreur côté serveur proxy" });
  }
});

app.get("/api/save-json", async (req, res) => {
  try {
    const apiUrl = "https://api.dotgg.gg/cgfw/getcards?game=pokepocket&mode=indexed&cache=992";
    const response = await fetch(apiUrl);
    const rawData = await response.json();

    const columnNames = rawData.names;
    const rawCards = rawData.data;

    const formattedCards = rawCards.map((cardArray) => {
      let cardObject = {};
      columnNames.forEach((key, index) => {
        cardObject[key] = cardArray[index];
      });
      return cardObject;
    });

    fs.writeFileSync("./public/data/fallbackCards.json", JSON.stringify(formattedCards, null, 2));
    res.send("✔️ fallbackCards.json sauvegardé.");
  } catch (err) {
    console.error("Erreur de génération JSON :", err);
    res.status(500).send("Erreur de sauvegarde JSON");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur proxy prêt sur http://localhost:${PORT}`);
});
