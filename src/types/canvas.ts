import type { SkPath } from '@shopify/react-native-skia';

export interface Point {
  x: number;
  y: number;
  force?: number;
  timestamp?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  path: SkPath;
  strokeWidth: number;
  color: string;
  isStylus?: boolean;
}

// LearningCurvePro at 128px has x-height 40 / ascender 80 / descender 32,
// matching DEFAULT_GUIDELINE_METRICS exactly.
export const BASE_FONT_SIZE = 128;
export const TEXT_START_X = 60;

// Shrinks text (and guidelines) so the whole exercise fits on one line.
export function fitTextScale(textWidth: number, canvasWidth: number): number {
  if (textWidth <= 0) return 1;
  return Math.min(1, (canvasWidth - 2 * TEXT_START_X) / textWidth);
}

export interface StrokeWidthOption {
  id: string;
  label: string;
  value: number;
}

export const STROKE_WIDTH_OPTIONS: StrokeWidthOption[] = [
  { id: 'fine', label: 'Fine (2.5px)', value: 2.5 },
  { id: 'standard', label: 'Standard (3.8px)', value: 3.8 },
  { id: 'bold', label: 'Bold (5.5px)', value: 5.5 },
];
