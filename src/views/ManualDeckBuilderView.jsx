// views/ManualDeckBuilderView.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DeckBuilderInline from '../components/DeckBuilderInline';
import Pokemon from '../simulator/core/Pokemon';
import Deck from '../simulator/core/Deck';
import { setDeckManual } from '../store/decksSlice';

const ManualDeckBuilderView = () => {
  const dispatch = useDispatch();
  const savedDeck = useSelector(state => state.decks.deckManual);

  const handleDeckBuilt = (rawCards) => {
    const pokemons = rawCards.map(card => new Pokemon({
      name: card.name,
      hp: card.hp,
      attack_info: card.attack_info,
      retreat: card.retreat || '0'
    }));
    const builtDeck = new Deck(pokemons);
    dispatch(setDeckManual(builtDeck));
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>✍️ Mode Manuel : Créez votre deck</h1>
      <DeckBuilderInline onDeckBuilt={handleDeckBuilt} />

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

export default ManualDeckBuilderView;

