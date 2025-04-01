// src/views/ScoringReportView.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { evaluateCard, getTalentScoreWithBreakdown } from '../components/DeckUtils';
import { Link } from 'react-router-dom';

const ScoringReportView = () => {
  const { allCards } = useSelector((state) => state.cards);
  const [openDetailIndex, setOpenDetailIndex] = useState(null);

  const scoredCards = allCards
  .filter(c => c.type === 'Pokemon')
  .map((card) => {
    const { score, detail } = evaluateCard(card);
    const { total, breakdown } = getTalentScoreWithBreakdown(card);
    return { ...card, score, detail, talentScore: total, breakdown };
  })
  .sort((a, b) => b.score - a.score);

  return (
    <div className="container">
      <h1>Rapport de Scoring</h1>
      <div className="actions">
        <Link className="btn" to="/">Retour</Link>
        <Link className="btn" to="/meta">Meta</Link>
        <Link className="btn" to="/weights">⚖️ Éditeur de Poids</Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Score</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
        {scoredCards.map((card, index) => (
            <React.Fragment key={index}>
                <tr>
                <td>{card.name}</td>
                <td>{card.score.toFixed(1)}</td>
                <td>
                    <button
                    onClick={() =>
                        setOpenDetailIndex(openDetailIndex === index ? null : index)
                    }
                    >
                    {openDetailIndex === index ? 'Masquer' : 'Voir détail'}
                    </button>
                </td>
                </tr>

                {openDetailIndex === index && (
                <tr>
                    <td colSpan="3">
                    <div style={{ padding: '0.5em 1em', backgroundColor: '#f9f9f9' }}>
                        <h4>⚔️ Score global</h4>
                        <ul>
                        {card.detail.map((entry, i) => (
                            <li
                            key={i}
                            style={{ color: entry.value < 0 ? 'darkred' : 'green' }}
                            >
                            {entry.label}: <strong>{entry.value > 0 ? '+' : ''}{entry.value}</strong>
                            </li>
                        ))}
                        </ul>
                        <h4>🧠 Score talent</h4>
                        <ul>
                        {card.breakdown.map((entry, i) => (
                            <li
                            key={i}
                            style={{ color: entry.value < 0 ? 'darkred' : 'green' }}
                            >
                            {entry.label}: <strong>{entry.value > 0 ? '+' : ''}{entry.value}</strong>
                            </li>
                        ))}
                        </ul>
                    </div>
                    </td>
                </tr>
                )}
            </React.Fragment>
            ))}

        </tbody>
      </table>
    </div>
  );
};

export default ScoringReportView;
