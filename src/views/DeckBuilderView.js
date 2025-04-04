// src/views/DeckBuilderView.js
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { generateOptimizedDeckModular } from '../logic/generateOptimizedDeckModular';
import CardDisplay from '../components/CardDisplay';

const DeckBuilderView = () => {
  const { allCards } = useSelector((state) => state.cards);
  const [selectedColor, setSelectedColor] = useState('');
  const [deckResult, setDeckResult] = useState({ deck: [], stats: {} });
  const [hand, setHand] = useState([]);
  const [exportText, setExportText] = useState('');

  useEffect(() => {
    if (allCards.length) {
      const result = generateOptimizedDeckModular(allCards, selectedColor || null);
      setDeckResult(result);

    }
  }, [allCards, selectedColor]);

  const generateHand = () => {
    const isValidHand = (hand) =>
      hand.some(card => card.type === 'Pokemon' && card.stage === 'Basic');
  
    let hand = [];
    let attempts = 0;
    do {
      const shuffled = [...deckResult.deck].sort(() => 0.5 - Math.random());
      hand = shuffled.slice(0, 5);
      attempts++;
    } while (!isValidHand(hand) && attempts < 100);
  
    setHand(hand);
  };
  

  const exportDeck = () => {
    const countMap = {};
    deckResult.deck.forEach((card) => {
      countMap[card.name] = (countMap[card.name] || 0) + 1;
    });
    const lines = Object.entries(countMap).map(([name, count]) => `${count}x ${name}`);
    setExportText(lines.join('\n'));
  };

  const colorOptions = Array.from(new Set(allCards.map(c => c.color).filter(Boolean)));
  const pokemon = deckResult.deck.filter(c => c.type === 'Pokemon');
  const trainers = deckResult.deck.filter(c => c.type !== 'Pokemon');
  // console.log(JSON.stringify(deckResult.stats));
  return (
    
    <div className="container">
      <h1>Deck Builder</h1>

      <div className="deck-selector">
        <label>Filtrer par couleur :</label>
        <select onChange={(e) => setSelectedColor(e.target.value || '')} value={selectedColor}>
          <option value="">Toutes</option>
          {colorOptions.map((color, i) => (
            <option key={i} value={color}>{color}</option>
          ))}
        </select>
      </div>

      <div className="deck-characteristics">
        <h4>Caractéristiques du deck</h4>
        <ul>
          <li>Moyenne HP : {deckResult.stats.avgHP?.toFixed(1)}</li>
          <li>Moyenne Retraite : {deckResult.stats.avgRetreat?.toFixed(1)}</li>
          <li>Tank présent : {deckResult.stats.potentialTank ? 'Oui' : 'Non'}</li>
          <li>Besoin de Leaf : {deckResult.stats.needsLeaf ? 'Oui' : 'Non'}</li>
          <li>Palier 1 faible : {deckResult.stats.lowDamagePalier1 ? 'Oui' : 'Non'}</li>
          <li>
            Score total des Pokémon :
            {
              deckResult.deck
                .filter(c => c.type === 'Pokemon')
                .reduce((sum, c) => sum + (parseFloat(c.score) || 0), 0)
                .toFixed(0)
            }
          </li>
        </ul>
      </div>

      <h2>Pokemons</h2>
      <div className="grid">
        {pokemon.map((card, index) => (
          <CardDisplay key={index} card={card} count={1} />
        ))}
      </div>

      <h2>Trainers</h2>
      <div className="grid">
        {trainers.map((card, index) => (
          <CardDisplay key={index} card={card} count={1} />
        ))}
      </div>

      <div className="actions">
        <button onClick={generateHand}>Simuler une main</button>
        <button onClick={exportDeck}>Exporter le deck</button>
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
    </div>
  );
};

export default DeckBuilderView;

