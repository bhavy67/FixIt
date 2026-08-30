import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-unlock',
  slug: 'unlock-pdf',
  name: 'Unlock PDF',
  tagline: 'Remove the password and restrictions from a PDF you own.',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
