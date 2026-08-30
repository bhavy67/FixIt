import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfPageNumbersOptions } from './options';
import { PdfPageNumbersOptionsForm } from './options-form';
import { processPdfPageNumbers } from './processor';

export const pdfPageNumbersTool: ToolDefinition<PdfPageNumbersOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfPageNumbersOptionsForm,
  process: processPdfPageNumbers,
};
