import cards from '../data/fallbackCards.json';

export const getValidPokemonCards = () =>
  cards.filter(c =>
    c.type === 'Pokemon' &&
    c.stage === 'Basic' &&
    c.attack?.[0]?.info
  ).map(c => ({
    name: c.name,
    hp: c.hp,
    attack_info: c.attack[0].info,
    retreat: c.retreat || '0',
  }));