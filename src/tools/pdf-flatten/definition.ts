import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfFlattenOptions } from './options';
import { processPdfFlatten } from './processor';

export const pdfFlattenTool: ToolDefinition<PdfFlattenOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfFlatten,
};
