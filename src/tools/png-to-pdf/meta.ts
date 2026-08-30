import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'png-to-pdf',
  slug: 'png-to-pdf',
  name: 'PNG to PDF',
  tagline: 'Wrap one or more PNG images into a PDF, one image per page.',
  category: 'pdf',
  input: { accepts: ['image'], minFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
