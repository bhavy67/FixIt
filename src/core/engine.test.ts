import { describe, expect, it, vi } from 'vitest';
import { runTool } from './engine';
import { InvalidInputError, ProcessingCancelledError, ProcessingFailedError } from './errors';
import type { ToolDefinition } from './tool-types';
import type { FileKind, InspectedFile } from './file-types';

function makeInspected(name: string, kind: FileKind): InspectedFile {
  return {
    id: `id-${name}`,
    file: new File([''], name),
    kind,
    mime: '',
    ext: name.split('.').pop() ?? '',
    name,
    sizeBytes: 0,
  };
}

function makeTool<Options = void>(
  process: ToolDefinition<Options>['process'],
  overrides?: Partial<ToolDefinition<Options>>,
): ToolDefinition<Options> {
  return {
    id: 'test-tool',
    slug: 'test-tool',
    name: 'Test Tool',
    tagline: '',
    category: 'pdf',
    mode: 'local',
    input: { accepts: ['pdf'] },
    output: { kind: 'pdf' },
    process,
    ...overrides,
  } as ToolDefinition<Options>;
}

describe('engine.runTool', () => {
  it('runs the tool and returns its result', async () => {
    const blob = new Blob(['x']);
    const tool = makeTool(async () => ({
      outputs: [{ blob, filename: 'out.pdf', bytes: 1 }],
    }));

    const result = await runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined);
    expect(result.outputs).toHaveLength(1);
    expect(result.outputs[0]?.filename).toBe('out.pdf');
  });

  it('emits 0 and 1 progress around the process call', async () => {
    const onProgress = vi.fn();
    const tool = makeTool(async ({ onProgress: emit }) => {
      emit(0.5);
      return { outputs: [] };
    });
    await runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined, { onProgress });
    expect(onProgress).toHaveBeenNthCalledWith(1, 0);
    expect(onProgress).toHaveBeenNthCalledWith(2, 0.5);
    expect(onProgress).toHaveBeenNthCalledWith(3, 1);
  });

  it('clamps progress to [0, 1]', async () => {
    const onProgress = vi.fn();
    const tool = makeTool(async ({ onProgress: emit }) => {
      emit(-1);
      emit(5);
      emit(Number.NaN);
      return { outputs: [] };
    });
    await runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined, { onProgress });
    // 0 (start), 0 (from -1), 1 (from 5), 1 (finish)
    const values = onProgress.mock.calls.map((c) => c[0]);
    expect(values).toEqual([0, 0, 1, 1]);
  });

  it('rejects when input is fewer than minFiles', async () => {
    const tool = makeTool(async () => ({ outputs: [] }), {
      input: { accepts: ['pdf'], minFiles: 2 },
    });
    await expect(runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined)).rejects.toBeInstanceOf(
      InvalidInputError,
    );
  });

  it('rejects when a file kind is not accepted', async () => {
    const tool = makeTool(async () => ({ outputs: [] }));
    await expect(
      runTool(tool, [makeInspected('a.png', 'image')], undefined),
    ).rejects.toBeInstanceOf(InvalidInputError);
  });

  it('throws ProcessingCancelledError if signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const tool = makeTool(async () => ({ outputs: [] }));
    await expect(
      runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined, { signal: controller.signal }),
    ).rejects.toBeInstanceOf(ProcessingCancelledError);
  });

  it('translates thrown Error into ProcessingFailedError', async () => {
    const tool = makeTool(async () => {
      throw new Error('kaboom');
    });
    await expect(runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined)).rejects.toBeInstanceOf(
      ProcessingFailedError,
    );
  });

  it('treats a mid-run abort as cancellation regardless of the underlying error', async () => {
    const controller = new AbortController();
    const tool = makeTool<void>(async ({ signal }) => {
      controller.abort();
      throw new Error(signal.aborted ? 'aborted internally' : 'other');
    });
    await expect(
      runTool(tool, [makeInspected('a.pdf', 'pdf')], undefined, { signal: controller.signal }),
    ).rejects.toBeInstanceOf(ProcessingCancelledError);
  });
});
