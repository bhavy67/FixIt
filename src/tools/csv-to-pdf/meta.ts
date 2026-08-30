import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'csv-to-pdf',
  slug: 'csv-to-pdf',
  name: 'CSV to PDF',
  tagline: 'Convert a CSV spreadsheet to a formatted PDF table.',
  category: 'data',
  input: { accepts: ['csv'], minFiles: 1, maxFiles: 1 },
  output: { kind: 'pdf' },
  mode: 'worker',
};
