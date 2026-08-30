import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-jpg',
  slug: 'pdf-to-jpg',
  name: 'PDF to JPG',
  tagline: 'Convert every PDF page to a high-quality JPEG image.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'image', multiple: true },
  mode: 'local',
};
