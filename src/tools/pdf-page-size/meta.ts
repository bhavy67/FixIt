import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-page-size',
  slug: 'pdf-page-size',
  name: 'PDF Page Size',
  tagline: 'Inspect the size of every page, or normalise all pages to a standard format.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
