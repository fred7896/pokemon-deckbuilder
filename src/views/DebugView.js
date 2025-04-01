import React from 'react';
import { useSelector } from 'react-redux';
import { generateOptimizedDeckModular } from '../logic/generateOptimizedDeckModular';

const DebugView = () => {
  const { allCards } = useSelector((state) => state.cards);
  const colors = Array.from(new Set(allCards.map(c => c.color).filter(Boolean)));

  const results = colors.map(color => {
    const { deck, debugLog } = generateOptimizedDeckModular(allCards, color);
    return { color, deck, debugLog };
  });

  return (
    <div className="container">
      <h1>🧩 Debug Deck Construction</h1>
      {results.map(({ color, debugLog, deck }, idx) => (
        <div key={idx} style={{ marginBottom: 40 }}>
          <h2>{color} Deck ({deck.length} cartes)</h2>
          <table border="1" cellPadding="4" cellSpacing="0">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Origine</th>
              </tr>
            </thead>
            <tbody>
              {debugLog.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.name}</td>
                  <td>{entry.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default DebugView;
