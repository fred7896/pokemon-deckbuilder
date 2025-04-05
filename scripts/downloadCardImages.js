// scripts/downloadCardImages.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Chemin vers le JSON local
const cards = require('../public/data/fallbackCards.json');

const outputDir = path.join(__dirname, '../public/assets/images');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const downloadImage = async (id) => {
  const url = `https://static.dotgg.gg/pokepocket/card/${id}.webp`;
  const dest = path.join(outputDir, `${id}.webp`);
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      const stream = response.data.pipe(fs.createWriteStream(dest));
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    console.log(`✅ Image téléchargée : ${id}`);
  } catch (err) {
    console.warn(`❌ Échec pour ${id} : ${err.message}`);
  }
};

const uniqueIds = [...new Set(cards.map(c => c.id).filter(Boolean))];

(async () => {
  console.log(`Téléchargement de ${uniqueIds.length} images vers ${outputDir}`);
  for (const id of uniqueIds) {
    await downloadImage(id);
  }
})();
