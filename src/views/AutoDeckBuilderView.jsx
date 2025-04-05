// views/AutoDeckBuilderView.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateMonoEnergyDecks } from '../utils/deckGenerator';
import { setDeckAuto } from '../store/decksSlice';

const AutoDeckBuilderView = () => {
  const dispatch = useDispatch();
  const savedDeck = useSelector(state => state.decks.deckAuto);

  const handleGenerate = () => {
    const { deck1, type1 } = generateMonoEnergyDecks();
    dispatch(setDeckAuto(deck1));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>⚙️ Mode Auto : Génération d'un deck</h1>
      <button onClick={handleGenerate}>🎲 Générer un deck mono-énergie</button>

      {savedDeck && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Deck sauvegardé :</h3>
          <ul>
            {savedDeck.toArray().map((card, idx) => (
              <li key={idx}>{card.name} ({card.maxHp} PV)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AutoDeckBuilderView;
