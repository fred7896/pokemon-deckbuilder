// src/components/CardDisplay.js
import React from 'react';
import './CardDisplay.css';

const CardDisplay = ({ card, count = 1, minimal = false }) => {
  return (
    <div className="card-container">
      <div className="card-wrapper">
        {count > 1 && <div className="badge">{count}</div>}
        <img
          src={`https://static.dotgg.gg/pokepocket/card/${card.id}.webp`}
          alt={card.name}
          className="card-image"
        />
        {!minimal && (
          <div className="tooltip">
            <p><strong>{card.name}</strong></p>
            <p>Score: {card.score?.toFixed(1)}</p>
            {card.type === 'Pokemon' ? (
              <>
                <p>HP: {card.hp} | Stage: {card.stage}</p>
                {card.prew_stage_name && <p>Évolue de: {card.prew_stage_name}</p>}
                {Array.isArray(card.attack) && card.attack.map((a, i) => (
                  <p key={i}>Attaque: {a.info} {a.effect}</p>
                ))}
                {Array.isArray(card.ability) && card.ability.length > 0 && (
                  <p>Talent: {card.ability.map(a => a.info).join(", ")}</p>
                )}
                <p>Faiblesse: {card.weakness} | Retraite: {card.retreat}</p>
              </>
            ) : (
              <p>{card.text}</p>
            )}
          </div>
        )}
      </div>
      {minimal && <p><strong>{card.name}</strong></p>}
    </div>
  );
};

export default CardDisplay;