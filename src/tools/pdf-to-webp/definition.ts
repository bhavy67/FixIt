import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfToWebpOptions } from './options';
import { PdfToWebpOptionsForm } from './options-form';
import { processPdfToWebp } from './processor';

export const pdfToWebpTool: ToolDefinition<PdfToWebpOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfToWebpOptionsForm,
  process: processPdfToWebp,
};
