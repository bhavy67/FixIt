import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-rotate',
  slug: 'rotate-pdf',
  name: 'Rotate PDF',
  tagline: 'Rotate all pages or specific pages by 90°, 180°, or 270°.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
