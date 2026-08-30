import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-webp',
  slug: 'pdf-to-webp',
  name: 'PDF to WebP',
  tagline: 'Convert every PDF page to a compact WebP image.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'image', multiple: true },
  mode: 'local',
};
