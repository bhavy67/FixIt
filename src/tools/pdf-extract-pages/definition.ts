import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfExtractOptions } from './options';
import { PdfExtractOptionsForm } from './options-form';
import { processPdfExtract } from './processor';

export const pdfExtractPagesTool: ToolDefinition<PdfExtractOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfExtractOptionsForm,
  process: processPdfExtract,
};
