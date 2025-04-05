import React from 'react';
import { Link } from 'react-router-dom';
import './MainNavigation.css';

const MainNavigation = () => {
  return (
    <nav className="main-nav navigation">
      <ul>
        <li>
          <input type="checkbox" id="check"/><label htmlFor="check" id="check-label">Deck Builder</label>
          <ul className="sub">
            <li><Link to="/deck-builder">🏠 Hub</Link></li>
            <li><Link to="/deck-builder/manual">✍️ Manuel</Link></li>
            <li><Link to="/deck-builder/scoring">🔍 Scoring</Link></li>
            <li><Link to="/deck-builder/auto">⚙️ Automatique</Link></li>
          </ul>
        </li>
        <li><Link to="/card-list">Liste des Cartes</Link></li>
        {/* <li><Link to="/debug">Debug</Link></li> */}
        <li><Link to="/scoring">Rapport de Scoring</Link></li>
        <li><Link to="/meta">Analyse Méta</Link></li>
        <li><Link to="/weights">Pondérations</Link></li>
        <li><Link to="/simulator">Simulateur</Link></li>
      </ul>
    </nav>
  );
};

export default MainNavigation;


