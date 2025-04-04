import Pokemon from "../core/Pokemon.js";

export const deckA = [
  new Pokemon({ name: "Pikachu", hp: 60, attackCost: 1, attackDamage: 30, retreatCost: 1 }),
  new Pokemon({ name: "Pikachu", hp: 60, attackCost: 1, attackDamage: 30, retreatCost: 1 }),
  new Pokemon({ name: "Roucool", hp: 40, attackCost: 1, attackDamage: 10, retreatCost: 0 }),
  new Pokemon({ name: "Roucool", hp: 40, attackCost: 1, attackDamage: 10, retreatCost: 0 }),
  new Pokemon({ name: "Carapuce", hp: 70, attackCost: 2, attackDamage: 40, retreatCost: 1 }),
  new Pokemon({ name: "Carapuce", hp: 70, attackCost: 2, attackDamage: 40, retreatCost: 1 }),
  new Pokemon({ name: "Ponyta", hp: 60, attackCost: 2, attackDamage: 35, retreatCost: 1 }),
  new Pokemon({ name: "Ponyta", hp: 60, attackCost: 2, attackDamage: 35, retreatCost: 1 }),
  new Pokemon({ name: "Bulbizarre", hp: 65, attackCost: 1, attackDamage: 25, retreatCost: 1 }),
  new Pokemon({ name: "Bulbizarre", hp: 65, attackCost: 1, attackDamage: 25, retreatCost: 1 }),
  new Pokemon({ name: "Aspicot", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 }),
  new Pokemon({ name: "Aspicot", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 }),
  new Pokemon({ name: "Magicarpe", hp: 30, attackCost: 1, attackDamage: 5, retreatCost: 1 }),
  new Pokemon({ name: "Magicarpe", hp: 30, attackCost: 1, attackDamage: 5, retreatCost: 1 }),
  new Pokemon({ name: "Fantominus", hp: 40, attackCost: 1, attackDamage: 25, retreatCost: 0 }),
  new Pokemon({ name: "Fantominus", hp: 40, attackCost: 1, attackDamage: 25, retreatCost: 0 }),
  new Pokemon({ name: "Nosferapti", hp: 45, attackCost: 1, attackDamage: 15, retreatCost: 0 }),
  new Pokemon({ name: "Nosferapti", hp: 45, attackCost: 1, attackDamage: 15, retreatCost: 0 }),
  new Pokemon({ name: "Salamèche", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 }),
  new Pokemon({ name: "Salamèche", hp: 50, attackCost: 1, attackDamage: 20, retreatCost: 1 }),
];

export const deckB = [...deckA]; // ou une autre combinaison équilibrée

export const availableDecks = {
  PikachuMix: deckA,
  Reversed: deckB
};
