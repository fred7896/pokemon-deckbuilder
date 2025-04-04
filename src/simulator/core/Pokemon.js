export default class Pokemon {
    constructor({ name, hp, attackCost, attackDamage, retreatCost }) {
      this.name = name;
      this.maxHp = hp;
      this.currentHp = hp;
      this.attackCost = attackCost;
      this.attackDamage = attackDamage;
      this.retreatCost = retreatCost;
      this.energyAttached = 0;
    }
  
    isKnockedOut() {
      return this.currentHp <= 0;
    }
  
    attachEnergy(amount) {
      this.energyAttached += amount;
    }
  
    canAttack() {
      return this.energyAttached >= this.attackCost;
    }
  
    attack(target, logger = console) {
      logger.log(`${this.name} attaque ${target.name} pour ${this.attackDamage} dégâts`);
      target.currentHp -= this.attackDamage;
    }
  }
  