import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'epub-to-pdf',
  slug: 'epub-to-pdf',
  name: 'EPUB to PDF',
  tagline: 'Convert EPUB or ZIP-packaged eBook files to a readable PDF document.',
  category: 'text',
  input: { accepts: ['zip'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'local',
};
