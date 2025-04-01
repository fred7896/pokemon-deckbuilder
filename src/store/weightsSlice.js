// src/store/weightsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const defaultWeights = {
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

const stored = localStorage.getItem('weights');

export const weightsSlice = createSlice({
  name: 'weights',
  initialState: stored ? JSON.parse(stored) : defaultWeights,
  reducers: {
    updateWeight: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
      localStorage.setItem('weights', JSON.stringify(state));
    },
    resetWeights: (state) => {
      Object.assign(state, defaultWeights);
      localStorage.setItem('weights', JSON.stringify(state));
    }
  },
});

export const { updateWeight, resetWeights } = weightsSlice.actions;
export default weightsSlice.reducer;
