import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-redact',
  slug: 'pdf-redact',
  name: 'Redact PDF',
  tagline: 'Permanently black out sensitive words and phrases',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'local',
};
