import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-repair',
  slug: 'repair-pdf',
  name: 'PDF Repair',
  tagline: 'Re-parse and rebuild a corrupted or malformed PDF to restore it.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
