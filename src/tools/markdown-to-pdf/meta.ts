import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'markdown-to-pdf',
  slug: 'markdown-to-pdf',
  name: 'Markdown to PDF',
  tagline: 'Convert Markdown files to a clean, readable PDF document.',
  category: 'text',
  input: { accepts: ['markdown', 'text'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'local',
};
