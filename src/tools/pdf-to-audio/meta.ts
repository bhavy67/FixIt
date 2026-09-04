import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-audio',
  slug: 'pdf-to-audio',
  name: 'Read PDF Aloud',
  tagline:
    'Preview your PDF with your browser’s text-to-speech, then export a clean transcript.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'text' },
  mode: 'local',
};
