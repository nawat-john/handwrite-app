import type { SkFont } from '@shopify/react-native-skia';
import type { Stroke } from '../types/canvas';
import type { PracticeMode } from '../store/usePracticeStore';
import {
  generateTargetTextMask,
  generateUserStrokesMask,
  dilateMask,
} from './maskGenerator';
import { detectBaselineSlope } from './baselineDetector';

export type PenmanshipRating = 'Master Penman' | 'Proficient' | 'Developing' | 'Needs Practice';

export interface EvaluationResult {
  score: number;             // S_final: 0 - 100
  coverageScore: number;     // S_cov: 0 - 100
  spillPenalty: number;      // P_spill: 0 - 100
  slopePenalty: number;      // P_slope: 0 - 100 (Blank mode)
  slopeAngle?: number;       // In degrees
  rating: PenmanshipRating;
  ratingColor: string;
  feedback: string;
  timestamp: number;
}

export interface EvaluationOptions {
  strokes: Stroke[];
  targetText: string;
  font: SkFont;
  mode: PracticeMode;
  width?: number;
  height?: number;
  textX?: number;
  baseLineY?: number;
  textScale?: number;
}

/**
 * Executes the on-device image processing and evaluation pipeline.
 */
export function evaluateHandwriting(options: EvaluationOptions): EvaluationResult {
  const {
    strokes,
    targetText,
    font,
    mode,
    width = 1200,
    height = 500,
    textX = 60,
    baseLineY = 260,
    textScale = 1,
  } = options;

  const timestamp = Date.now();

  // Edge case: No strokes drawn
  if (!strokes || strokes.length === 0) {
    return {
      score: 0,
      coverageScore: 0,
      spillPenalty: 0,
      slopePenalty: 0,
      rating: 'Needs Practice',
      ratingColor: '#EF4444',
      feedback: 'No strokes drawn yet. Please write the text before evaluating.',
      timestamp,
    };
  }

  // 1. Generate Target Font Mask and User Stroke Mask
  const targetMask = generateTargetTextMask(targetText, font, textX, baseLineY, width, height, textScale);
  const userMask = generateUserStrokesMask(strokes, width, height);

  // Count active pixels
  let totalTargetPixels = 0;
  let totalUserPixels = 0;
  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    if (targetMask[i] === 1) totalTargetPixels++;
    if (userMask[i] === 1) totalUserPixels++;
  }

  if (totalTargetPixels === 0 || totalUserPixels === 0) {
    return {
      score: 0,
      coverageScore: 0,
      spillPenalty: 0,
      slopePenalty: 0,
      rating: 'Needs Practice',
      ratingColor: '#EF4444',
      feedback: 'Could not detect distinct letter marks. Try writing clearly with firmer pressure.',
      timestamp,
    };
  }

  // 2. Morphological Dilation for physiological penmanship tolerance
  const userDilated = dilateMask(userMask, width, height, 2);
  const targetDilated = dilateMask(targetMask, width, height, 3);

  // 3. Pixel Metrics Formulation (Section 5.2)
  // Coverage: S_cov = sum(U_dilated AND T) / sum(T) * 100
  let coveredTargetPixels = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (targetMask[i] === 1 && userDilated[i] === 1) {
      coveredTargetPixels++;
    }
  }
  const coverageScore = Math.min(100, Math.round((coveredTargetPixels / totalTargetPixels) * 1000) / 10);

  // Spill Penalty: P_spill = sum(U AND NOT T_dilated) / sum(U) * 100
  let spillUserPixels = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (userMask[i] === 1 && targetDilated[i] === 0) {
      spillUserPixels++;
    }
  }
  const spillPenalty = Math.min(100, Math.round((spillUserPixels / totalUserPixels) * 1000) / 10);

  // 4. Baseline Slope Deviation Penalty (P_slope)
  let slopePenalty = 0;
  let slopeAngle: number | undefined;

  if (mode === 'blank') {
    const slopeAnalysis = detectBaselineSlope(strokes);
    if (slopeAnalysis.isReliable) {
      slopePenalty = slopeAnalysis.slopePenalty;
      slopeAngle = slopeAnalysis.angleDegrees;
    }
  }

  // 5. Final Weighted Score Formulation (Section 5.2)
  let finalScore = 0;
  if (mode === 'trace') {
    // S_final = (S_cov * 0.75) + ((100 - P_spill) * 0.25)
    finalScore = (coverageScore * 0.75) + ((100 - spillPenalty) * 0.25);
  } else {
    // S_final = (S_cov * 0.50) + ((100 - P_spill) * 0.30) + ((100 - P_slope) * 0.20)
    finalScore = (coverageScore * 0.50) + ((100 - spillPenalty) * 0.30) + ((100 - slopePenalty) * 0.20);
  }

  const score = Math.max(0, Math.min(100, Math.round(finalScore)));

  // 6. Rating Scale & Visual Feedback (Section 5.3)
  let rating: PenmanshipRating;
  let ratingColor: string;

  if (score >= 90) {
    rating = 'Master Penman';
    ratingColor = '#10B981'; // Emerald Green
  } else if (score >= 75) {
    rating = 'Proficient';
    ratingColor = '#0EA5E9'; // Sky Blue
  } else if (score >= 60) {
    rating = 'Developing';
    ratingColor = '#F59E0B'; // Amber
  } else {
    rating = 'Needs Practice';
    ratingColor = '#EF4444'; // Rose Red
  }

  // 7. Contextual Feedback Generation
  let feedback = '';
  if (score >= 90) {
    feedback = 'Exceptional cursive fluency! Consistent slant and precise baseline adherence.';
  } else if (score >= 75) {
    if (spillPenalty > 20) {
      feedback = 'Good flow, but watch out for small overshoot or stray pen strokes.';
    } else {
      feedback = 'Proficient penmanship! Keep practicing to connect all letter ligatures seamlessly.';
    }
  } else if (score >= 60) {
    if (coverageScore < 60) {
      feedback = 'Focus on completing letter loops (like in l, e, h) and descending tails.';
    } else if (slopePenalty > 15) {
      feedback = 'Pay attention to the baseline; your writing is drifting at an angle.';
    } else {
      feedback = 'Developing nicely! Slow down your stroke speed to increase precision.';
    }
  } else {
    if (spillPenalty > 40) {
      feedback = 'High proportion of stray strokes outside the template. Focus on steady control.';
    } else {
      feedback = 'Keep practicing the letter shapes and following the 4-line guidelines closely.';
    }
  }

  return {
    score,
    coverageScore,
    spillPenalty,
    slopePenalty,
    slopeAngle,
    rating,
    ratingColor,
    feedback,
    timestamp,
  };
}
