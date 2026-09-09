import { create } from 'zustand';
import type { Stroke, Point } from '../types/canvas';

export type PracticeMode = 'trace' | 'blank';

export interface GuidelineMetrics {
  xHeight: number; // 40px (mid height)
  ascenderHeight: number; // 40px (1.0 * xHeight)
  descenderDepth: number; // 32px (0.8 * xHeight)
  lineSpacing: number; // 112px total
}

export const DEFAULT_GUIDELINE_METRICS: GuidelineMetrics = {
  xHeight: 40,
  ascenderHeight: 40,
  descenderDepth: 32,
  lineSpacing: 112,
};

import type { EvaluationResult } from '../engine/imageEvaluator';

interface PracticeState {
  strokes: Stroke[];
  currentPoints: Point[];
  strokeWidth: number;
  strokeColor: string;
  palmRejectionEnabled: boolean;
  mode: PracticeMode;
  currentText: string;
  guidelineBaseY: number;
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;

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
  setMode: (mode: PracticeMode) => void;
  setCurrentText: (text: string) => void;
  setGuidelineBaseY: (y: number) => void;
  setEvaluationResult: (result: EvaluationResult | null) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;
}

export const usePracticeStore = create<PracticeState>((set) => ({
  strokes: [],
  currentPoints: [],
  strokeWidth: 3.8,
  strokeColor: '#1E293B',
  palmRejectionEnabled: true,
  mode: 'trace',
  currentText: 'The quick brown fox jumps over the lazy dog',
  guidelineBaseY: 260,
  evaluationResult: null,
  isEvaluating: false,

  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      currentPoints: [],
      // Invalidate previous evaluation if new strokes added
      evaluationResult: null,
    })),

  undo: () =>
    set((state) => ({
      strokes: state.strokes.slice(0, -1),
      evaluationResult: null,
    })),

  clearCanvas: () =>
    set(() => ({
      strokes: [],
      currentPoints: [],
      evaluationResult: null,
    })),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setStrokeColor: (color) => set({ strokeColor: color }),

  setPalmRejection: (enabled) => set({ palmRejectionEnabled: enabled }),

  togglePalmRejection: () =>
    set((state) => ({ palmRejectionEnabled: !state.palmRejectionEnabled })),

  setCurrentPoints: (points) => set({ currentPoints: points }),

  clearCurrentPoints: () => set({ currentPoints: [] }),

  setMode: (mode) => set({ mode, evaluationResult: null }),

  setCurrentText: (text) => set({ currentText: text, evaluationResult: null }),

  setGuidelineBaseY: (y) => set({ guidelineBaseY: y }),

  setEvaluationResult: (result) => set({ evaluationResult: result }),

  setIsEvaluating: (isEvaluating) => set({ isEvaluating }),
}));
