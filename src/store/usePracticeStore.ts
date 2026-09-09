import { create } from 'zustand';
import type { Stroke, Point } from '../types/canvas';

interface PracticeState {
  strokes: Stroke[];
  currentPoints: Point[];
  strokeWidth: number;
  strokeColor: string;
  palmRejectionEnabled: boolean;

  // Actions
  addStroke: (stroke: Stroke) => void;
  undo: () => void;
  clearCanvas: () => void;
  setStrokeWidth: (width: number) => void;
  setStrokeColor: (color: string) => void;
  setPalmRejection: (enabled: boolean) => void;
  togglePalmRejection: () => void;
  setCurrentPoints: (points: Point[]) => void;
  clearCurrentPoints: () => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  strokes: [],
  currentPoints: [],
  strokeWidth: 3.8,
  strokeColor: '#1E293B',
  palmRejectionEnabled: true,

  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      currentPoints: [],
    })),

  undo: () =>
    set((state) => ({
      strokes: state.strokes.slice(0, -1),
    })),

  clearCanvas: () =>
    set(() => ({
      strokes: [],
      currentPoints: [],
    })),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setStrokeColor: (color) => set({ strokeColor: color }),

  setPalmRejection: (enabled) => set({ palmRejectionEnabled: enabled }),

  togglePalmRejection: () =>
    set((state) => ({ palmRejectionEnabled: !state.palmRejectionEnabled })),

  setCurrentPoints: (points) => set({ currentPoints: points }),

  clearCurrentPoints: () => set({ currentPoints: [] }),
}));
