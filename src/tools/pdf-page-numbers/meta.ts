import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-page-numbers',
  slug: 'add-pdf-page-numbers',
  name: 'Add PDF Page Numbers',
  tagline: 'Add page numbers to every page of a PDF at a position you choose.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
