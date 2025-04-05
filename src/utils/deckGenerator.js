import fallbackCards from '../data/fallbackCards.json';
import Pokemon from '../simulator/core/Pokemon';
import Deck from '../simulator/core/Deck';

// Utilitaire : extrait les symboles entre accolades
const extractEnergyCost = (attackInfo) => {
  const match = attackInfo.match(/^{([^}]*)}/);
  return match ? match[1].split('') : [];
};

// Filtre les cartes valides
const getValidPokemonCards = () =>
  fallbackCards.filter(card =>
    card.type === 'Pokemon' &&
    card.stage === 'Basic' &&
    card.attack &&
    card.attack[0] &&
    card.attack[0].info &&
    card.attack[0].info.match(/(\d+)/)
  );

// Groupe par type d'énergie unique (hors 'C')
const groupCardsByMonoEnergy = (cards) => {
  const grouped = {};
  cards.forEach(card => {
    const cost = extractEnergyCost(card.attack[0].info);
    const types = [...new Set(cost.filter(c => c !== 'C'))];
    if (types.length === 1) {
      const type = types[0];
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(card);
    }
  });
  return grouped;
};

// Génère un deck de 20 cartes avec max 2 exemplaires par nom
const buildDeck = (cardList) => {
  const countByName = {};
  const pokemons = [];
  const shuffled = [...cardList].sort(() => Math.random() - 0.5);

  for (const card of shuffled) {
    const name = card.name;
    console.log(card.attack[0].info);
    if ((countByName[name] || 0) < 2) {
      pokemons.push(new Pokemon({
        name: name,
        hp: card.hp,
        attack_info: card.attack[0].info,
        retreat: card.retreat || '0'
      }));
      countByName[name] = (countByName[name] || 0) + 1;
    }
    if (pokemons.length >= 20) break;
  }
  console.log(pokemons);
  return new Deck(pokemons);
};

// Fonction principale à appeler
export const generateMonoEnergyDecks = () => {
  const cards = getValidPokemonCards();
  const grouped = groupCardsByMonoEnergy(cards);
  const eligibleTypes = Object.entries(grouped).filter(([_, list]) => {
    const uniqueNames = new Set(list.map(c => c.name));
    return uniqueNames.size >= 10;
  });

  const picked = eligibleTypes.sort(() => Math.random() - 0.5).slice(0, 2);
  const [type1, list1] = picked[0];
  const [type2, list2] = picked[1];

  return {
    type1,
    deck1: buildDeck(list1),
    type2,
    deck2: buildDeck(list2)
  };
};
