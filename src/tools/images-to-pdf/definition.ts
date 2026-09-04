import { ImageToPdfOptionsForm } from '@/core/image-to-pdf-options-form';
import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type ImagesToPdfOptions } from './options';
import { processImagesToPdf } from './processor';

export const imagesToPdfTool: ToolDefinition<ImagesToPdfOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: ImageToPdfOptionsForm,
  process: processImagesToPdf,
};
