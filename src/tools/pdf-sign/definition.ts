import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfSignOptions } from './options';
import { processPdfSign } from './processor';
import { PdfSignOptionsForm } from './options-form';

export const pdfSignTool: ToolDefinition<PdfSignOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfSignOptionsForm,
  process: processPdfSign,
};
