import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PracticeMode } from './usePracticeStore';
import type { PenmanshipRating } from '../engine/imageEvaluator';

export interface PracticeAttempt {
  id: string;
  exerciseId: string;
  exerciseText: string;
  category: string;
  mode: PracticeMode;
  score: number;
  rating: PenmanshipRating;
  ratingColor: string;
  coverageScore: number;
  spillPenalty: number;
  slopePenalty: number;
  slopeAngle?: number;
  feedback: string;
  timestamp: number;
}

interface HistoryState {
  attempts: PracticeAttempt[];
  bestScores: Record<string, number>; // exerciseId -> highest score achieved

  // Actions
  recordAttempt: (attempt: Omit<PracticeAttempt, 'id'>) => PracticeAttempt;
  getBestScore: (exerciseId: string) => number;
  getAttemptsForExercise: (exerciseId: string) => PracticeAttempt[];
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      attempts: [],
      bestScores: {},

      recordAttempt: (attemptData) => {
        const id = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newAttempt: PracticeAttempt = { ...attemptData, id };

        set((state) => {
          const prevBest = state.bestScores[newAttempt.exerciseId] ?? 0;
          const newBest = Math.max(prevBest, newAttempt.score);

          return {
            attempts: [newAttempt, ...state.attempts],
            bestScores: {
              ...state.bestScores,
              [newAttempt.exerciseId]: newBest,
            },
          };
        });

        return newAttempt;
      },

      getBestScore: (exerciseId) => {
        return get().bestScores[exerciseId] ?? 0;
      },

      getAttemptsForExercise: (exerciseId) => {
        return get().attempts.filter((a) => a.exerciseId === exerciseId);
      },

      clearHistory: () => {
        set({ attempts: [], bestScores: {} });
      },
    }),
    {
      name: 'cursive-craft-history-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
