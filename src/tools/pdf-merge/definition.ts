import type { ToolDefinition } from '@/core/tool-types';
import { DEFAULT_OPTIONS, type PdfMergeOptions } from './options';
import { processPdfMerge } from './processor';

export const pdfMergeTool: ToolDefinition<PdfMergeOptions> = {
  id: 'pdf-merge',
  slug: 'merge-pdf',
  name: 'Merge PDF',
  tagline: 'Combine multiple PDFs into one file, in the order you dropped them.',
  category: 'pdf',
  input: { accepts: ['pdf'], minFiles: 2 },
  output: { kind: 'pdf' },
  mode: 'worker',
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfMerge,
};
