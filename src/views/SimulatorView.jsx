import React, { useState, useEffect } from 'react';
import Battle from '../simulator/core/Battle';
import { availableDecks } from '../simulator/data/sampleDecks';
import DeckBuilderInline from '../components/DeckBuilderInline';
import GameBoard from '../components/GameBoard';

const SimulatorView = () => {
  const [deck1Key, setDeck1Key] = useState("PikachuMix");
  const [deck2Key, setDeck2Key] = useState("Reversed");
  const [customDeck, setCustomDeck] = useState(null);
  const [logs, setLogs] = useState([]);
  const [battle, setBattle] = useState(null);
  const [setupDone, setSetupDone] = useState(false);
  const [gameState, setGameState] = useState(null);

  const getDeck = (key) => {
    if (key === 'custom') {
      return customDeck?.map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p)) || [];
    }
    return availableDecks[key].map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
  };

  const initializeBattle = () => {
    const deck1 = getDeck(deck1Key);
    const deck2 = getDeck(deck2Key);
    const newBattle = new Battle(deck1, deck2, `Joueur 1 (${deck1Key})`, `Joueur 2 (${deck2Key})`);
    newBattle.setupInitialState();

    [newBattle.player1, newBattle.player2].forEach(player => {
      if (newBattle.controlledPlayers[player.name] === 'bot') {
        if (player.hand.length === 0) {
          newBattle.log(`${player.name} ne peut pas jouer, main vide.`);
          return;
        }
        const possibleActives = player.hand.filter(card => card.name);
        if (possibleActives.length === 0) {
          newBattle.log(`${player.name} ne peut pas choisir de Pokémon actif valide.`);
          return;
        }
        player.active = player.hand.shift();
        newBattle.log(`${player.name} choisit ${player.active.name} comme Pokémon actif.`);
        while (player.hand.length > 0 && player.bench.length < 3) {
          const benchCard = player.hand.shift();
          player.bench.push(benchCard);
          newBattle.log(`${player.name} place ${benchCard.name} sur le banc.`);
        }
      }
    });

    setBattle(newBattle);
    setGameState({ player1: newBattle.player1, player2: newBattle.player2, phase: newBattle.phase });
    setLogs([...newBattle.logs]);
    setSetupDone(false);
  };

  const startSimulation = () => {
    if (!battle || !battle.player1.active || !battle.player2.active) {
      alert("Chaque joueur doit placer un Pokémon actif.");
      return;
    }
    battle.startCombatPhase();
    setLogs([...battle.logs]);
    setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
    setSetupDone(true);

    const current = battle.getCurrentPlayer();
    if (battle.controlledPlayers[current.name] === 'bot') {
      battle.simulateBotTurn();
      setLogs([...battle.logs]);
      setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
    }
  };

  const placePokemon = (player, cardIndex) => {
    const card = player.hand[cardIndex];
    if (!player.active) {
      player.active = card;
    } else if (player.bench.length < 3 && !player.bench.includes(card)) {
      player.bench.push(card);
    }
    player.hand.splice(cardIndex, 1);
    setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
  };

  const handleHumanTurnEnd = () => {
    if (battle) {
      battle.endTurn("Fin joueur humain");
      setLogs([...battle.logs]);
      setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });

      const current = battle.getCurrentPlayer();
      if (battle.controlledPlayers[current.name] === 'bot') {
        battle.simulateBotTurn();
        setLogs([...battle.logs]);
        setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
      }
    }
  };

  const handleAttack = () => {
    const player = battle.getCurrentPlayer();
    const opponent = battle.getOpponent();
    if (player.active && player.active.canAttack()) {
      player.active.attack(opponent.active, { log: battle.log.bind(battle) });
      if (opponent.active.isKnockedOut()) {
        battle.log(`${opponent.active.name} est mis K.O !`);
        player.points++;
        opponent.discard.push(opponent.active);
        opponent.replaceActive();
      }
      battle.endTurn("Attaque joueur humain et fin de tour");
      setLogs([...battle.logs]);
      setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });

      const current = battle.getCurrentPlayer();
      if (battle.controlledPlayers[current.name] === 'bot') {
        battle.simulateBotTurn();
        setLogs([...battle.logs]);
        setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
      }
    }
  };

  const handlePlaceFromHand = () => {
    const player = battle.getCurrentPlayer();
    const benchable = player.hand.find(card => card.name);
    if (benchable && player.bench.length < 3) {
      player.bench.push(benchable);
      player.hand = player.hand.filter(c => c !== benchable);
      battle.log(`${player.name} place ${benchable.name} sur le banc.`);
      setLogs([...battle.logs]);
      setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
    }
  };

  const handleAttachEnergy = () => {
    const player = battle.getCurrentPlayer();
    if (player.energyPool > 0 && player.active) {
      player.attachEnergyToActive();
      battle.log(`${player.name} attache 1 énergie à ${player.active.name}.`);
      setLogs([...battle.logs]);
      setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
    }
  };

  const handleRetreat = () => {
    const player = battle.getCurrentPlayer();
    if (player.active && player.active.retreatCost <= player.energyPool) {
        player.retreatActive();
        battle.log(`${player.name} retire ${player.active.name} du poste Actif.`);
        setLogs([...battle.logs]);
        setGameState({ player1: battle.player1, player2: battle.player2, phase: battle.phase });
    }
  }

  const currentPlayer = battle?.getCurrentPlayer();
  const isVictory = gameState?.phase === 'combat' && (gameState.player1.points >= 3 || gameState.player2.points >= 3 ||
    (gameState.player1.active === null && gameState.player1.bench.length === 0) ||
    (gameState.player2.active === null && gameState.player2.bench.length === 0));

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Simulateur de Combat</h1>

      <DeckBuilderInline onDeckBuilt={setCustomDeck} />

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
        <div>
          <label>Deck Joueur 1 :</label>
          <select value={deck1Key} onChange={(e) => setDeck1Key(e.target.value)}>
            <option value="custom">Deck personnalisé</option>
            {Object.keys(availableDecks).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Deck Joueur 2 :</label>
          <select value={deck2Key} onChange={(e) => setDeck2Key(e.target.value)}>
            <option value="custom">Deck personnalisé</option>
            {Object.keys(availableDecks).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        <button onClick={initializeBattle}>🔄 Nouvelle partie</button>
        <button onClick={startSimulation} disabled={setupDone || !battle}>🚀 Commencer la partie</button>
      </div>

      {battle && setupDone && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>🎮 Tour actuel : {currentPlayer?.name}</strong>
        </div>
      )}

      {battle && setupDone && battle.controlledPlayers[currentPlayer.name] === 'human' && !isVictory && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Actions du joueur humain</h3>
          <button onClick={handleRetreat} style={{ marginRight: '1rem' }}>🔄 Retraite du pokemon Actif</button>
          <button onClick={handlePlaceFromHand} style={{ marginRight: '1rem' }}>📥 Placer un Pokémon</button>
          <button onClick={handleAttachEnergy} style={{ marginRight: '1rem' }}>🔋 Attacher une énergie</button>
          <button onClick={handleAttack} style={{ marginRight: '1rem' }}>⚔️ Attaquer</button>
          <button onClick={handleHumanTurnEnd}>🔚 Fin du tour</button>
        </div>
      )}

      {battle && !setupDone && (
        <div>
          <h3>Configuration initiale</h3>
          <p>Placez un Pokémon actif et jusqu'à 3 Pokémon de base sur le banc pour chaque joueur.</p>
          {[battle.player1, battle.player2].map((player, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <h4>{player.name}</h4>
              {battle.controlledPlayers[player.name] === 'human' ? (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Main : </strong>
                  {player.hand.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => placePokemon(player, i)}
                      style={{
                        marginRight: '0.5rem',
                        backgroundColor: '#eee',
                        border: '1px solid #ccc',
                        padding: '0.4rem',
                      }}
                    >
                      {card.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p>(Bot a choisi son actif et son banc automatiquement)</p>
              )}
              <div><strong>Actif : </strong>{player.active?.name || "Aucun"}</div>
              <div><strong>Banc : </strong>{player.bench.map(p => p.name).join(", ") || "Aucun"}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ whiteSpace: 'pre-line', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        {logs.length === 0 ? (
          <p>Sélectionnez deux decks puis cliquez sur "Commencer la partie".</p>
        ) : (
          logs.map((log, idx) => <div key={idx}>{log}</div>)
        )}
      </div>

      {gameState && (
        <div style={{ marginTop: '2rem' }}>
          <h2>État du jeu</h2>
          <GameBoard state={gameState} showEnergyAndHP={true} turn={battle.turn} />
        </div>
      )}
    </div>
  );
};

export default SimulatorView;