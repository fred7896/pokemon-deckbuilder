import { configureStore } from "@reduxjs/toolkit";
import cardsReducer from "./cardsSlice";
import weightsReducer from "./weightsSlice";
import decksReducer from './decksSlice';

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
    weights: weightsReducer,
    decks: decksReducer,
  },
});
