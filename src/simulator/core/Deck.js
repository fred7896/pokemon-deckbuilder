// simulator/core/Deck.js
// import Pokemon from './Pokemon';

export default class Deck {
  constructor(cardDataList) {
    this.cards = cardDataList;
  }

  toArray() {
    return [...this.cards];
  }
}