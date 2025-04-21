// store/slices/predictionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game } from '../../types/index';

interface PredictionsState {
  predictions: {
    gameId: number;
    selectedTeamId: number;
    confidence: number;
    timestamp: string;
  }[];
  selectedGameId: number | null;
}

const initialState: PredictionsState = {
  predictions: [],
  selectedGameId: null
};

export const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setSelectedGame: (state, action: PayloadAction<number>) => {
      state.selectedGameId = action.payload;
    },
    addPrediction: (state, action: PayloadAction<{ gameId: number; teamId: number; confidence: number }>) => {
      const prediction = {
        gameId: action.payload.gameId,
        selectedTeamId: action.payload.teamId,
        confidence: action.payload.confidence,
        timestamp: new Date().toISOString()
      };
      
      const existingPredictionIndex = state.predictions.findIndex(
        p => p.gameId === action.payload.gameId
      );

      if (existingPredictionIndex >= 0) {
        state.predictions[existingPredictionIndex] = prediction;
      } else {
        state.predictions.push(prediction);
      }
    }
  }
});

export const { setSelectedGame, addPrediction } = predictionsSlice.actions;

export default predictionsSlice.reducer;