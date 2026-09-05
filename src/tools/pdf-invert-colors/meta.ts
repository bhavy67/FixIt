import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-invert-colors',
  slug: 'pdf-invert-colors',
  name: 'Invert PDF Colors',
  tagline: 'Apply dark mode, grayscale, or sepia to every page of a PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
