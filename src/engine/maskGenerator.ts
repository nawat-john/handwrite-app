import { Skia, PaintStyle, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';
import type { SkFont, SkSurface } from '@shopify/react-native-skia';
import type { Stroke } from '../types/canvas';

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  activePixels: number;
}

/**
 * Creates an in-memory Skia surface for offscreen rasterization.
 */
export function createOffscreenSurface(width: number, height: number): SkSurface {
  const surface = Skia.Surface.Make(width, height) ?? Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    throw new Error(`Failed to create offscreen Skia surface (${width}x${height})`);
  }
  return surface;
}

/**
 * Renders target text using the standard cursive font into an 8-bit binary mask.
 */
export function generateTargetTextMask(
  text: string,
  font: SkFont,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number = 1
): Uint8Array {
  const surface = createOffscreenSurface(width, height);
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));

  const paint = Skia.Paint();
  paint.setColor(Skia.Color('#000000'));
  paint.setAntiAlias(true);

  // Same transform as TracingGhost: scale around the baseline start point
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(scale, scale);
  canvas.drawText(text, 0, 0, paint, font);
  canvas.restore();
  surface.flush();

  const image = surface.makeImageSnapshot();
  const rawPixels = image.readPixels();
  const mask = new Uint8Array(width * height);

  if (rawPixels) {
    const totalPixels = width * height;
    for (let i = 0; i < totalPixels; i++) {
      // Check alpha channel (every 4th byte in RGBA buffer)
      if (rawPixels[i * 4 + 3] > 64) {
        mask[i] = 1;
      }
    }
  }

  return mask;
}

/**
 * Renders all completed user strokes into an 8-bit binary mask.
 */
export function generateUserStrokesMask(
  strokes: Stroke[],
  width: number,
  height: number
): Uint8Array {
  const surface = createOffscreenSurface(width, height);
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));

  strokes.forEach((stroke) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#000000'));
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(stroke.strokeWidth);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    paint.setAntiAlias(true);

    canvas.drawPath(stroke.path, paint);
  });

  surface.flush();

  const image = surface.makeImageSnapshot();
  const rawPixels = image.readPixels();
  const mask = new Uint8Array(width * height);

  if (rawPixels) {
    const totalPixels = width * height;
    for (let i = 0; i < totalPixels; i++) {
      if (rawPixels[i * 4 + 3] > 64) {
        mask[i] = 1;
      }
    }
  }

  return mask;
}

/**
 * Morphological dilation to expand active mask edges by a given pixel radius (default 2px),
 * allowing natural tolerance for penmanship assessment.
 */
export function dilateMask(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number = 2
): Uint8Array {
  const dilated = new Uint8Array(mask.length);
  dilated.set(mask);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] === 1) {
        const minY = Math.max(0, y - radius);
        const maxY = Math.min(height - 1, y + radius);
        const minX = Math.max(0, x - radius);
        const maxX = Math.min(width - 1, x + radius);

        for (let dy = minY; dy <= maxY; dy++) {
          const rowOffset = dy * width;
          for (let dx = minX; dx <= maxX; dx++) {
            dilated[rowOffset + dx] = 1;
          }
        }
      }
    }
  }

  return dilated;
}

/**
 * Calculates the bounding box of active pixels within a binary mask.
 */
export function getBoundingBox(
  mask: Uint8Array,
  width: number,
  height: number
): BoundingBox {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let activePixels = 0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (mask[rowOffset + x] === 1) {
        activePixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (activePixels === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, activePixels: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    activePixels,
  };
}
