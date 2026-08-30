import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-headers-footers',
  slug: 'pdf-headers-footers',
  name: 'PDF Headers & Footers',
  tagline: 'Add custom text headers and footers to every page. Use {page} and {total} as tokens.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
