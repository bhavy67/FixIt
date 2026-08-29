import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-delete-pages',
  slug: 'delete-pdf-pages',
  name: 'Delete PDF Pages',
  tagline: 'Remove unwanted pages from a PDF and save the rest.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
