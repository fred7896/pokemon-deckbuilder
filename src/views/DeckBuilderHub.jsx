// views/DeckBuilderHub.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const DeckBuilderHub = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>🎴 Choisissez un mode de création de deck</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '1rem' }}>
          <Link to="/deck-builder/scoring">🔍 Mode Scoring</Link>
          <p style={{ fontSize: '0.9rem' }}>Générez un deck selon un système de score basé sur les critères que vous définissez.</p>
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <Link to="/deck-builder/manual">✍️ Mode Manuel</Link>
          <p style={{ fontSize: '0.9rem' }}>Choisissez manuellement 20 cartes à partir de toutes les cartes valides.</p>
        </li>
        <li>
          <Link to="/deck-builder/auto">⚙️ Mode Auto (Expérimental)</Link>
          <p style={{ fontSize: '0.9rem' }}>Laissez l’application générer un deck automatiquement via simulation ou apprentissage.</p>
        </li>
      </ul>
    </div>
  );
};

export default DeckBuilderHub;
