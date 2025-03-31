// src/views/DeckBuilderView.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CardDisplay from '../components/CardDisplay';
import { Link } from 'react-router-dom';
import {
  generateTopDecks,
  simulateOpeningHand,
  exportDeckToText
} from '../components/DeckUtils';

const DeckBuilderView = () => {
  const { allCards } = useSelector((state) => state.cards);
  const [topDecks, setTopDecks] = useState([]);
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [hand, setHand] = useState([]);
  const [exportText, setExportText] = useState("");

  const handleGenerateTopDecks = () => {
    const decks = generateTopDecks(allCards, 5);
    setTopDecks(decks);
    setSelectedDeckIndex(0);
    setHand([]);
    setExportText("");
  };

  const handleSimulateHand = () => {
    if (topDecks[selectedDeckIndex]) {
      setHand(simulateOpeningHand(topDecks[selectedDeckIndex].deck));
    }
  };

  const handleExport = () => {
    if (topDecks[selectedDeckIndex]) {
      setExportText(exportDeckToText(topDecks[selectedDeckIndex].deck));
    }
  };

  const colors = Array.from(new Set(allCards.map(c => c.color).filter(c => c && c !== 'Colorless')));

  const selectedDeck = topDecks[selectedDeckIndex]?.deck || [];
  const groupedDeck = selectedDeck.reduce((acc, card) => {
    acc[card.name] = acc[card.name]
      ? { ...acc[card.name], count: acc[card.name].count + 1 }
      : { ...card, count: 1 };
    return acc;
  }, {});

  const pokemonCards = Object.values(groupedDeck).filter((c) => c.type === 'Pokemon');
  const trainerCards = Object.values(groupedDeck).filter((c) => c.type !== 'Pokemon');

  return (
    <div className="container">
      <h1>Top Decks Optimisés</h1>

      <div className="actions">
        <Link className="btn" to="/">Retour</Link>
        <Link className="btn" to="/report">Rapport</Link>
      </div>

      <button className="btn" onClick={handleGenerateTopDecks}>Générer les meilleurs decks</button>

      {topDecks.length > 0 && (
        <>
          <div className="deck-selector">
            <label>Voir deck :</label>
            <select onChange={(e) => setSelectedDeckIndex(Number(e.target.value))}>
              {topDecks.map((d, i) => (
                <option key={i} value={i}>
                  #{i + 1} - {d.color} ({d.score} pts)
                </option>
              ))}
            </select>
          </div>

          <h2>Score du Deck : {topDecks[selectedDeckIndex]?.score}</h2>

          <div className="btn-group">
            <button className="btn" onClick={handleSimulateHand}>Main de départ</button>
            <button className="btn" onClick={handleExport}>Exporter</button>
          </div>

          <h2>Cartes Pokémon</h2>
          <div className="grid">
            {pokemonCards.map((card, index) => (
              <CardDisplay key={index} card={card} count={card.count} />
            ))}
          </div>

          <h2>Dresseurs & Autres</h2>
          <div className="grid">
            {trainerCards.map((card, index) => (
              <CardDisplay key={index} card={card} count={card.count} />
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
        </>
      )}
    </div>
  );
};

export default DeckBuilderView;