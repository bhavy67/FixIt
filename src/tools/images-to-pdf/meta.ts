import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'images-to-pdf',
  slug: 'images-to-pdf',
  name: 'Images to PDF',
  tagline: 'Combine multiple images into a single PDF, one image per page.',
  category: 'pdf',
  input: { accepts: ['image'], minFiles: 2 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
