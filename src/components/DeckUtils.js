// src/components/DeckUtils.js
import trainerCards from '../data/trainerData';
import { store } from '../store/store';

export const MANDATORY_CARDS = trainerCards.filter(c => c.alwaysInclude);
const trioPsychic = ['Mesprit', 'Uxie', 'Azelf'];

export function normalize(name) {
  return name?.toLowerCase().replace(/[’']/g, "'");
}

export function stripHtml(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.textContent || div.innerText || "";
}

export function countEnergySymbols(infoString) {
  const energyMap = {};

  // Match tous les groupes d'énergie comme {RR} ou {G}
  const matches = infoString.match(/{([A-Z]+)}/g);
  if (!matches) return energyMap;

  matches.forEach(group => {
    const raw = group.replace(/[{}]/g, ''); // ex: "RR"
    raw.split('').forEach(symbol => {
      energyMap[symbol] = (energyMap[symbol] || 0) + 1;
    });
  });

  return energyMap;
}

function getEnergyProfile(card) {
  const energyTypes = new Set();

  if (!Array.isArray(card.attack)) return {
    isMulticolor: false,
    isIncolore: false,
    allTypes: []
  };

  card.attack.forEach(atk => {
    const symbols = countEnergySymbols(atk.info);
    Object.keys(symbols).forEach(symbol => {
      if (symbol !== 'C') energyTypes.add(symbol);
    });
  });

  const typeCount = energyTypes.size;

  return {
    isMulticolor: typeCount > 1,
    isColorless: typeCount === 0,
    allTypes: Array.from(energyTypes)
  };
}

export function getTalentScore(card) {
    return getTalentScoreWithBreakdown(card).total;
  }


export function getTalentScoreWithBreakdown(card) {
  const weights = store.getState().weights;
  let total = 0;
  const breakdown = [];

  const rawText = [
    ...(card.ability || []).map(a => a.info + ' ' + (a.effect || '')),
    ...(card.attack || []).map(a => a.info + ' ' + (a.effect || '')),
    card.text || ""
  ].join(' ').toLowerCase();

  const fullText = stripHtml(rawText);

  if (/take (?:a|\d+)?[^\.]*?energy from your energy zone/i.test(fullText)) {
    breakdown.push({ label: 'Energy Gain', value: weights.energyGain });
    total += weights.energyGain;
  }

  const manaLeakMatch = fullText.match(/discard (\d+)\s*{[^}]+}\s*energy from this/i);
  if (manaLeakMatch) {
    const val = parseInt(manaLeakMatch[1], 10) * weights.manaLeakUnit;
    breakdown.push({ label: 'Mana Leak', value: val });
    total += val;
  }

  // Case: "Discard all {X} Energy from this Pokémon"
  if (/discard all\s*{[^}]+}\s*energy from this/i.test(fullText)) {
    // console.log("Discard all energy from this Pokémon")
    // console.log(card.name);
    // Trouver l'attaque avec le plus grand coût en énergie
    const maxEnergyCost = Math.max(
      ...(Array.isArray(card.attack) ? card.attack.map(atk => {
        const matches = atk.info.match(/{[A-Z]+}/g);
        return matches ? (matches[0].length - 2) : 0;
      }) : [0])
  );

  // Case: "Discard X random Energy from this Pokémon"
const discardRandomEnergyMatch = fullText.match(/discard (\d+)\s+(?:random\s+)?energy from this/i);
if (discardRandomEnergyMatch) {
  console.log("Discard X random energy from this Pokémon")
  console.log(card.name);
  const energyCount = parseInt(discardRandomEnergyMatch[1], 10);
  const value = -energyCount * weights.manaLeakUnit;
  breakdown.push({ label: "Discard Random Energy", value });
  total += value;
}

  const value = maxEnergyCost * weights.discardAllEnergy;
  breakdown.push({ label: "Discard All Energy", value });
  total += value;
}

// Case: "Discard all Energy from this Pokémon"
if (/discard all energy from this/i.test(fullText)) {
  // Prendre le coût de la plus grosse attaque
  const maxEnergyCost = Math.max(
    ...(Array.isArray(card.attack) ? card.attack.map(atk => {
      const matches = atk.info.match(/{[A-Z]+}/g);
      return matches ? (matches[0].length - 2) : 0;
    }) : [0])
  );

  const value = maxEnergyCost * weights.discardAllEnergy;
  breakdown.push({ label: "Discard All Energy", value });
  total += value;
}


  if(/remove.*energy.*from.*opponent/i.test(fullText)) {
    breakdown.push({ label: 'Remove Energy from Opponent', value: weights.removeEnergy });  
  }

  if (/flip a coin/i.test(fullText)) {
    breakdown.push({ label: 'Has RNG (Coin)', value: weights.flipCoin });
    total += weights.flipCoin;
  }


  if ((card.attack?.length || 0) >= 2) {
    breakdown.push({ label: 'Polyvalent (2+ attacks)', value: weights.polyvalentBonus });
    total += weights.polyvalentBonus;
  }

  if (/damage.*bench|bench.*damage/i.test(fullText)) {
    breakdown.push({ label: 'Bench Damage', value: weights.benchDamage });
    total += weights.benchDamage;
  }

  if (/heal.*all.*pokemon/i.test(fullText)) {
    breakdown.push({ label: 'Heal All Pokémon', value: weights.healAll });
    total += weights.healAll;
  }

  if (/heal.*this.*pokemon/i.test(fullText)) {
    breakdown.push({ label: 'Heal Self', value: weights.healSelf });
    total += weights.healSelf;
  }

  if (/poisoned|burned|asleep|paralyzed|confused/i.test(fullText)) {
    breakdown.push({ label: 'Status Effect', value: weights.statusEffect });
    total += weights.statusEffect;
  }

  if (/discard.*your deck/i.test(fullText)) {
    breakdown.push({ label: 'Discard From Deck', value: weights.discardFromDeck });
    total += weights.discardFromDeck;
  }

  if (/can't use/i.test(fullText)) {
    breakdown.push({ label: 'Restriction (can\'t use)', value: weights.cantUse });
    total += weights.cantUse;
  }
  
  if (/can't attack|can’t attack|cannot attack/i.test(fullText)) {
    breakdown.push({ label: "Can't attack", value: -40 });
    total -= 40;
  }
  

  if (Array.isArray(card.attack)) {
    const atkWithNoEffect = card.attack.find(atk => /this attack does nothing/i.test(atk.effect || ''));
    if (atkWithNoEffect) {
      const damageMatch = atkWithNoEffect.info.match(/(\d+)/);
      const dmg = damageMatch ? parseInt(damageMatch[1], 10) : 0;
      const malus = -Math.round(dmg * 0.5);
      breakdown.push({ label: "Attack Does Nothing", value: malus });
      total += malus;
    }
  }

  const selfDamageMatch = fullText.match(/does (\d+) damage to itself/); // ok
  if (selfDamageMatch) {
    const val = -parseInt(selfDamageMatch[1], 10);
    breakdown.push({ label: "Self Damage", value: val });
    total += val;
  }

  const bonusDamageMatch = fullText.match(/this attack does (\d+) more damage/i); // ok
  if (bonusDamageMatch) {
    const val = parseInt(bonusDamageMatch[1], 10);
    breakdown.push({ label: "Bonus Conditional Damage", value: val *0.5 });
    total += val;
  }

  const opponentDamageMatch = fullText.match(/do (\d+) damage to .*opponent/i); // ok pour darkrai
  if (opponentDamageMatch) {
    const val = parseInt(opponentDamageMatch[1], 10);
    breakdown.push({ label: "Direct Opponent Damage", value: val });
    total += val;
  }

  const attackingDamageMatch = fullText.match(/do (\d+) damage to .*attacking/i); //ok pour Druddigon
  if (attackingDamageMatch) {
    const val = parseInt(attackingDamageMatch[1], 10);
    breakdown.push({ label: "Damage to Attacking", value: val });
    total += val;
  }

  if (fullText.includes("discard a random energy from your opponent")) {
    breakdown.push({ label: "Disrupt Opponent Energy", value: 40 });
    total += 20;
  }


  return { total, breakdown };
}
  
  export function computeTankThresholds(cards) {
    const hps = cards
      .filter(c => c.type === 'Pokemon')
      .map(c => parseInt(c.hp || '0', 10))
      .filter(Boolean)
      .sort((a, b) => a - b);
    const third = Math.floor(hps.length / 3);
    return {
      low: hps[third],
      high: hps[2 * third]
    };
  }


  

  export function evaluateCard(card, meta = { averagePV: 150 }) {
    const isBasic = card.stage === "Basic";
    const isStage1 = card.stage === "Stage 1";
    const isStage2 = card.stage === "Stage 2";
    const isEx = card.name.toLowerCase().includes("ex");
    const pv = parseInt(card.hp || 0, 10);
    const attacks = Array.isArray(card.attack) ? card.attack : [];
  
    // Nouveau calcul basé sur les paliers d'énergie
    const multipliers = [0, 2, 1.5, 1, 0.6, 0.3];
    let weightedDamage = 0;
    const damageByTier = [0, 0, 0, 0, 0, 0];
    // console.log(card.name);
    // console.log(attacks);

    attacks.forEach(atk => {
      const damageMatch = atk.info.match(/(\d+)/);
      // console.log(damageMatch);
      const energyMatch = atk.info.match(/{[A-Z]+}/g);
        const energyCost = energyMatch
        ? energyMatch.reduce((sum, e) => sum + e.length - 2, 0)
        : 0;
      // console.log(energyMatch);
      const damage = damageMatch ? parseInt(damageMatch[1], 10) : 0;
      const tier = Math.min(energyCost, multipliers.length - 1);
      const multiplier = multipliers[Math.min(energyCost, multipliers.length - 1)];
      const weighted = damage * multiplier;
      weightedDamage += damage * multiplier;
      damageByTier[tier] += weighted;
    });
  
    const energyProfile = getEnergyProfile(card);
    // console.log(card.name);
    // console.log(energyProfile);
  
    const { total: talentScore, breakdown: talentBreakdown } = getTalentScoreWithBreakdown(card);
  
    const detail = [];
  
    damageByTier.forEach((v, i) => {
        if (v > 0) detail.push({ label: `→ Palier ${i} énergie(s)`, value: v });
      });
    detail.push({ label: "Points de vie", value: pv * 0.2 });
    if (energyProfile.isColorless) detail.push({ label: "Flexible (0 couleurs)", value: 10 });
    if (energyProfile.isMulticolor) detail.push({ label: "Multicolor", value: -40 });
    if (isBasic) detail.push({ label: "Carte de base", value: 10 });
    else if (isStage1) detail.push({ label: "Carte de stade 1", value: -20 });
    else if (isStage2) detail.push({ label: "Carte de stade 2", value: -50 });
    if (isEx) detail.push({ label: "Carte EX malus", value: -20 });
  
    talentBreakdown.forEach(e => detail.push(e));
  
    const score = detail.reduce((acc, e) => acc + e.value, 0);
  
    return { score, detail };
  }

export function getDeckInfo(deck, allCards) {
    const colors = new Set(deck.map(c => c.color).filter(Boolean));
    const { low, high } = computeTankThresholds(allCards);
  
    return {
      color: [...colors][0],
      contains: names => deck.some(c => names.includes(c.name)),
      hasEvolutions: deck.some(c => c.stage === 'Stage 1' || c.stage === 'Stage 2'),
      highRetreatCost: deck.some(c => parseInt(c.retreat || '0', 10) >= 2),
      lowHP: deck.some(c => parseInt(c.hp || '0', 10) < low),
      hasTank: deck.some(c => parseInt(c.hp || '0', 10) >= high),
      damagesBench: deck.some(c => stripHtml(c.text || '').includes('bench')),
      hasExWithLowHP: deck.some(c =>
        c.name.toLowerCase().includes('ex') && parseInt(c.hp || '0', 10) < high
      )
    };
  }

export function getEvolutionLine(card, allCards) {
  const line = [];
  let current = card;
  while (current?.prew_stage_name) {
    const prev = allCards.find(c => c.name === current.prew_stage_name);
    if (!prev) break;
    line.unshift(prev);
    current = prev;
  }
  return line;
}

export function generateOptimizedDeck(cards, colorFilter = null) {
    const uniqueMap = new Map();
    cards.forEach(card => {
      const key = normalize(card.name);
      if (!uniqueMap.has(key)) uniqueMap.set(key, card);
    });
  
    const allUnique = [...uniqueMap.values()].filter(c =>
      !colorFilter || !c.color || c.color === colorFilter || c.color === "Colorless"
    );
  
    const averagePV = Math.round(
      allUnique
        .filter(c => c.type === 'Pokemon')
        .map(c => parseInt(c.hp || '0', 10))
        .filter(Boolean)
        .reduce((a, b) => a + b, 0) / allUnique.filter(c => c.type === 'Pokemon').length
    );
  
    const evaluated = allUnique.map(card => {
      if (card.type === "Pokemon") {
        const evaluation = evaluateCard(card, { averagePV });
        return { ...card, score: evaluation.score, detail: evaluation.detail };
      }
      return { ...card, score: 0, detail: [] };
    });
  
    const deck = [];
    const cardCount = {};
  
    MANDATORY_CARDS.forEach(req => {
      const found = evaluated.find(c => normalize(c.name) === normalize(req.name));
      if (found) {
        for (let i = 0; i < req.maxCount; i++) {
          deck.push({ ...found });
          cardCount[found.name] = (cardCount[found.name] || 0) + 1;
        }
      }
    });
  
    evaluated.sort((a, b) => b.score - a.score);
    const colors = new Set();
    const addedNames = new Set(deck.map(c => normalize(c.name)));
    let evolutionFamilies = new Set();
  
    for (const card of evaluated) {
      if (deck.length >= 20) break;
      if (card.type !== 'Pokemon') continue;
  
      const nameNorm = normalize(card.name);
      const count = cardCount[card.name] || 0;
      if (count >= 2 || addedNames.has(nameNorm)) continue;
  
      if (card.color && card.color !== "Colorless" && !colors.has(card.color)) {
        if (colors.size >= 2) continue;
        colors.add(card.color);
      }
  
      const evoLine = getEvolutionLine(card, allUnique);
      const familyRoot = evoLine[0]?.name || card.name;
      if (evolutionFamilies.has(familyRoot)) continue;
      if (evolutionFamilies.size >= 2) continue;
  
      for (const evoCard of evoLine) {
        if (deck.length >= 20) break;
        const evoNorm = normalize(evoCard.name);
        if (!addedNames.has(evoNorm)) {
          deck.push({ ...evoCard });
          addedNames.add(evoNorm);
          cardCount[evoCard.name] = 1;
        }
      }
  
      deck.push({ ...card });
      cardCount[card.name] = count + 1;
      addedNames.add(nameNorm);
      evolutionFamilies.add(familyRoot);
  
      if (deck.length < 20) {
        deck.push({ ...card });
        cardCount[card.name] += 1;
      }
  
      if (trioPsychic.includes(card.name)) {
        trioPsychic.forEach(trioName => {
          if (!addedNames.has(normalize(trioName))) {
            const found = allUnique.find(c => normalize(c.name) === normalize(trioName));
            if (found && deck.length < 20) {
              deck.push({ ...found });
              addedNames.add(normalize(trioName));
              cardCount[trioName] = 1;
            }
          }
        });
      }
    }
  
    const deckInfo = getDeckInfo(deck, cards);
  
    const trainerCandidates = trainerCards.filter(t => !t.alwaysInclude)
      .filter(t => !t.condition || t.condition(deckInfo))
      .sort((a, b) => b.score - a.score);
  
    for (const trainer of trainerCandidates) {
      if (deck.length >= 20) break;
      const count = cardCount[trainer.name] || 0;
      const max = trainer.maxCount || 1;
      if (count >= max) continue;
      const found = allUnique.find(c => normalize(c.name) === normalize(trainer.name));
      if (found) {
        deck.push({ ...found });
        cardCount[trainer.name] = count + 1;
      }
    }
  
    return deck.slice(0, 20);
  }

export function generateTopDecks(cards, count = 5) {
    const colors = Array.from(new Set(cards.map(c => c.color).filter(Boolean)));
    const decks = colors.map(color => ({
      color,
      deck: generateOptimizedDeck(cards, color),
    })).map(({ color, deck }) => {
        const score = deck.reduce((acc, c) => {
            let value = 0;
            if (typeof c.score === 'number') {
              value = c.score;
            } else if (typeof c.score === 'object' && typeof c.score.score === 'number') {
              value = c.score.score;
            } else {
              const evalResult = evaluateCard(c);
              value = evalResult.score;
            }
            return acc + value;
          }, 0);
      return { color, deck, score: Math.round(score) };
    });
    return decks.sort((a, b) => b.score - a.score).slice(0, count);
  }

export function simulateOpeningHand(deck) {
  return deck.sort(() => 0.5 - Math.random()).slice(0, 5);
}

export function exportDeckToText(deck) {
  const counts = {};
  deck.forEach(c => counts[c.name] = (counts[c.name] || 0) + 1);
  return Object.entries(counts).map(([name, count]) => `${count}x ${name}`).join("\n");
}

export function analyzeMeta(decks) {
  const usage = {};
  decks.forEach(deck => {
    deck.forEach(card => {
      usage[card.name] = (usage[card.name] || 0) + 1;
    });
  });
  return Object.entries(usage).sort((a, b) => b[1] - a[1]);
}
