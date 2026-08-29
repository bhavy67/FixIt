import { describe, expect, it } from 'vitest';
import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
  it('formats bytes under 1000 as B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(999)).toBe('999 B');
  });

  it('formats KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
  });

  it('formats MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(2.4 * 1024 * 1024)).toBe('2.4 MB');
  });

  it('formats GB', () => {
    expect(formatBytes(3 * 1024 ** 3)).toBe('3.0 GB');
  });

  it('handles invalid values', () => {
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(NaN)).toBe('—');
  });

  it('honors precision', () => {
    expect(formatBytes(1500, 0)).toBe('1 KB');
    expect(formatBytes(1500, 2)).toBe('1.46 KB');
  });
});
