import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'txt-to-pdf',
  slug: 'txt-to-pdf',
  name: 'TXT to PDF',
  tagline: 'Convert a plain text file to a clean, readable PDF document.',
  category: 'text',
  input: { accepts: ['text'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
