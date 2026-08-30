import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-png',
  slug: 'pdf-to-png',
  name: 'PDF to PNG',
  tagline: 'Convert every PDF page to a lossless PNG image.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'image', multiple: true },
  mode: 'local',
};
