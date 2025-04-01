// src/views/DeckBuilderView.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { generateOptimizedDeckModular } from '../logic/generateOptimizedDeckModular';
import CardDisplay from '../components/CardDisplay';

const DeckBuilderView = () => {
  const { allCards } = useSelector((state) => state.cards);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [hand, setHand] = useState([]);
  const [exportText, setExportText] = useState('');

  const deckResult = generateOptimizedDeckModular(allCards, selectedColor);
  const deck = deckResult.deck || [];
  const debugLog = deckResult.debugLog || [];

  const colors = Array.from(new Set(allCards.map(c => c.color).filter(Boolean))).sort();

  const generateHand = () => {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    setHand(shuffled.slice(0, 5));
  };

  const exportDeck = () => {
    const grouped = deck.reduce(
      (acc, card) => {
        const group = card.type === 'Pokemon' ? 'Pokémon' : 'Autres';
        if (!acc[group]) acc[group] = [];
        acc[group].push(card);
        return acc;
      },
      {}
    );

    let text = '';
    Object.entries(grouped).forEach(([group, cards]) => {
      text += `# ${group}\n`;
      const countMap = {};
      cards.forEach(c => {
        countMap[c.name] = (countMap[c.name] || 0) + 1;
      });
      Object.entries(countMap).forEach(([name, count]) => {
        text += `${count}x ${name}\n`;
      });
      text += '\n';
    });
    setExportText(text.trim());
  };

  return (
    <div className="container">
      <h1>🔧 Deck Builder</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrer par couleur : </label>
        <select onChange={(e) => setSelectedColor(e.target.value || null)}>
          <option value="">Toutes</option>
          {colors.map((color, i) => (
            <option key={i} value={color}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button onClick={generateHand}>🎴 Simuler une main</button>
      <button onClick={exportDeck} style={{ marginLeft: '1rem' }}>📤 Exporter le deck</button>

      <h2>Deck généré ({deck.length} cartes)</h2>

      <h3>Pokémon</h3>
      <div className="grid">
        {deck.filter(c => c.type === 'Pokemon').map((card, index) => (
          <CardDisplay key={index} card={card} count={1} />
        ))}
      </div>

      <h3>Trainers et autres</h3>
      <div className="grid">
        {deck.filter(c => c.type !== 'Pokemon').map((card, index) => (
          <CardDisplay key={index} card={card} count={1} />
        ))}
      </div>

      {hand.length > 0 && (
        <div>
          <h3>Main de départ (simulation)</h3>
          <div className="grid">
            {hand.map((card, index) => (
              <CardDisplay key={index} card={card} count={1} />
            ))}
          </div>
        </div>
      )}

      {exportText && (
        <div>
          <h3>Deck exporté</h3>
          <pre>{exportText}</pre>
        </div>
      )}

      <h3>🪪 Log de construction</h3>
      <table border="1" cellPadding="4" cellSpacing="0">
        <thead>
          <tr>
            <th>Carte</th>
            <th>Ajoutée par</th>
          </tr>
        </thead>
        <tbody>
          {debugLog.map((entry, i) => (
            <tr key={i}>
              <td>{entry.name}</td>
              <td>{entry.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeckBuilderView;
