import type { ResizeFit } from './options';

export interface DestRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Compute the placement of a source image inside a destination canvas
 * for a given fit mode.
 *
 * - `contain`: preserve aspect, letterbox inside the destination.
 * - `cover`:   preserve aspect, fill the destination (overflow is cropped
 *              by the canvas boundary since we draw with the returned rect).
 * - `stretch`: ignore aspect and fill the destination exactly.
 */
export function computeDestRect(
  srcW: number,
  srcH: number,
  destW: number,
  destH: number,
  fit: ResizeFit,
): DestRect {
  if (srcW <= 0 || srcH <= 0 || destW <= 0 || destH <= 0) {
    return { x: 0, y: 0, w: destW, h: destH };
  }
  if (fit === 'stretch') {
    return { x: 0, y: 0, w: destW, h: destH };
  }

  const srcRatio = srcW / srcH;
  const destRatio = destW / destH;

  if (fit === 'contain') {
    if (srcRatio > destRatio) {
      const h = destW / srcRatio;
      return { x: 0, y: (destH - h) / 2, w: destW, h };
    }
    const w = destH * srcRatio;
    return { x: (destW - w) / 2, y: 0, w, h: destH };
  }

  // cover
  if (srcRatio > destRatio) {
    const w = destH * srcRatio;
    return { x: (destW - w) / 2, y: 0, w, h: destH };
  }
  const h = destW / srcRatio;
  return { x: 0, y: (destH - h) / 2, w: destW, h };
}
