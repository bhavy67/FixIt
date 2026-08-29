import type { ComponentType } from 'react';
import type { FileKind, InspectedFile } from './file-types';

export type ProcessingMode = 'local' | 'worker' | 'wasm' | 'server';

export interface OptionsFormProps<Options> {
  value: Options;
  onChange: (value: Options) => void;
}

export type ToolCategorySlug = 'pdf' | 'image' | 'data' | 'text';

export interface ToolInputSpec {
  accepts: readonly FileKind[];
  minFiles?: number;
  maxFiles?: number;
}

export interface ToolOutputSpec {
  kind: FileKind;
  multiple?: boolean;
}

export interface ProcessingResultBlob {
  blob: Blob;
  filename: string;
  bytes: number;
}

export interface ProcessingResult {
  outputs: ProcessingResultBlob[];
  meta?: Record<string, unknown>;
}

export interface ProcessingContext<Options> {
  files: readonly InspectedFile[];
  options: Options;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export interface ToolDefinition<Options = unknown> {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ToolCategorySlug;
  input: ToolInputSpec;
  output: ToolOutputSpec;
  mode: ProcessingMode;
  defaultOptions?: Options;
  OptionsForm?: ComponentType<OptionsFormProps<Options>>;
  process: (ctx: ProcessingContext<Options>) => Promise<ProcessingResult>;
}
