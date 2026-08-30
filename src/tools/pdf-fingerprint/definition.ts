import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfFingerprintOptions } from './options';
import { processPdfFingerprint } from './processor';

export const pdfFingerprintTool: ToolDefinition<PdfFingerprintOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  process: processPdfFingerprint,
};
