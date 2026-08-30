import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-sign',
  slug: 'pdf-sign',
  name: 'Sign PDF',
  tagline: 'Draw and place a handwritten signature on your PDF',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'local',
};
