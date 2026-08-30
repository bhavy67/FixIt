import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'jpg-to-pdf',
  slug: 'jpg-to-pdf',
  name: 'JPG to PDF',
  tagline: 'Wrap one or more JPEG images into a PDF, one image per page.',
  category: 'pdf',
  input: { accepts: ['image'], minFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
