import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfMergeOptions } from './options';
import { processPdfMerge } from './processor';

export const pdfMergeTool: ToolDefinition<PdfMergeOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfMerge,
};
