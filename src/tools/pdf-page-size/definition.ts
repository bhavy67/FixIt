import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfPageSizeOptions } from './options';
import { processPdfPageSize } from './processor';

export const pdfPageSizeTool: ToolDefinition<PdfPageSizeOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfPageSize,
};
