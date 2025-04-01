// src/logic/generateOptimizedDeckModular.js
import { normalize } from '../components/DeckUtils';
import trainerCards, { MANDATORY_CARDS } from '../data/trainerData';
import { getEvolutionLine } from './evolutionUtils';

function prepareCardPool(cards, colorFilter) {
  const uniqueMap = new Map();
  cards.forEach(card => {
    const key = normalize(card.name);
    if (!uniqueMap.has(key)) uniqueMap.set(key, card);
  });
  return [...uniqueMap.values()].filter(c =>
    !colorFilter || !c.color || c.color === colorFilter || c.color === "Colorless"
  );
}

function addCard(card, context, max = 2, source = 'unknown') {
  const { deck, cardCount, addedNames, debugLog } = context;
  const count = cardCount[card.name] || 0;
  if (count >= max || deck.length >= 20) return;
  deck.push({ ...card });
  cardCount[card.name] = count + 1;
  addedNames.add(normalize(card.name));
  debugLog.push({ name: card.name, source });
}

function addMandatoryCards(context) {
  MANDATORY_CARDS.forEach(req => {
    const found = context.pool.find(c => normalize(c.name) === normalize(req.name));
    if (found) {
      for (let i = 0; i < req.maxCount; i++) {
        addCard(found, context, 2, 'Mandatory');
      }
    }
  });
}

function addKeyPokemonFamilies(context) {
  const potentialFamilies = context.pool
    .filter(c => c.type === 'Pokemon')
    .filter(c => c.stage === 'Stage 2' || c.stage === 'Stage 1' || c.stage === 'Basic')
    .sort((a, b) => (parseFloat(b.score || 0) - parseFloat(a.score || 0)));

  for (const card of potentialFamilies) {
    if (context.deck.length >= 20) break;
    const family = getEvolutionLine(card, context.pool);
    const root = family[0]?.name || card.name;
    if (context.evolutionFamilies.has(root)) continue;
    if (context.evolutionFamilies.size >= 2) break;

    for (const evoCard of family) {
      if (context.deck.length >= 20) break;
      addCard(evoCard, context, 2, 'Evolution');
    }

    context.evolutionFamilies.add(root);
  }
}

function addColorSynergyTrainers(context) {
  const synergyMap = {
    Water: ['Misty', 'Irida'],
    Grass: ['Erika'],
    Psychic: ['Mythical Slab'],
    Metal: ['Adaman'],
    Electric: ['Volkner'],
  };

  const color = context.color;
  if (!color || !synergyMap[color]) return;

  synergyMap[color].forEach(name => {
    const found = context.pool.find(c => normalize(c.name) === normalize(name));
    if (found) {
      addCard(found, context, 2, 'Color Synergy');
    }
  });
}

function addNamedSynergyTrainers(context) {
  const nameTriggers = {
    Snorlax: 'Barry',
    Golem: 'Brock',
    Onix: 'Brock',
    Ninetales: 'Blaine',
    Rapidash: 'Blaine',
    Magmar: 'Blaine',
    Muk: 'Koga',
    Weezing: 'Koga',
    Raichu: 'Lt. Surge',
    Electrode: 'Lt. Surge',
    Electabuzz: 'Lt. Surge',
    Garchomp: 'Cynthia',
    Togekiss: 'Cynthia',
    Mewtwo: 'Budding Expeditioner',
  };

  const deckNames = context.deck.map(c => normalize(c.name));
  const triggered = new Set();

  for (const [pokeName, trainerName] of Object.entries(nameTriggers)) {
    if (deckNames.includes(normalize(pokeName)) && !triggered.has(trainerName)) {
      const trainer = context.pool.find(c => normalize(c.name) === normalize(trainerName));
      if (trainer) {
        addCard(trainer, context, 2, 'Named Synergy');
        triggered.add(trainerName);
      }
    }
  }
}

function addComplementaryPokemon(context) {
  const potentialBasics = context.pool
    .filter(c => c.type === 'Pokemon' && c.stage === 'Basic')
    .sort((a, b) => (parseFloat(b.score || 0) - parseFloat(a.score || 0)));

  for (const card of potentialBasics) {
    if (context.deck.length >= 20) break;
    if (context.addedNames.has(normalize(card.name))) continue;
    addCard(card, context, 2, 'Complementary');
  }
}

function addWeaknessCounters(context) {
  const { deck, pool } = context;
  const avgRetreat = deck.reduce((acc, c) => acc + (parseInt(c.retreat || '0', 10)), 0) / (deck.length || 1);
  const highRetreat = avgRetreat >= 2;
  const lowDrawSupport = deck.filter(c => ['Iono', 'Pokémon Communication'].includes(c.name)).length < 2;

  if (highRetreat) {
    const leaf = pool.find(c => normalize(c.name) === 'leaf');
    if (leaf) addCard(leaf, context, 2, 'Weakness Counter');
  }

  if (lowDrawSupport) {
    const iono = pool.find(c => normalize(c.name) === 'iono');
    if (iono) addCard(iono, context, 1, 'Weakness Counter');
  }
} 

function addMetaTechs(context) {
  const metaCards = ['Red', 'Team Rocket Grunt', 'Mars'];
  for (const name of metaCards) {
    if (context.deck.length >= 20) break;
    const found = context.pool.find(c => normalize(c.name) === normalize(name));
    if (found) addCard(found, context, 1, 'Meta Tech');
  }
}

export function generateOptimizedDeckModular(cards, colorFilter = null) {
  const pool = prepareCardPool(cards, colorFilter);

  const context = {
    deck: [],
    cards,
    pool,
    addedNames: new Set(),
    color: colorFilter,
    cardCount: {},
    evolutionFamilies: new Set(),
    debugLog: [],
  };

  addMandatoryCards(context);
  addKeyPokemonFamilies(context);
  addColorSynergyTrainers(context);
  addNamedSynergyTrainers(context);
  addComplementaryPokemon(context);
  addWeaknessCounters(context);
  addMetaTechs(context);

  return {
    deck: context.deck.slice(0, 20),
    debugLog: context.debugLog,
    color: context.color,
  };
}
