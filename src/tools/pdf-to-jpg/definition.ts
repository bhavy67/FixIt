import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfToJpgOptions } from './options';
import { PdfToJpgOptionsForm } from './options-form';
import { processPdfToJpg } from './processor';

export const pdfToJpgTool: ToolDefinition<PdfToJpgOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfToJpgOptionsForm,
  process: processPdfToJpg,
};
