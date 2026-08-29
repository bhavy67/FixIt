/**
 * Parse a human-readable page range string into sorted, unique 0-based indices.
 * Input: "1", "1,3,5-7", "all" (case-insensitive, empty → all pages)
 */
export function parsePages(input: string, total: number): number[] {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === 'all' || trimmed === '') {
    return Array.from({ length: total }, (_, i) => i);
  }
  const pages = new Set<number>();
  for (const part of trimmed.split(',')) {
    const seg = part.trim();
    if (seg.includes('-')) {
      const [a, b] = seg.split('-').map(Number);
      const from = Math.max(1, a ?? 1);
      const to = Math.min(total, b ?? total);
      for (let i = from; i <= to; i++) pages.add(i - 1);
    } else {
      const n = Number(seg);
      if (Number.isFinite(n) && n >= 1 && n <= total) pages.add(n - 1);
    }
  }
  return [...pages].sort((a, b) => a - b);
}
