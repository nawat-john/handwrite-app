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
