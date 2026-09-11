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
import type { ExerciseCategory, ExerciseItem } from '../types/curriculum';
import {
  ALL_EXERCISES,
  getExercisesByCategory,
  getNextExercise,
  getPrevExercise,
} from '../data/exercises';

interface PracticeState {
  strokes: Stroke[];
  currentPoints: Point[];
  strokeWidth: number;
  strokeColor: string;
  palmRejectionEnabled: boolean;
  mode: PracticeMode;
  currentText: string;
  guidelineBaseY: number;
  canvasSize: { width: number; height: number };
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;

  // Curriculum State
  currentExercise: ExerciseItem;
  selectedCategory: ExerciseCategory;
  completedExerciseIds: string[];

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
  setCanvasSize: (size: { width: number; height: number }) => void;
  setEvaluationResult: (result: EvaluationResult | null) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;

  // Curriculum Actions
  selectExercise: (exercise: ExerciseItem) => void;
  selectCategory: (category: ExerciseCategory) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  markExerciseCompleted: (exerciseId: string) => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  strokes: [],
  currentPoints: [],
  strokeWidth: 3.8,
  strokeColor: '#1E293B',
  palmRejectionEnabled: true,
  mode: 'trace',
  currentText: ALL_EXERCISES[0].text,
  guidelineBaseY: 260,
  canvasSize: { width: 1200, height: 600 },
  evaluationResult: null,
  isEvaluating: false,

  currentExercise: ALL_EXERCISES[0],
  selectedCategory: 'alphabet',
  completedExerciseIds: [],

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

  setCanvasSize: (canvasSize) => set({ canvasSize }),

  setEvaluationResult: (result) => set({ evaluationResult: result }),

  setIsEvaluating: (isEvaluating) => set({ isEvaluating }),

  selectExercise: (exercise) =>
    set({
      currentExercise: exercise,
      currentText: exercise.text,
      selectedCategory: exercise.category,
      strokes: [],
      currentPoints: [],
      evaluationResult: null,
    }),

  selectCategory: (category) => {
    const list = getExercisesByCategory(category);
    if (list.length > 0) {
      set({
        selectedCategory: category,
        currentExercise: list[0],
        currentText: list[0].text,
        strokes: [],
        currentPoints: [],
        evaluationResult: null,
      });
    }
  },

  nextExercise: () => {
    const current = get().currentExercise;
    const next = getNextExercise(current.id);
    set({
      currentExercise: next,
      currentText: next.text,
      selectedCategory: next.category,
      strokes: [],
      currentPoints: [],
      evaluationResult: null,
    });
  },

  prevExercise: () => {
    const current = get().currentExercise;
    const prev = getPrevExercise(current.id);
    set({
      currentExercise: prev,
      currentText: prev.text,
      selectedCategory: prev.category,
      strokes: [],
      currentPoints: [],
      evaluationResult: null,
    });
  },

  markExerciseCompleted: (exerciseId) =>
    set((state) => {
      if (state.completedExerciseIds.includes(exerciseId)) {
        return state;
      }
      return { completedExerciseIds: [...state.completedExerciseIds, exerciseId] };
    }),
}));
