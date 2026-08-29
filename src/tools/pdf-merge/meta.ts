import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-merge',
  slug: 'merge-pdf',
  name: 'Merge PDF',
  tagline: 'Combine multiple PDFs into one file, in the order you dropped them.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 2 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
