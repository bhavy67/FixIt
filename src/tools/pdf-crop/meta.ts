import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-crop',
  slug: 'pdf-crop',
  name: 'Crop PDF',
  tagline: 'Trim page margins to crop every page to a new size',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
