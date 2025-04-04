import { deckA, deckB } from "./data/sampleDecks.js";
import Battle from "./core/Battle.js";

const battle = new Battle(deckA, deckB);
battle.simulate();
