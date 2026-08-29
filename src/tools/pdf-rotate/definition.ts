import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfRotateOptions } from './options';
import { PdfRotateOptionsForm } from './options-form';
import { processPdfRotate } from './processor';

export const pdfRotateTool: ToolDefinition<PdfRotateOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfRotateOptionsForm,
  process: processPdfRotate,
};
