const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export function formatBytes(bytes: number, precision = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1000) return `${bytes} B`;
  let value = bytes;
  let idx = 0;
  while (value >= 1000 && idx < UNITS.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(precision)} ${UNITS[idx]}`;
}
