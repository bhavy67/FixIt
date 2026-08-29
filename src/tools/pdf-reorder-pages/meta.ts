import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-reorder-pages',
  slug: 'reorder-pdf-pages',
  name: 'Reorder PDF Pages',
  tagline: 'Rearrange PDF pages into any order you choose.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
