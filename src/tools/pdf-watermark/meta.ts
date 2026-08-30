import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-watermark',
  slug: 'add-pdf-watermark',
  name: 'Add PDF Watermark',
  tagline: 'Stamp a diagonal text watermark on every page of a PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
