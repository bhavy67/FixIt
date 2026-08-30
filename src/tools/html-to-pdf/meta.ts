import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'html-to-pdf',
  slug: 'html-to-pdf',
  name: 'HTML to PDF',
  tagline: 'Convert an HTML file to PDF. Text content and document structure are preserved.',
  category: 'text',
  input: { accepts: ['text'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'local',
};
