import type { Stroke, Point } from '../types/canvas';

export interface BaselineAnalysis {
  slope: number;
  intercept: number;
  angleDegrees: number;
  slopePenalty: number;
  isReliable: boolean;
  sampleCount: number;
}

/**
 * Evaluates the baseline slope of handwriting using Ordinary Least Squares linear
 * regression on the bottom-most points of the strokes.
 *
 * Angle = |arctan(m)| * (180 / PI)
 * P_slope = min(100, Angle * 5)
 */
export function detectBaselineSlope(strokes: Stroke[]): BaselineAnalysis {
  if (!strokes || strokes.length === 0) {
    return { slope: 0, intercept: 0, angleDegrees: 0, slopePenalty: 0, isReliable: false, sampleCount: 0 };
  }

  // Collect all points across strokes
  const allPoints: Point[] = [];
  strokes.forEach((stroke) => {
    stroke.points.forEach((pt) => allPoints.push(pt));
  });

  if (allPoints.length < 5) {
    return { slope: 0, intercept: 0, angleDegrees: 0, slopePenalty: 0, isReliable: false, sampleCount: allPoints.length };
  }

  // Determine horizontal bounds
  let minX = Infinity;
  let maxX = -Infinity;
  allPoints.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
  });

  const rangeX = maxX - minX;
  if (rangeX < 40) {
    // Handwriting spans too little horizontal distance to reliably determine tilt
    return { slope: 0, intercept: 0, angleDegrees: 0, slopePenalty: 0, isReliable: false, sampleCount: allPoints.length };
  }

  // Partition into column buckets (15px each) and extract lowest (maximum Y) baseline points
  const bucketSize = 15;
  const numBuckets = Math.ceil(rangeX / bucketSize);
  const buckets: Point[][] = Array.from({ length: numBuckets }, () => []);

  allPoints.forEach((p) => {
    const bucketIdx = Math.min(numBuckets - 1, Math.max(0, Math.floor((p.x - minX) / bucketSize)));
    buckets[bucketIdx].push(p);
  });

  // Extract baseline sample point per bucket
  const baselineSamples: { x: number; y: number }[] = [];
  buckets.forEach((pts) => {
    if (pts.length > 0) {
      // Find lowest point in bucket
      let maxYPoint = pts[0];
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].y > maxYPoint.y) {
          maxYPoint = pts[i];
        }
      }
      baselineSamples.push({ x: maxYPoint.x, y: maxYPoint.y });
    }
  });

  const N = baselineSamples.length;
  if (N < 3) {
    return { slope: 0, intercept: 0, angleDegrees: 0, slopePenalty: 0, isReliable: false, sampleCount: N };
  }

  // Ordinary Least Squares Linear Regression
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < N; i++) {
    const { x, y } = baselineSamples[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator = N * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-6) {
    return { slope: 0, intercept: sumY / N, angleDegrees: 0, slopePenalty: 0, isReliable: true, sampleCount: N };
  }

  const slope = (N * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / N;

  // Convert slope to degrees
  const angleDegrees = Math.abs(Math.atan(slope)) * (180 / Math.PI);
  // Penalty formulation from Section 5.2: P_slope = min(100, Angle * 5)
  const slopePenalty = Math.min(100, Math.round(angleDegrees * 5 * 10) / 10);

  return {
    slope,
    intercept,
    angleDegrees: Math.round(angleDegrees * 100) / 100,
    slopePenalty,
    isReliable: true,
    sampleCount: N,
  };
}
