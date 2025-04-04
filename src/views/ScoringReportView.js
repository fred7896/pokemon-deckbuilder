// src/views/ScoringReportView.js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { evaluateCard, getTalentScoreWithBreakdown } from '../components/DeckUtils';

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

  const uniqueByNameAndSet = [];
  const seen = new Set();

  for (const card of scoredCards) {
    if (card.set_code === "PROMO") continue;
    const key = `${card.name}-${card.set_code}`;
    if (!seen.has(key)) {
      uniqueByNameAndSet.push(card);
      seen.add(key);
    }
  }

  return (
    <div className="container">
      <h1>Rapport de Scoring</h1>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Score</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
        {uniqueByNameAndSet.map((card, index) => 
          (
            <React.Fragment key={index}>
                <tr>
                <td>{card.name}</td>
                <td>{card.set_name}</td>
                {/* <td>{card.id}</td> */}
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
                    <td colSpan="4">
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
