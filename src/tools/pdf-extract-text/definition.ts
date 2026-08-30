import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfExtractTextOptions } from './options';
import { processPdfExtractText } from './processor';

export const pdfExtractTextTool: ToolDefinition<PdfExtractTextOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfExtractText,
};
