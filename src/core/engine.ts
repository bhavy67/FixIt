import type { InspectedFile } from './file-types';
import type { ProcessingContext, ProcessingResult, ToolDefinition } from './tool-types';
import {
  InvalidInputError,
  ProcessingCancelledError,
  ProcessingError,
  ProcessingFailedError,
} from './errors';

export interface RunOptions {
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

export function validateInput<Options>(
  tool: ToolDefinition<Options>,
  files: readonly InspectedFile[],
): void {
  const min = tool.input.minFiles ?? 1;
  const max = tool.input.maxFiles;
  if (files.length < min) {
    throw new InvalidInputError(`${tool.name} needs at least ${min} file${min === 1 ? '' : 's'}.`);
  }
  if (max !== undefined && files.length > max) {
    throw new InvalidInputError(`${tool.name} accepts at most ${max} file${max === 1 ? '' : 's'}.`);
  }
  const rejected = files.find((f) => !tool.input.accepts.includes(f.kind));
  if (rejected) {
    throw new InvalidInputError(
      `${tool.name} does not accept ${rejected.kind} files (${rejected.name}).`,
    );
  }
}

export async function runTool<Options>(
  tool: ToolDefinition<Options>,
  files: readonly InspectedFile[],
  options: Options,
  runOpts: RunOptions = {},
): Promise<ProcessingResult> {
  validateInput(tool, files);

  const signal = runOpts.signal ?? new AbortController().signal;
  const onProgress = clampProgress(runOpts.onProgress);

  if (signal.aborted) {
    throw new ProcessingCancelledError();
  }

  const ctx: ProcessingContext<Options> = {
    files,
    options,
    signal,
    onProgress,
  };

  try {
    onProgress(0);
    const result = await tool.process(ctx);
    onProgress(1);
    return result;
  } catch (err) {
    if (signal.aborted) {
      throw new ProcessingCancelledError();
    }
    if (err instanceof ProcessingError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    throw new ProcessingFailedError(message, { cause: err });
  }
}

function clampProgress(cb?: (p: number) => void): (p: number) => void {
  if (!cb) return () => {};
  return (p: number) => {
    if (!Number.isFinite(p)) return;
    cb(Math.max(0, Math.min(1, p)));
  };
}
