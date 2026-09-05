import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-extract-text',
  slug: 'extract-pdf-text',
  name: 'Extract PDF Text',
  tagline: 'Copy all text from a PDF into a plain .txt file — no formatting, just words.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'text' },
  mode: 'worker',
};
