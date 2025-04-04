// src/data/trainerData.js

export const MANDATORY_CARDS = [
  { name: "Professor’s Research", maxCount: 2 },
  { name: "Poké Ball", maxCount: 2 },
];

export const trainerCards = [
    {
      name: "Misty",
      score: 95,
      condition: (deck) => deck.color === 'Water',
      maxCount: 2,
      description: "Génère de l'énergie. Excellente pour Water."
    },
    {
      name: "Irida",
      score: 90,
      condition: (deck) => deck.color === 'Water',
      maxCount: 2,
      description: "Soin puissant pour Water."
    },
    {
      name: "Erika",
      score: 85,
      condition: (deck) => deck.color === 'Grass',
      maxCount: 2,
      description: "Soin pour les decks Grass."
    },
    {
      name: "Red",
      score: 90,
      maxCount: 2,
      description: "+20 dégats contre les EX. Très présent dans la meta."
    },
    {
      name: "Leaf",
      score: 80,
      condition: (deck) => deck.highRetreatCost,
      maxCount: 2,
      description: "Réduction du coût de retraite."
    },
    {
      name: "Rocky Helmet",
      score: 80,
      condition: (deck) => deck.hasTank,
      maxCount: 2,
      description: "Reflète les dégâts subis. À jouer sur les tanks."
    },
    {
      name: "Sabrina",
      score: 75,
      maxCount: 2,
      description: "Switch. Très utile en combo ou défensif."
    },
    {
      name: "Iono",
      score: 70,
      maxCount: 2,
      description: "Reset de main. Utile dans les decks évolutions."
    },
    {
      name: "Barry",
      score: 85,
      condition: (deck) => deck.contains(['Snorlax', 'Heracross', 'Staraptor']),
      maxCount: 2,
      description: "Réduction coût d'attaque."
    },
    {
      name: "Giovanni",
      score: 65,
      maxCount: 1,
      description: "+10 dégats. Faible mais jouable."
    },
    {
      name: "Blue",
      score: 60,
      condition: (deck) => deck.lowHP,
      maxCount: 1,
      description: "+10 défense. Situations spécifiques."
    },
    {
      name: "Dawn",
      score: 85,
      condition: (deck) => deck.contains(['Manaphy', 'Dialga ex', 'Leafeon ex']),
      maxCount: 1,
      description: "Déplace les énergies. Synergie."
    },
    {
      name: "Cyrus",
      score: 80,
      condition: (deck) => deck.damagesBench,
      maxCount: 2,
      description: "Switch défensif, très joué."
    },
    {
      name: "Mars",
      score: 75,
      maxCount: 1,
      description: "Pioche + discard adverse. Gamebreaker."
    },
    {
      name: "Team Rocket Grunt",
      score: 80,
      maxCount: 2,
      description: "Retire énergie aléatoire. Puissant mais imprévisible."
    },
    {
      name: "Pokémon Communication",
      score: 70,
      condition: (deck) => deck.hasEvolutions,
      maxCount: 2,
      description: "Permet de cycler des Pokémon en main."
    },
    {
      name: "Giant Cape",
      score: 85,
      condition: (deck) => deck.hasExWithLowHP,
      maxCount: 2,
      description: "Ajoute des PV. Souvent utilisé sur EX faibles."
    },
    {
      name: "Old Amber",
      score: 50,
      condition: (deck) => deck.contains(['Aerodactyl']),
      maxCount: 1,
      description: "Pré-évolution obligatoire pour Aerodactyl."
    },
    // Tu peux continuer à enrichir...
  ];

  export default trainerCards;

  export const remaining = [
    {
      name: "Rocky Helmet",
      score: 80,
      condition: (deck) => deck.hasTank,
      maxCount: 2,
      description: "Reflète les dégâts subis. À jouer sur les tanks."
    },
    {
      name: "Sabrina",
      score: 75,
      maxCount: 2,
      description: "Switch. Très utile en combo ou défensif."
    },

    {
      name: "Iono",
      score: 70,
      maxCount: 2,
      description: "Reset de main. Utile dans les decks évolutions."
    },
    {
      name: "Giovanni",
      score: 65,
      maxCount: 1,
      description: "+10 dégats. Faible mais jouable."
    },
    {
      name: "Blue",
      score: 60,
      condition: (deck) => deck.lowHP,
      maxCount: 1,
      description: "+10 défense. Situations spécifiques."
    },
    {
      name: "Dawn",
      score: 85,
      condition: (deck) => deck.contains(['Manaphy', 'Dialga ex', 'Leafeon ex']),
      maxCount: 1,
      description: "Déplace les énergies. Synergie."
    },
    {
      name: "Cyrus",
      score: 80,
      condition: (deck) => deck.damagesBench,
      maxCount: 2,
      description: "Switch défensif, très joué."
    },
    {
      name: "Pokémon Communication",
      score: 70,
      condition: (deck) => deck.hasEvolutions,
      maxCount: 2,
      description: "Permet de cycler des Pokémon en main."
    },
    {
      name: "Giant Cape",
      score: 85,
      condition: (deck) => deck.hasExWithLowHP,
      maxCount: 2,
      description: "Ajoute des PV. Souvent utilisé sur EX faibles."
    },
  ];
  