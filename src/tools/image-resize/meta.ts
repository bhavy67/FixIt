import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'image-resize',
  slug: 'resize-image',
  name: 'Image Resize',
  tagline: 'Change dimensions, pick a format, keep it sharp.',
  category: 'image',
  input: { accepts: ['image'] },
  output: { kind: 'image', multiple: true },
  mode: 'local',
};
