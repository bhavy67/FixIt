import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfCompressOptions } from './options';
import { PdfCompressOptionsForm } from './options-form';
import { processPdfCompress } from './processor';

export const pdfCompressTool: ToolDefinition<PdfCompressOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfCompressOptionsForm,
  process: processPdfCompress,
};
