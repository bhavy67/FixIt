import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfMetaRemoveOptions } from './options';
import { processPdfMetaRemove } from './processor';

export const pdfMetaRemoverTool: ToolDefinition<PdfMetaRemoveOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfMetaRemove,
};
