// src/store/cardsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const useFallbackOnly = true;

export const fetchCards = createAsyncThunk('cards/fetchCards', async () => {
  if (useFallbackOnly) {
    const fallback = await fetch('/data/fallbackCards.json');
    if (!fallback.ok) throw new Error('Échec du chargement du fallback JSON');
    return await fallback.json();
  }

  try {
    const response = await fetch('http://localhost:5000/api/cards');
    if (!response.ok) throw new Error('API failed');
    return await response.json();
  } catch (apiError) {
    console.warn('API indisponible, chargement du fallback JSON…');
    const fallback = await fetch('/data/fallbackCards.json');
    if (!fallback.ok) throw new Error('Échec fallback JSON');
    return await fallback.json();
  }
});


const cardsSlice = createSlice({
  name: 'cards',
  initialState: {
    allCards: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allCards = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default cardsSlice.reducer;


