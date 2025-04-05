import React from 'react';
import './Card.css';

const Card = ({ card, onClick, grayedOut = false, highlight = false }) => {
  if (!card?.id) return null;

  return (
    <div
      className={`card-container ${grayedOut ? 'grayscale' : ''} ${highlight ? 'highlight' : ''}`}
      onClick={onClick}
    >
      <img
        src={`/assets/images/${card.id}.webp`}
        alt={card.name}
        className="card-image"
      />
    </div>
  );
};

export default Card;
