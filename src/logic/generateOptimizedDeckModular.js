// src/logic/generateOptimizedDeckModular.js
import { normalize, evaluateCard } from '../components/DeckUtils';
import { remaining , MANDATORY_CARDS } from '../data/trainerData';
import { getEvolutionLine } from './evolutionUtils';
import { calculateStandards, integrateStandardsIntoDeck } from '../utils/getStandards';

const debugLog = [];
const trioPsychic = ['Mesprit', 'Uxie', 'Azelf'];
const fossilMap = {
  "Aerodactyl": "Old Amber",
  "Omanyte": "Helix Fossil",
  "Kabuto": "Dome Fossil",
  "Shieldon": "Armor Fossil",
  "Cranidos": "Skull Fossil",
};

function prepareCardPool(cards, colorFilter) {
  const uniqueMap = new Map();
  cards.forEach(card => {
    const key = normalize(card.name);
    if (!uniqueMap.has(key)) uniqueMap.set(key, card);
  });

  const allUnique = [...uniqueMap.values()].map(card => {
    if (card.type === "Pokemon") {
      const evaluation = evaluateCard(card);
      return { ...card, score: evaluation.score, detail: evaluation.detail };
    }
    return { ...card, score: 0, detail: [] };
  });

  return allUnique.filter(c =>
    !colorFilter || !c.color || c.color === colorFilter || c.color === "Colorless"
  );
}

function addCard(card, context, max = 2, source = '') {
  const { deck, cardCount, addedNames } = context;
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
        addCard(found, context, req.maxCount, 'Mandatory');
      }
    }
  });
}

function addKeyEvolutionLines(context) {
  const candidates = context.pool
    .filter(c => c.type === 'Pokemon' && typeof c.score === 'number')
    .sort((a, b) => b.score - a.score);

  const selected = [];
  for (const c of candidates) {
    const norm = normalize(c.name);
    if (!selected.find(p => normalize(p.name) === norm)) {
      selected.push(c);
    }
    if (selected.length >= 2) break;
  }

    // Check if trioPsychic is involved
    const hasTrio = selected.some(c => trioPsychic.includes(c.name));
    if (hasTrio) {
      trioPsychic.forEach(name => {
        const card = context.pool.find(c => c.name === name);
        if (card) {
          addCard(card, context, 2, 'Trio Psychic');
          addCard(card, context, 2, 'Trio Psychic');
        }
      });
      return; // Skip normal evolution adding logic if trioPsychic is added
    }

  selected.forEach(card => {
    const family = getEvolutionLine(card, context.pool);
    const root = family[0]?.name || card.name;
    if (context.evolutionFamilies.has(root)) return;
    if (context.evolutionFamilies.size >= 2) return;

    const completeLine = [];
    const stages = ['Basic', 'Stage 1', 'Stage 2'];

    stages.forEach(stage => {
      const stageCards = family.filter(c => c.stage === stage);
      stageCards.forEach(c => {
        completeLine.push(c, c); // 2 exemplaires
      });
    });

    // Handle fossils as pseudo-basics
    if (card.stage === 'Stage 1' && fossilMap[card.name]) {
      // console.log("Fossil found: ", card.name);
      const fossilName = fossilMap[card.name];
      const fossilCard = context.pool.find(c => c.name === fossilName);
      if (fossilCard) {
        addCard(fossilCard, context, 2, 'Fossil Base');
        addCard(fossilCard, context, 2, 'Fossil Base');
      }
    } else if (card.stage === 'Stage 2' && fossilMap[card.prew_stage_name]) {
      // console.log("Fossil found: ", card.prew_stage_name);
      const fossilName = fossilMap[card.prew_stage_name];
      const fossilCard = context.pool.find(c => c.name === fossilName);
      if (fossilCard) {
        addCard(fossilCard, context, 2, 'Fossil Base');
        addCard(fossilCard, context, 2, 'Fossil Base');
      }
    } else {
      // console.log("No fossil found for: ", card.name);
    }
      

    completeLine.forEach(card => addCard(card, context, 2, 'Key Evolution'));
    context.evolutionFamilies.add(root);
  });
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
        addCard(trainer, context, 2, 'Name Synergy');
        addCard(trainer, context, 2, 'Name Synergy');
        triggered.add(trainerName);
      }
    }
  }
}

function addComplementaryPokemon(context) {
  const { deck } = context;
  const potentialBasics = context.pool
    .filter(c => c.type === 'Pokemon' && c.stage === 'Basic' && !trioPsychic.includes(c.name))
    .sort((a, b) => (parseFloat(b.score || 0) - parseFloat(a.score || 0)));

  let slots = 0;
  // console.log("deck.length");
  // console.log(deck.length);
  if (deck.length <= 9) {
    
    slots = 2;
  }
  else if (deck.length <= 11 && deck.length > 9) {
    slots = 1;
  }
  else {
    slots = 0;
  }

  let added = 0;
  let remaindedSlots = slots;
  for (const card of potentialBasics) {
    if (context.deck.length >= 20) break;
    if (context.addedNames.has(normalize(card.name))) continue;
    const count = added < slots ? 2 : 1;
    for (let i = 0; i < count && context.deck.length < 20; i++) {
      addCard(card, context, 2, 'Complementary');
      remaindedSlots--;
    }
    added++;
    if (added >= slots) break;
  }
}


function addWeaknessCounters(context) {
  const { deck, pool, standards } = context;
  const avgRetreat = deck.reduce((acc, c) => acc + (parseInt(c.retreat || '0', 10)), 0) / (deck.length || 1);

  if (avgRetreat > standards.retreat.median) {
    const leaf = pool.find(c => normalize(c.name) === 'leaf');
    if (leaf) addCard(leaf, context, 2, 'Counter Retreat');
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

function completeWithTrainers(context) {
  for (const card of remaining) {
    const found = context.pool.find(c => normalize(c.name) === normalize(card.name));
    if (found && context.deck.length < 20) {
      addCard(found, context, 1, 'Filler Trainer');
    }
  }
}

export function generateOptimizedDeckModular(cards, colorFilter = null) {
  const pool = prepareCardPool(cards, colorFilter);
  const standards = calculateStandards(cards);

  const context = {
    deck: [],
    cards,
    pool,
    addedNames: new Set(),
    color: colorFilter,
    cardCount: {},
    evolutionFamilies: new Set(),
    standards,
  };

  debugLog.length = 0;

  addMandatoryCards(context);
  addKeyEvolutionLines(context);
  addColorSynergyTrainers(context);
  addComplementaryPokemon(context);
  addNamedSynergyTrainers(context);
  addWeaknessCounters(context);
  addMetaTechs(context);
  completeWithTrainers(context);

  const finalDeck = context.deck.slice(0, 20);
  const deckStats = integrateStandardsIntoDeck(finalDeck, standards);

  return { deck: finalDeck, stats: deckStats, debugLog };
}
