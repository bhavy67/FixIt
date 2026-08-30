import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-to-zip',
  slug: 'pdf-to-zip',
  name: 'PDF to ZIP',
  tagline: 'Bundle multiple PDFs into a single ZIP archive — fully local, zero upload.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 2, maxFiles: 20 },
  output: { kind: 'zip' },
  mode: 'local',
};
