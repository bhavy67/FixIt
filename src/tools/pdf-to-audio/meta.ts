import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-audio',
  slug: 'pdf-to-audio',
  name: 'PDF to Audio',
  tagline: "Listen to any PDF read aloud using your browser's built-in speech engine.",
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'text' },
  mode: 'local',
};
