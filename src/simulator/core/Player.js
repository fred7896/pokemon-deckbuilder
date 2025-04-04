export default class Player {
    constructor(name, deck) {
      this.name = name;
      this.deck = [...deck];
      this.hand = [];
      this.active = null;
      this.bench = [];
      this.discard = [];
      this.energyPool = 0;
      this.points = 0;
    }
  
    drawCard() {
      if (this.deck.length > 0) {
        this.hand.push(this.deck.shift());
      }
    }
  
    gainEnergy(skip = false) {
      if (skip) {
        return; // Pas d'énergie générée au T1 du premier joueur
      }
      this.energyPool += 1;
    }
  
    attachEnergyToActive() {
      if (!this.active || this.energyPool <= 0) return;
  
      const needed = Math.min(this.energyPool, this.active.attackCost - this.active.energyAttached);
      this.active.attachEnergy(needed);
      this.energyPool -= needed;
    }
  
    replaceActive() {
      if (this.bench.length > 0) {
        this.active = this.bench.shift();
      } else {
        this.active = null;
      }
    }

    retreatActive() {
      if (this.active && this.active.retreatCost <= this.energyPool) {
        this.bench.unshift(this.active);
        if(this.bench.length > 1) {
          this.active = this.bench[1];
        }
        this.energyPool -= this.active.retreatCost;
      } else {
        console.log("Pas assez d'énergie pour se retirer !");
      }
    }
  
    hasLost() {
      return this.active === null;
    }
  }
  