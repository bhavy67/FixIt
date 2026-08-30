import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-extract-images',
  slug: 'pdf-extract-images',
  name: 'Extract Images',
  tagline: 'Pull every embedded image out of a PDF at original resolution',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'image' },
  mode: 'local',
};
