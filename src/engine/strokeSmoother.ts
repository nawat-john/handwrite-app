import { Skia, SkPath } from '@shopify/react-native-skia';
import type { Point } from '../types/canvas';

/**
 * Filter out high-frequency jitter by dropping points that are too close
 * to the previous accepted point (default distance < 3px).
 */
export function downsamplePoints(points: Point[], minDistance: number = 3): Point[] {
  if (points.length <= 2) return points;

  const minDistSq = minDistance * minDistance;
  const result: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (dx * dx + dy * dy >= minDistSq) {
      result.push(curr);
    }
  }

  // Always retain the terminal point to preserve stroke endings
  result.push(points[points.length - 1]);
  return result;
}

/**
 * Interpolates discrete touch points into a smooth Skia Path using Catmull-Rom
 * to Cubic Bézier conversion.
 */
export function smoothPointsToPath(rawPoints: Point[], strokeWidth: number = 3.8): SkPath {
  const path = Skia.Path.Make();
  if (!rawPoints || rawPoints.length === 0) {
    return path;
  }

  const points = downsamplePoints(rawPoints, 3);

  // Case 1: Single point (tap / dot)
  if (points.length === 1) {
    const p = points[0];
    const radius = Math.max(1, strokeWidth / 3);
    path.addCircle(p.x, p.y, radius);
    return path;
  }

  // Case 2: Exactly 2 points (straight line segment)
  if (points.length === 2) {
    path.moveTo(points[0].x, points[0].y);
    path.lineTo(points[1].x, points[1].y);
    return path;
  }

  // Case 3: 3 or more points (Catmull-Rom to Cubic Bézier Spline)
  path.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : { x: 2 * points[0].x - points[1].x, y: 2 * points[0].y - points[1].y };
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : { x: 2 * points[i + 1].x - points[i].x, y: 2 * points[i + 1].y - points[i].y };

    // Catmull-Rom control points mapped to Cubic Bézier
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path.cubicTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  return path;
}
