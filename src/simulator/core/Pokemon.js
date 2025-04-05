// simulator/core/Pokemon.js
import { countEnergySymbols } from '../../components/DeckUtils.js';

export default class Pokemon {
  constructor({ name, hp, attack_info, retreat}) {
    this.name = name;
    this.maxHp = parseInt(hp);
    this.hp = this.maxHp;
    this.attachedEnergy = [];
    this.retreatCost = parseInt(retreat || "0");

    let damageMatch = null;
    let energyMatch = null;
    if (typeof attack_info === 'string') {
      damageMatch = attack_info.match(/(\d+)/);
      energyMatch = attack_info.match(/{[A-Z]+}/g);
    }

    if (damageMatch && energyMatch) {
      let energyProfile = countEnergySymbols(energyMatch[0]);
      console.log(energyProfile);
      this.attacks = [{
        cost: energyProfile,
        name: "attaque",
        damage: damageMatch ? parseInt(damageMatch[1], 10) : 0
      }];
    } else {
      this.attacks = [];
    }
  }

  canAttack() {
    if (!this.attacks.length) return false;
    const cost = { ...this.attacks[0].cost }; // clone du coût énergétique
    let energy = [...this.attachedEnergy];

    for (const type in cost) {
      const required = cost[type];
      if (type === 'C') {
        if (energy.length < required) return false;
        energy.splice(0, required);
      } else {
        const count = energy.filter(e => e === type).length;
        if (count < required) return false;
        let removed = 0;
        energy = energy.map((e) => {
          if (e === type && removed < required) {
            removed++;
            return null;
          }
          return e;
        }).filter(e => e !== null);
      }
    }
    return true;
  }

  canRetreat() {
    return this.attachedEnergy.length >= this.retreatCost;
  }

  payRetreatCost() {
    if (!this.canRetreat()) return false;
    this.attachedEnergy.splice(0, this.retreatCost); // retirer n'importe quelles énergies
    return true;
  }

  isKnockedOut() {
    return this.hp <= 0;
  }

  attack(target, { log }) {
    if (!this.canAttack()) return;
    const { name, damage } = this.attacks[0];
    target.hp -= damage;
    log(`${this.name} utilise ${name} et inflige ${damage} dégâts à ${target.name}.`);
  }
}

  