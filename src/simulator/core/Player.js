import EnergyPool from './EnergyPool';

export default class Player {
    constructor(name, deck) {
      this.name = name;
      this.deck = [...deck];
      this.hand = [];
      this.active = null;
      this.bench = [];
      this.discard = [];
      this.allowedEnergyTypes = this._extractEnergyTypesFromDeck();
      this.energyPool = new EnergyPool(this.allowedEnergyTypes);
      this.points = 0;
    }

    drawCard() {
      if (this.deck.length > 0) {
        this.hand.push(this.deck.shift());
      }
    }

    _extractEnergyTypesFromDeck() {
      const types = new Set();
      for (const card of this.deck) {
        if (!card.attacks) continue;
        for (const attack of card.attacks) {
          if (attack.cost) {
            for (const t in attack.cost) {
              if (t !== 'C') types.add(t);
            }
          }
        }
      }
      return [...types];
    }
  

    prepareEnergy() {
      this.energyPool.consumeCurrent();
    }
  

    attachEnergyTo(pokemon) {
      if (!this.energyPool.current) return false;
      pokemon.attachedEnergy.push(this.energyPool.current);
      this.energyPool.current = null;
      return true;
    }


    autoAttachEnergy() {
      const current = this.energyPool.current;
      console.log("Énergie courante : ", current);
      if (!current) return false;
  
      const allTargets = [this.active, ...this.bench].filter(Boolean);
      console.log("allTargets : ", allTargets);
      const compatibleTargets = allTargets.filter(p =>
        p.attacks.some(a => Object.keys(a.cost).includes(current))
      );
      console.log("Cibles compatibles : ", compatibleTargets);
      // Priorité 1 : le Pokémon actif si valide et pas déjà full
      console.log("Cible active : ", this.active);
      console.log(compatibleTargets.includes(this.active));
      if (compatibleTargets.includes(this.active)) {
        const active = this.active;
        const strongest = active.attacks.reduce((prev, curr) =>
          Object.values(curr.cost).reduce((a, b) => a + b, 0) >
          Object.values(prev.cost).reduce((a, b) => a + b, 0)
            ? curr
            : prev
        );
        console.log("Attaque la plus forte : ", strongest);
        console.log("Énergie attachée : ", active.attachedEnergy.length);
  
        const required = Object.values(strongest.cost).reduce((a, b) => a + b, 0);
        console.log("requis : ", required);
        if (active.attachedEnergy.length < required) {
          return this.attachEnergyTo(active);
        }
      }
  
      // Priorité 2 : Pokémon de banc avec le moins d'énergie manquante
      const ranked = compatibleTargets
        .filter(p => p !== this.active)
        .map(p => {
          const bestAttack = p.attacks.find(a => Object.keys(a.cost).includes(current)) || p.attacks[0];
          const totalNeeded = Object.values(bestAttack.cost).reduce((a, b) => a + b, 0);
          const need = totalNeeded - (p.attachedEnergy.length || 0);
          return { p, need };
        })
        .sort((a, b) => a.need - b.need);
  
      if (ranked.length > 0) {
        return this.attachEnergyTo(ranked[0].p);
      }
  
      // Priorité 3 : on attache au premier Pokémon dispo
      if (allTargets.length > 0) {
        return this.attachEnergyTo(allTargets[0]);
      }
  
      return false;
    }

    replaceActive() {
      if (this.bench.length > 0) {
        this.active = this.bench.shift();
      } else {
        this.active = null;
      }
    }

    retreatActive(newActive) {
      if (!this.active || !this.active.canRetreat()) {
        console.log("Pas assez d'énergie pour se retirer !");
        return false;
      }
  
      if (!this.active.payRetreatCost()) {
        console.log("Échec du paiement du coût de retraite.");
        return false;
      }
  
      // Retirer le nouveau actif du banc
      const index = this.bench.indexOf(newActive);
      if (index === -1) {
        console.log("Le Pokémon sélectionné n'est pas sur le banc.");
        return false;
      }
      this.bench.splice(index, 1);
  
      // Déplacer l'ancien actif sur le banc
      this.bench.unshift(this.active);
  
      // Mettre le nouveau actif en jeu
      this.active = newActive;
  
      return true;
    }
  
    hasLost() {
      return this.active === null;
    }

  }
  