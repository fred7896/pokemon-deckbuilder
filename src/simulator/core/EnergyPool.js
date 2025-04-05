// simulator/core/EnergyPool.js
export default class EnergyPool {
    constructor(allowedTypes) {
      this.allowedTypes = allowedTypes;
      this.current = null;
      this.next = this._generate();
    }
  
    // Tire aléatoirement une énergie autorisée
    _generate() {
      const i = Math.floor(Math.random() * this.allowedTypes.length);
      return this.allowedTypes[i];
    }
  
    // À appeler au début du tour : récupère l'énergie en cours et prépare la suivante
    consumeCurrent() {
      this.current = this.next;
      this.next = this._generate();
      return this.current;
    }
  
    // Visualisation (peut être utilisée pour les icônes dans l'affichage)
    getCurrent() {
      return this.current;
    }
  
    getNext() {
      return this.next;
    }
  }
  