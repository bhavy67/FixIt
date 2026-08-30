import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfCompareOptions } from './options';
import { PdfCompareOptionsForm } from './options-form';
import { processPdfCompare } from './processor';

export const pdfCompareTool: ToolDefinition<PdfCompareOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfCompareOptionsForm,
  process: processPdfCompare,
};
