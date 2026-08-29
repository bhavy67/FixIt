import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-metadata-remover',
  slug: 'remove-pdf-metadata',
  name: 'PDF Metadata Remover',
  tagline: 'Strip all author, title, and hidden metadata from a PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
