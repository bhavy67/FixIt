import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfOcrOptions } from './options';
import { PdfOcrOptionsForm } from './options-form';
import { processPdfOcr } from './processor';

export const pdfOcrTool: ToolDefinition<PdfOcrOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfOcrOptionsForm,
  process: processPdfOcr,
};
