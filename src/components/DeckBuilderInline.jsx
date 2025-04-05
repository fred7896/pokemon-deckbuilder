// components/DeckBuilderInline.jsx
import React, { useState, useEffect } from 'react';
import { getValidPokemonCards } from '../data/fallbackPool';

const DeckBuilderInline = ({ onDeckBuilt }) => {
  const [allCards, setAllCards] = useState([]);
  const [query, setQuery] = useState('');
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    setAllCards(getValidPokemonCards());
  }, []);

  const handleAddCard = (card) => {
    const count = deck.filter(c => c.name === card.name).length;
    if (deck.length >= 20 || count >= 2) return;
    setDeck([...deck, card]);
  };

  const handleRemoveCard = (name) => {
    const index = deck.findIndex(c => c.name === name);
    if (index !== -1) {
      const newDeck = [...deck];
      newDeck.splice(index, 1);
      setDeck(newDeck);
    }
  };

  const filteredCards = allCards.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3>🔧 Créer un deck personnalisé (20 cartes max)</h3>
      <input
        type="text"
        placeholder="Rechercher une carte..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: '0.5rem' }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
        {filteredCards.map((card, idx) => (
          <button key={idx} onClick={() => handleAddCard(card)}>
            ➕ {card.name} ({card.hp}pv)
          </button>
        ))}
      </div>

      <h4>Deck en construction ({deck.length}/20)</h4>
      <ul>
        {deck.map((card, idx) => (
          <li key={idx}>
            {card.name} ({card.hp}pv) <button onClick={() => handleRemoveCard(card.name)}>❌</button>
          </li>
        ))}
      </ul>

      <button disabled={deck.length !== 20} onClick={() => onDeckBuilt(deck)}>✅ Valider ce deck</button>
    </div>
  );
};

export default DeckBuilderInline;
