import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-flatten',
  slug: 'flatten-pdf',
  name: 'Flatten PDF',
  tagline: 'Make a PDF permanently non-editable by flattening all form fields and annotations.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
