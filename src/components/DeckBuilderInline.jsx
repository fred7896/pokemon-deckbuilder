import React, { useState, useEffect } from 'react';
import Pokemon from '../simulator/core/Pokemon';

const POKEMON_POOL = [
    { name: "Pikachu", hp: 60, attackCost: 1, attackDamage: 30, retreatCost: 1 },
    { name: "Salamèche", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 },
    { name: "Carapuce", hp: 70, attackCost: 2, attackDamage: 40, retreatCost: 1 },
    { name: "Bulbizarre", hp: 65, attackCost: 1, attackDamage: 25, retreatCost: 1 },
    { name: "Roucool", hp: 40, attackCost: 1, attackDamage: 10, retreatCost: 0 },
    { name: "Nosferapti", hp: 45, attackCost: 1, attackDamage: 15, retreatCost: 0 },
    { name: "Aspicot", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 },
    { name: "Ponyta", hp: 60, attackCost: 2, attackDamage: 35, retreatCost: 1 },
    { name: "Magicarpe", hp: 30, attackCost: 1, attackDamage: 5, retreatCost: 1 },
    { name: "Fantominus", hp: 40, attackCost: 1, attackDamage: 25, retreatCost: 0 },
  ];

export default function DeckBuilderInline({ onDeckBuilt }) {
  const [customDeck, setCustomDeck] = useState([]);
  const [errors, setErrors] = useState([]);

  const addToDeck = (cardData) => {
    if (customDeck.length >= 20) return;

    // Compter combien de fois cette carte est déjà présente
    const sameCardCount = customDeck.filter(card => card.name === cardData.name).length;
    if (sameCardCount >= 2) return;

    const newCard = new Pokemon(cardData);
    setCustomDeck([...customDeck, newCard]);
  };

  const clearDeck = () => {
    setCustomDeck([]);
  };

  const validateDeck = (deck) => {
    const messages = [];

    if (deck.length !== 20) {
      messages.push("Le deck doit contenir exactement 20 cartes.");
    }

    // Limite à 2 cartes identiques
    const nameCounts = deck.reduce((acc, card) => {
      acc[card.name] = (acc[card.name] || 0) + 1;
      return acc;
    }, {});
    Object.entries(nameCounts).forEach(([name, count]) => {
      if (count > 2) {
        messages.push(`Vous ne pouvez pas avoir plus de 2 exemplaires de ${name}.`);
      }
    });

    // Minimum 1 Pokémon
    const hasPokemon = deck.some(card => card instanceof Pokemon);
    if (!hasPokemon) {
      messages.push("Le deck doit contenir au moins un Pokémon.");
    }

    return messages;
  };

  useEffect(() => {
    setErrors(validateDeck(customDeck));
  }, [customDeck]);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2>Construire un Deck Personnalisé</h2>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {POKEMON_POOL.map((poke, idx) => {
          const count = customDeck.filter(c => c.name === poke.name).length;
          const disabled = customDeck.length >= 20 || count >= 2;
          return (
            <button key={idx} onClick={() => addToDeck(poke)} disabled={disabled}>
              Ajouter {poke.name} {count >= 2 ? "(max)" : ""}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>{customDeck.length} / 20 cartes</strong>
      </div>

      <div style={{ marginBottom: '1rem', maxHeight: '100px', overflowY: 'auto' }}>
        {customDeck.map((p, i) => (
          <div key={i}>{p.name} - {p.attackDamage} dégâts / {p.hp} PV</div>
        ))}
      </div>

      {errors.length > 0 && (
        <div style={{ color: 'red', marginBottom: '0.5rem' }}>
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      <button
        onClick={() => onDeckBuilt(customDeck)}
        disabled={errors.length > 0}
      >
        Enregistrer le deck
      </button>
      <button onClick={clearDeck} style={{ marginLeft: '1rem' }}>
        Vider
      </button>
    </div>
  );
}
