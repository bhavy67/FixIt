import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-compress',
  slug: 'compress-pdf',
  name: 'Compress PDF',
  tagline: 'Reduce PDF file size by removing redundant data and metadata.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
