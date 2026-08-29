'use client';

import { useCallback, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/files-store';
import { useJobStore } from '@/stores/job-store';
import { runTool } from '@/core/engine';
import { ProcessingCancelledError, ProcessingError } from '@/core/errors';
import type { ToolDefinition } from '@/core/tool-types';
import { ToolPicker } from '@/components/tools/tool-picker';
import { ConfigurePanel } from '@/components/workspace/configure-panel';
import { RunPanel } from '@/components/workspace/run-panel';
import { ResultPanel } from '@/components/workspace/result-panel';
import { ErrorPanel } from '@/components/workspace/error-panel';
import { DropZone } from './drop-zone';
import { FileList } from './file-list';

export function Workspace() {
  const files = useFilesStore((s) => s.files);
  const clearFiles = useFilesStore((s) => s.clear);

  const status = useJobStore((s) => s.status);
  const result = useJobStore((s) => s.result);
  const error = useJobStore((s) => s.error);
  const start = useJobStore((s) => s.start);
  const setProgress = useJobStore((s) => s.setProgress);
  const succeed = useJobStore((s) => s.succeed);
  const fail = useJobStore((s) => s.fail);
  const resetJob = useJobStore((s) => s.reset);

  const [selectedTool, setSelectedTool] = useState<ToolDefinition<unknown> | null>(null);
  const [lastOptions, setLastOptions] = useState<unknown>(null);

  const runSelected = useCallback(
    async (tool: ToolDefinition<unknown>, options: unknown) => {
      setLastOptions(options);
      const controller = new AbortController();
      start(tool.id, controller);
      try {
        const res = await runTool(tool, files, options, {
          signal: controller.signal,
          onProgress: setProgress,
        });
        succeed(res);
      } catch (err) {
        if (err instanceof ProcessingCancelledError) {
          resetJob();
          toast('Cancelled');
          return;
        }
        const message =
          err instanceof ProcessingError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unknown error';
        fail(message);
      }
    },
    [files, start, setProgress, succeed, fail, resetJob],
  );

  const startOver = useCallback(() => {
    resetJob();
    clearFiles();
    setSelectedTool(null);
    setLastOptions(null);
  }, [resetJob, clearFiles]);

  const retry = useCallback(() => {
    if (!selectedTool) {
      resetJob();
      return;
    }
    void runSelected(selectedTool, lastOptions ?? selectedTool.defaultOptions ?? {});
  }, [selectedTool, lastOptions, runSelected, resetJob]);

  // Running state
  if (status === 'running' && selectedTool) {
    return (
      <div className="mx-auto w-full max-w-xl text-left">
        <RunPanel toolName={selectedTool.name} />
      </div>
    );
  }

  // Done state
  if (status === 'done' && result) {
    return (
      <div className="mx-auto w-full max-w-xl text-left">
        <ResultPanel result={result} originalFiles={files} onReset={startOver} />
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="mx-auto w-full max-w-xl text-left">
        <ErrorPanel message={error ?? 'Unknown error'} onRetry={retry} onReset={startOver} />
      </div>
    );
  }

  // Idle — empty
  if (files.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <DropZone />
      </div>
    );
  }

  // Idle — files staged
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {files.length} file{files.length === 1 ? '' : 's'} ready
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearFiles();
            setSelectedTool(null);
          }}
        >
          <Trash2 className="size-4" aria-hidden />
          Clear all
        </Button>
      </div>
      <FileList />

      {selectedTool ? (
        <ConfigurePanel
          tool={selectedTool}
          onBack={() => setSelectedTool(null)}
          onRun={(opts) => void runSelected(selectedTool, opts)}
        />
      ) : (
        <ToolPicker onPick={(tool) => setSelectedTool(tool)} />
      )}

      {!selectedTool && <DropZone compact />}
    </div>
  );
}
