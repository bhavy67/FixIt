import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-metadata-viewer',
  slug: 'pdf-metadata',
  name: 'PDF Metadata Viewer',
  tagline: 'Inspect title, author, page count, and hidden metadata in any PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'json' },
  mode: 'worker',
};
