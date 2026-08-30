import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-fingerprint',
  slug: 'pdf-fingerprint',
  name: 'PDF Fingerprint',
  tagline: 'Generate SHA-256 & SHA-1 checksums to verify a PDF has not been tampered with.',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'json' },
  mode: 'local',
};
