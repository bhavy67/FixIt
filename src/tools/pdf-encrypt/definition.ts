import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfEncryptOptions } from './options';
import { PdfEncryptOptionsForm } from './options-form';
import { processPdfEncrypt } from './processor';

export const pdfEncryptTool: ToolDefinition<PdfEncryptOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfEncryptOptionsForm,
  process: processPdfEncrypt,
};
