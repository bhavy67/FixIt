import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-extract-pages',
  slug: 'extract-pdf-pages',
  name: 'Extract PDF Pages',
  tagline: 'Keep only the pages you need and save them as a new PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
