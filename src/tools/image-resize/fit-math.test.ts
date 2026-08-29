import { describe, expect, it } from 'vitest';
import { computeDestRect } from './fit-math';

describe('computeDestRect', () => {
  it('stretch fills the destination exactly', () => {
    expect(computeDestRect(100, 200, 300, 400, 'stretch')).toEqual({
      x: 0,
      y: 0,
      w: 300,
      h: 400,
    });
  });

  it('contain letterboxes a wide source vertically', () => {
    // 200x100 (ratio 2:1) inside 100x100
    const r = computeDestRect(200, 100, 100, 100, 'contain');
    expect(r.w).toBe(100);
    expect(r.h).toBe(50);
    expect(r.x).toBe(0);
    expect(r.y).toBe(25);
  });

  it('contain letterboxes a tall source horizontally', () => {
    // 100x200 (ratio 1:2) inside 100x100
    const r = computeDestRect(100, 200, 100, 100, 'contain');
    expect(r.w).toBe(50);
    expect(r.h).toBe(100);
    expect(r.x).toBe(25);
    expect(r.y).toBe(0);
  });

  it('cover fills the destination and overflows for a wide source', () => {
    // 200x100 into 100x100 with cover → h=100, w=200, x=-50, y=0
    const r = computeDestRect(200, 100, 100, 100, 'cover');
    expect(r.w).toBe(200);
    expect(r.h).toBe(100);
    expect(r.x).toBe(-50);
    expect(r.y).toBe(0);
  });

  it('cover fills the destination and overflows for a tall source', () => {
    const r = computeDestRect(100, 200, 100, 100, 'cover');
    expect(r.w).toBe(100);
    expect(r.h).toBe(200);
    expect(r.x).toBe(0);
    expect(r.y).toBe(-50);
  });

  it('returns the destination unchanged when inputs are invalid', () => {
    expect(computeDestRect(0, 100, 50, 50, 'contain')).toEqual({ x: 0, y: 0, w: 50, h: 50 });
    expect(computeDestRect(100, 0, 50, 50, 'cover')).toEqual({ x: 0, y: 0, w: 50, h: 50 });
  });

  it('handles equal ratios by matching destination exactly', () => {
    expect(computeDestRect(200, 100, 400, 200, 'contain')).toEqual({
      x: 0,
      y: 0,
      w: 400,
      h: 200,
    });
    expect(computeDestRect(200, 100, 400, 200, 'cover')).toEqual({
      x: 0,
      y: 0,
      w: 400,
      h: 200,
    });
  });
});
