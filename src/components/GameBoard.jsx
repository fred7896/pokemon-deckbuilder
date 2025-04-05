import React from 'react';

const energyIcons = {
  G: '🌿', F: '🥊', W: '💧', L: '⚡', P: '🧠', D: '🌑', M: '🛡️', R: '🔥'
};

const GameBoard = ({ state, showEnergyAndHP = false, turn }) => {
  const renderPokemon = (pokemon) => {
    // console.log(pokemon);
    if (!pokemon) return <div style={{ fontStyle: 'italic' }}>Aucun</div>;
    // console.log(pokemon);
    //console.log(pokemon.attacks);
    return (
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        backgroundColor: '#f0f0f0'
      }}>
        <strong>{pokemon.name}</strong>
        {showEnergyAndHP && (
          <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            ❤️ PV : {pokemon.hp} | 🔋 Énergies : {pokemon && pokemon.attachedEnergy.map((e, i) => <span key={i}>{energyIcons[e] || e}</span>)}
          </div>
        )}
        <div style={{ fontSize: '0.9rem' }}>
          {pokemon.attacks && pokemon.attacks.length > 0 ? pokemon.attacks.map((attack, i) => (
            <div key={i}>
              <strong>{attack.name}</strong> : {attack.damage} dégâts
              <br />
              Coût : {Object.entries(attack.cost).map(([type, count]) =>
                [...Array(count)].map((_, i) => (
                  <span key={`${type}-${i}`}>{energyIcons[type] || type}</span>
                ))
              )}
            </div> 
          )) : (
            <div style={{ fontStyle: 'italic' }}>Aucune attaque</div>)
          }
          Coût de retraite : {pokemon.retreatCost}
        </div>
      </div>
    );
  };

  const checkVictory = (player1, player2) => {
    if (player1.points >= 3 || (player2.active === null && player2.bench.length === 0)) {
      return player1.name;
    }
    if (player2.points >= 3 || (player1.active === null && player1.bench.length === 0)) {
      return player2.name;
    }
    return null;
  };

  const winner = state.phase === 'combat' ? checkVictory(state.player1, state.player2) : null;
  // console.log(turn);

  const renderEnergyPreview = (player) => {
    const current = player.energyPool?.getCurrent?.();
    const next = player.energyPool?.getNext?.();
    return (
      <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        <div>Énergie en cours : {current ? energyIcons[current] : '—'}</div>
        <div>Prochaine énergie : {next ? energyIcons[next] : '—'}</div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {winner && (
        <div style={{ backgroundColor: '#dff0d8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h2>🎉 Victoire de {winner} !</h2>
        </div>
      )}
      <div>
        Tour {turn + 1} | Phase : {state.phase === 'combat' ? 'Combat' : 'Préparation'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        {[state.player1, state.player2].map((player, idx) => (
          <div key={idx} style={{ width: '45%' }}>
            <h3>{player.name} — 🏆 {player.points} point(s)</h3>
            {renderEnergyPreview(player)}
            <div>
              <strong>Actif :</strong>
              {renderPokemon(player.active)}
            </div>
            <div>
              <strong>Banc :</strong>
              {player.bench.length > 0 ? (
                player.bench.map((p, i) => <div key={i}>{renderPokemon(p)}</div>)
              ) : (
                <div style={{ fontStyle: 'italic' }}>Aucun Pokémon sur le banc</div>
              )}
            </div>
            <div>
              <strong>Main :</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>{player.hand.map((card, i) => (
                <span key={i} style={{ marginRight: '0.5rem' }}>{card.name}</span>
              ))}</div>
            </div>
            <div>
              <strong>Défausse :</strong>
              <div>{player.discard.length > 0 ? player.discard.map((card, i) => (
                <span key={i} style={{ marginRight: '0.5rem' }}>{card.name}</span>
              )) : <span style={{ fontStyle: 'italic' }}>Vide</span>}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;

