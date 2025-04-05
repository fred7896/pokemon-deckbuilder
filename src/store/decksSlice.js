// store/decksSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deckManual: null,
  deckScoring: null,
  deckAuto: null
};

const decksSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    setDeckManual: (state, action) => {
      state.deckManual = action.payload;
    },
    setDeckScoring: (state, action) => {
      state.deckScoring = action.payload;
    },
    setDeckAuto: (state, action) => {
      state.deckAuto = action.payload;
    },
    clearAllDecks: (state) => {
      state.deckManual = null;
      state.deckScoring = null;
      state.deckAuto = null;
    }
  }
});

export const {
  setDeckManual,
  setDeckScoring,
  setDeckAuto,
  clearAllDecks
} = decksSlice.actions;

export default decksSlice.reducer;