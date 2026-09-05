import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-compare',
  slug: 'compare-pdf',
  name: 'PDF Compare',
  tagline: 'Compare two PDFs side by side and highlight every difference.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 2, maxFiles: 2 },
  output: { kind: 'image', multiple: true },
  mode: 'worker',
};
