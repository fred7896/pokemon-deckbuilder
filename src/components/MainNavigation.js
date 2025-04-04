import React from 'react';
import { Link } from 'react-router-dom';
import './MainNavigation.css';

const MainNavigation = () => {
  return (
    <nav className="main-nav">
      <ul>
        <li><Link to="/deck-builder">Deck Builder</Link></li>
        <li><Link to="/card-list">Liste des Cartes</Link></li>
        <li><Link to="/debug">Debug</Link></li>
        <li><Link to="/scoring">Rapport de Scoring</Link></li>
        <li><Link to="/meta">Analyse Méta</Link></li>
        <li><Link to="/weights">Éditeur de Pondérations</Link></li>
        <li><Link to="/simulator">Simulateur</Link></li>
      </ul>
    </nav>
  );
};

export default MainNavigation;
