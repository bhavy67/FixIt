import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfFormFillOptions } from './options';
import { PdfFormFillOptionsForm } from './options-form';
import { processPdfFormFill } from './processor';

export const pdfFormFillTool: ToolDefinition<PdfFormFillOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfFormFillOptionsForm,
  process: processPdfFormFill,
};
