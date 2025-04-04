// core/Battle.js
import Player from "./Player";
import { log } from "../utils/logger";

export default class Battle {
  constructor(deck1, deck2, name1 = "Joueur 1", name2 = "Joueur 2") {
    this.player1 = new Player(name1, deck1);
    this.player2 = new Player(name2, deck2);
    this.logs = [];

    // Toss (pile/face)
    this.firstPlayer = Math.random() < 0.5 ? this.player1 : this.player2;
    this.secondPlayer = this.firstPlayer === this.player1 ? this.player2 : this.player1;

    // Contrôle humain/bot
    this.controlledPlayers = {
      [this.player1.name]: "human",
      [this.player2.name]: "bot"
    };

    // Phase de jeu
    this.phase = "setup"; // setup | combat
    this.turn = 0; // 0 = premier tour
  }

  log(message) {
    this.logs.push(message);
    log(message);
  }

  setupInitialState() {
    this.player1.hand = this.player1.deck.splice(0, 5);
    this.player2.hand = this.player2.deck.splice(0, 5);
    this.player1.bench = [];
    this.player2.bench = [];
    this.player1.active = null;
    this.player2.active = null;

    this.log(`🎲 Toss lancé : ${this.firstPlayer.name} commence !`);
    this.log(`${this.firstPlayer.name} et ${this.secondPlayer.name} piochent 5 cartes.`);
  }

  startCombatPhase() {
    if (!this.player1.active || !this.player2.active) {
      throw new Error("Chaque joueur doit avoir un Pokémon actif avant de commencer le combat.");
    }
    this.phase = "combat";
    this.log(`⚔️ Le combat commence ! ${this.getCurrentPlayer().name} joue en premier.`);
    this.playTurnStart();
  }

  getCurrentPlayer() {
    return this.turn % 2 === 0 ? this.firstPlayer : this.secondPlayer;
  }

  getOpponent() {
    return this.turn % 2 === 0 ? this.secondPlayer : this.firstPlayer;
  }

  isFirstTurn() {
    return this.turn === 0;
  }

  playTurnStart() {
    const player = this.getCurrentPlayer();
    if (this.isFirstTurn()) {
      player.drawCard();
      this.log(`${player.name} pioche une carte (Tour 1, pas d'énergie).`);
    } else {
      player.gainEnergy();
      player.drawCard();
      this.log(`${player.name} pioche une carte et gagne 1 énergie.`);
    }
  }

  endTurn(trigger = "Fin du tour") {
    this.log(`🔚 Fin du tour ${this.turn + 1} - ${this.getCurrentPlayer().name} (${trigger})`);
    this.turn++;
    this.playTurnStart();
  }

  simulateBotTurn() {
    const player = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    // Joue un Pokémon sur le banc si possible
    for (let i = player.hand.length - 1; i >= 0; i--) {
      if (player.bench.length < 3) {
        const card = player.hand[i];
        player.bench.push(card);
        player.hand.splice(i, 1);
        this.log(`${player.name} pose ${card.name} sur le banc.`);
      }
    }

    // Attache une énergie à l'actif
    player.attachEnergyToActive();

    // Attaque si possible
    if (player.active && player.active.canAttack()) {
      player.active.attack(opponent.active, { log: this.log.bind(this) });

      if (opponent.active.isKnockedOut()) {
        this.log(`${opponent.active.name} est mis K.O !`);
        player.points++;
        opponent.discard.push(opponent.active);
        opponent.replaceActive();
      }

      // Fin automatique si le bot attaque
      this.endTurn("Attaque bot");
    } else {
      this.endTurn("Fin auto bot");
    }
  }
}
