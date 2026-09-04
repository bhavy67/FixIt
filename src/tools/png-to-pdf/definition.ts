import { ImageToPdfOptionsForm } from '@/core/image-to-pdf-options-form';
import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PngToPdfOptions } from './options';
import { processPngToPdf } from './processor';

export const pngToPdfTool: ToolDefinition<PngToPdfOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: ImageToPdfOptionsForm,
  process: processPngToPdf,
};
