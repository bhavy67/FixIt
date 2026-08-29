import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-split',
  slug: 'split-pdf',
  name: 'Split PDF',
  tagline: 'Split a PDF into individual pages or custom page ranges.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf', multiple: true },
  mode: 'worker',
};
