// src/utils/getStandards.js
import { createSlice } from '@reduxjs/toolkit';

function getAttackDamageAtPaliers(card) {
  const result = { palier1: [], palier2: [], otk: [] };
  if (!Array.isArray(card.attack)) return result;

  card.attack.forEach(atk => {
    const match = atk.info.match(/(\d+)/);
    const damage = match ? parseInt(match[1], 10) : 0;
    const energy = (atk.info.match(/{[A-Z]}/g) || []).length;

    if (energy === 1) result.palier1.push(damage);
    if (energy === 2) result.palier2.push(damage);
    if (energy >= 3) result.otk.push(damage);
  });

  return result;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function calculateStandards(cards) {
  const pokemons = cards.filter(c => c.type === 'Pokemon');

  const hpValues = pokemons.map(p => parseInt(p.hp || '0', 10)).filter(Boolean);
  const retreatValues = pokemons.map(p => parseInt(p.retreat || '0', 10)).filter(Boolean);

  let palier1Dmg = [], palier2Dmg = [], otkDmg = [];
  pokemons.forEach(p => {
    const dmg = getAttackDamageAtPaliers(p);
    palier1Dmg.push(...dmg.palier1);
    palier2Dmg.push(...dmg.palier2);
    otkDmg.push(...dmg.otk);
  });

  return {
    hp: {
      min: Math.min(...hpValues),
      median: median(hpValues),
      max: Math.max(...hpValues),
    },
    damage: {
      palier1: median(palier1Dmg),
      palier2: median(palier2Dmg),
      otk: median(otkDmg),
    },
    retreat: {
      median: median(retreatValues),
    }
  };
}

export function integrateStandardsIntoDeck(deck, standards) {
  const deckHPs = deck.map(c => parseInt(c.hp || '0', 10)).filter(Boolean);
  const retreatCosts = deck.map(c => parseInt(c.retreat || '0', 10)).filter(Boolean);

  const avgHP = deckHPs.reduce((acc, val) => acc + val, 0) / (deckHPs.length || 1);
  const avgRetreat = retreatCosts.reduce((acc, val) => acc + val, 0) / (retreatCosts.length || 1);

  return {
    avgHP,
    avgRetreat,
    hpAboveMedian: avgHP > standards.hp.median,
    retreatAboveMedian: avgRetreat > standards.retreat.median,
    potentialTank: deckHPs.some(hp => hp >= standards.hp.max),
    needsLeaf: avgRetreat > standards.retreat.median,
    lowDamagePalier1: deck.some(card => {
      if (!Array.isArray(card.attack)) return false;
      return card.attack.some(atk => {
        const match = atk.info.match(/(\d+)/);
        const damage = match ? parseInt(match[1], 10) : 0;
        const energy = (atk.info.match(/{[A-Z]}/g) || []).length;
        return energy === 1 && damage < standards.damage.palier1;
      });
    }),
  };
}

// Redux slice (optionnel pour persistance dans le store)
const standardsSlice = createSlice({
  name: 'standards',
  initialState: null,
  reducers: {
    setStandards: (state, action) => action.payload,
  },
});

export const { setStandards } = standardsSlice.actions;
export default standardsSlice.reducer;
