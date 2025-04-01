import { configureStore } from "@reduxjs/toolkit";
import cardsReducer from "./cardsSlice";
import weightsReducer from "./weightsSlice";

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
    weights: weightsReducer,
  },
});
