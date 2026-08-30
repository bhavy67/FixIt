import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-page-size',
  slug: 'pdf-page-size',
  name: 'PDF Page Size Checker',
  tagline: 'Inspect the width, height, and paper format of every page in a PDF.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'json' },
  mode: 'worker',
};
