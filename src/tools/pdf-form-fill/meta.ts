import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-form-fill',
  slug: 'fill-pdf-form',
  name: 'Fill PDF Form',
  tagline: 'Fill form fields in a PDF and flatten it so answers are locked in permanently.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
