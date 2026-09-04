import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-encrypt',
  slug: 'pdf-encrypt',
  name: 'Encrypt PDF',
  tagline: 'Password-protect your PDF — recipients must enter the password to open it',
  category: 'pdf-security',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 10 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
