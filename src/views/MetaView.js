// src/views/MetaView.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { generateOptimizedDeck, analyzeMeta } from '../components/DeckUtils';

const MetaView = () => {
  const { allCards } = useSelector((state) => state.cards);

  const allColors = Array.from(
    new Set(allCards.filter(c => c.color && c.color !== 'Colorless').map(c => c.color))
  );

  const exampleDecks = allColors.map(color => generateOptimizedDeck(allCards, color));

  const topCards = analyzeMeta(exampleDecks);

  return (
    <div className="container">
      <h1>Analyse Méta</h1>
      <div className="actions">
        <Link className="btn" to="/">Retour</Link>
      </div>
      
      <h2>Top cartes utilisées</h2>
      <ul>
        {topCards.slice(0, 20).map(([name, count], index) => (
          <li key={index}><strong>{name}</strong> - {count} occurrences</li>
        ))}
      </ul>
    </div>
  );
};

export default MetaView;
