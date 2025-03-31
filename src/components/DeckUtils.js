// src/components/DeckUtils.js
import trainerCards from '../data/trainerData';

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

export function getTalentScore(card) {
    return getTalentScoreWithBreakdown(card).total;
  }
  
// Pondération paramétrable des critères
export const weights = {
  energyGain: 50,
  manaLeakUnit: -20,
  discardAllEnergy: -20,
  flipCoin: -5,
  conditionalFail: -10,
  polyvalentBonus: 10,
  benchDamage: 10,
  healAll: 12,
  healSelf: 8,
  statusEffect: 6,
  discardFromDeck: -12,
  cantUse: -8,
};

export function getTalentScoreWithBreakdown(card) {
  let total = 0;
  const breakdown = [];

  const rawText = [
    ...(card.ability || []).map(a => a.info + ' ' + (a.effect || '')),
    ...(card.attack || []).map(a => a.info + ' ' + (a.effect || '')),
    card.text || ""
  ].join(' ').toLowerCase();

  const fullText = stripHtml(rawText);

  // Énergie gagnée
  const energyGainPattern = /take (?:a|\d+)?[^\.]*?energy from your energy zone/i;
  if (energyGainPattern.test(fullText)) {
    breakdown.push({ label: 'Energy Gain', value: weights.energyGain });
    total += weights.energyGain;
  }

  // Mana Leak (énergie défaussée)
  const manaLeakMatch = fullText.match(/discard (\d+)\s*{[^}]+}\s*energy from this/i);
  if (manaLeakMatch) {
    const val = parseInt(manaLeakMatch[1], 10) * weights.manaLeakUnit;
    breakdown.push({ label: 'Mana Leak', value: val });
    total += val;
  }

  // Défausse toutes les énergies
  if (/discard all energy/i.test(fullText)) {
    breakdown.push({ label: 'Discard All Energy', value: weights.discardAllEnergy });
    total += weights.discardAllEnergy;
  }

  // Flip de pièce
  if (/flip a coin/i.test(fullText)) {
    breakdown.push({ label: 'Has RNG (Coin)', value: weights.flipCoin });
    total += weights.flipCoin;
  }

  // Conditionnels faibles
  if (/only if|does nothing if|if you have less/i.test(fullText)) {
    breakdown.push({ label: 'Conditional Penalty', value: weights.conditionalFail });
    total += weights.conditionalFail;
  }

  // Polyvalence (plusieurs attaques)
  if ((card.attack?.length || 0) >= 2) {
    breakdown.push({ label: 'Polyvalent (2+ attacks)', value: weights.polyvalentBonus });
    total += weights.polyvalentBonus;
  }

  // Dégâts au banc
  if (/damage.*bench|bench.*damage/i.test(fullText)) {
    breakdown.push({ label: 'Bench Damage', value: weights.benchDamage });
    total += weights.benchDamage;
  }

  // Heal all
  if (/heal.*all.*pokemon/i.test(fullText)) {
    breakdown.push({ label: 'Heal All Pokémon', value: weights.healAll });
    total += weights.healAll;
  }

  // Heal self
  if (/heal.*this.*pokemon/i.test(fullText)) {
    breakdown.push({ label: 'Heal Self', value: weights.healSelf });
    total += weights.healSelf;
  }

  // Effets de statut
  if (/poisoned|burned|asleep|paralyzed|confused/i.test(fullText)) {
    breakdown.push({ label: 'Status Effect', value: weights.statusEffect });
    total += weights.statusEffect;
  }

  // Défausse de son deck
  if (/discard.*your deck/i.test(fullText)) {
    breakdown.push({ label: 'Discard From Deck', value: weights.discardFromDeck });
    total += weights.discardFromDeck;
  }

  // Ne peut pas attaquer ou utiliser l'effet
  if (/can't use/i.test(fullText)) {
    breakdown.push({ label: 'Restriction (can\'t use)', value: weights.cantUse });
    total += weights.cantUse;
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
    const isEx = card.name.toLowerCase().includes("ex");
    const hasEvolution = !!card.prew_stage_name;
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
  
    const avgDamage = weightedDamage;
  
    const energyTypes = new Set();
    attacks.forEach(atk => {
      const types = atk.info.match(/{([A-Z])}/g);
      if (types) types.forEach(t => energyTypes.add(t));
    });
    const typeCount = [...energyTypes].filter(t => t !== "{C}").length;
    const isMonoType = typeCount <= 1;
    const isIncolore = typeCount === 0;
  
    const { total: talentScore, breakdown: talentBreakdown } = getTalentScoreWithBreakdown(card);
  
    const detail = [];
  
    // detail.push({ label: "Dégâts pondérés (paliers)", value: avgDamage });
    damageByTier.forEach((v, i) => {
        if (v > 0) detail.push({ label: `→ Palier ${i} énergie(s)`, value: v });
      });
    detail.push({ label: "Points de vie", value: pv * 0.2 });
    if (isIncolore) detail.push({ label: "Flexible (0 couleurs)", value: 15 });
    if (isMonoType) detail.push({ label: "Mono-couleur", value: 10 });
    if (typeCount > 2) detail.push({ label: "Trop de couleurs", value: -40 });
    if (isBasic) detail.push({ label: "Carte de base", value: 15 });
    else if (hasEvolution) detail.push({ label: "Carte avec évolution", value: -40 });
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
