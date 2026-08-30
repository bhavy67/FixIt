import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-encrypt',
  slug: 'encrypt-pdf',
  name: 'Encrypt PDF',
  tagline: 'Password-protect a PDF so only authorised readers can open it.',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
