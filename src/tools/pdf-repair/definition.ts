import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfRepairOptions } from './options';
import { processPdfRepair } from './processor';

export const pdfRepairTool: ToolDefinition<PdfRepairOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfRepair,
};
