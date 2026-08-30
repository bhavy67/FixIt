'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFilesStore } from '@/stores/files-store';
import { useJobStore } from '@/stores/job-store';
import { usePreferencesStore } from '@/stores/preferences-store';
import { runTool } from '@/core/engine';
import { ProcessingCancelledError, ProcessingError } from '@/core/errors';
import { getToolById, matchToolsForFiles } from '@/core/tool-registry';
import type { ToolDefinition } from '@/core/tool-types';
import { useObjectURL } from '@/hooks/use-object-url';
import { cn } from '@/lib/cn';
import { toolCategories } from '@/lib/site-config';
import { ToolPicker } from '@/components/tools/tool-picker';
import { ResultPanel } from '@/components/workspace/result-panel';
import { DropZone } from './drop-zone';
import { CompactFileList } from './compact-file-list';
import { FileKindIcon } from './file-kind-icon';
import { formatBytes } from '@/lib/format-bytes';
// Side-effect import so the registry is populated before we look up presets.
import '@/tools';

type WorkspaceProps = {
  /** When set, auto-selects this tool once matching files are dropped. */
  presetToolId?: string;
};

const catLabel = (slug: string) => toolCategories.find((c) => c.slug === slug)?.label ?? slug;

const categoryDot: Record<string, string> = {
  pdf: 'bg-blue-500',
  'pdf-security': 'bg-violet-500',
  image: 'bg-amber-500',
  data: 'bg-emerald-500',
  text: 'bg-slate-400',
};

// ---------------------------------------------------------------------------
// Right-pane: file preview when configuring
// ---------------------------------------------------------------------------
type FilePreviewProps = {
  files: ReturnType<typeof useFilesStore.getState>['files'];
};

function FilePreview({ files }: FilePreviewProps) {
  const first = files[0];
  const imageFile = first?.kind === 'image' ? first.file : null;
  const imageUrl = useObjectURL(imageFile);

  if (!first) return null;

  if (imageUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={first.name}
          className="max-h-full max-w-full object-contain rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-6">
      <FileKindIcon kind={first.kind} className="size-16" />
      <div className="text-center">
        <p className="text-sm font-semibold truncate max-w-xs" title={first.name}>
          {first.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(first.sizeBytes)}</p>
      </div>
      {files.length > 1 && (
        <p className="text-xs text-muted-foreground">+{files.length - 1} more file{files.length - 1 === 1 ? '' : 's'}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right-pane: circular progress ring when running
// ---------------------------------------------------------------------------
type ProgressRingProps = {
  progress: number;
  toolName: string;
  onCancel: () => void;
};

function ProgressRing({ progress, toolName, onCancel }: ProgressRingProps) {
  const pct = Math.round(progress * 100);
  const offset = 100 - progress * 100;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-muted/30 p-8">
      <div className="relative inline-flex items-center justify-center">
        <svg
          viewBox="0 0 36 36"
          className="size-32 -rotate-90"
          role="progressbar"
          aria-label={`${toolName} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            strokeWidth="2"
            stroke="currentColor"
            className="text-muted/20"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            stroke="currentColor"
            className="text-primary transition-all duration-300"
            strokeDasharray="100"
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-sm font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Running {toolName}&hellip;</p>
        <p className="text-muted-foreground mt-1 text-xs">Processing locally in your browser</p>
      </div>
      <Button variant="outline" size="sm" onClick={onCancel}>
        <X className="size-4" aria-hidden />
        Cancel
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right-pane: error detail
// ---------------------------------------------------------------------------
type RightErrorProps = {
  message: string;
  onRetry: () => void;
  onReset: () => void;
};

function RightError({ message, onRetry, onReset }: RightErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-8 text-destructive" aria-hidden />
      </div>
      <div>
        <p className="text-base font-semibold">Something went wrong</p>
        <p className="text-muted-foreground mt-1.5 text-sm max-w-sm">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          Start over
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left-pane configure view (file list + back + tool info + options + run btn)
// ---------------------------------------------------------------------------
type LeftConfigureProps = {
  tool: ToolDefinition<unknown>;
  files: ReturnType<typeof useFilesStore.getState>['files'];
  onRemoveFile: (id: string) => void;
  onBack: () => void;
  onRun: (opts: unknown) => void;
};

function LeftConfigure({ tool, files, onRemoveFile, onBack, onRun }: LeftConfigureProps) {
  const [options, setOptions] = useState<unknown>(() => tool.defaultOptions);
  const OptionsForm = tool.OptionsForm;

  return (
    <>
      {/* Compact file list */}
      <div className="border-b border-border pb-2 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-3 mb-1">
          Files
        </p>
        <CompactFileList files={files} onRemove={onRemoveFile} />
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3">
        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 rounded-md text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Choose different tool
        </button>

        {/* Tool info */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                'size-1.5 rounded-full shrink-0',
                categoryDot[tool.category] ?? 'bg-slate-400',
              )}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {catLabel(tool.category)}
            </span>
          </div>
          <p className="text-sm font-semibold">{tool.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.tagline}</p>
        </div>

        <div className="border-t border-border" />

        {/* Options */}
        {OptionsForm ? (
          <OptionsForm value={options} onChange={setOptions} />
        ) : (
          <p className="text-muted-foreground text-xs">This tool has no options.</p>
        )}
      </div>

      {/* Sticky run button */}
      <div className="border-t border-border p-3">
        <Button className="w-full" onClick={() => onRun(options)}>
          <Play className="size-4" aria-hidden />
          Run {tool.name}
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Left-pane: idle-files state (file list + hint + compact drop zone)
// ---------------------------------------------------------------------------
type LeftIdleFilesProps = {
  files: ReturnType<typeof useFilesStore.getState>['files'];
  onRemoveFile: (id: string) => void;
};

function LeftIdleFiles({ files, onRemoveFile }: LeftIdleFilesProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 pt-3 mb-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Files
          </p>
          <p className="text-[10px] text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} ready
          </p>
        </div>
        <CompactFileList files={files} onRemove={onRemoveFile} />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <DropZone compact />
        <p className="text-[10px] text-muted-foreground text-center">
          Select a tool &rarr;
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Left-pane: running state
// ---------------------------------------------------------------------------
type LeftRunningProps = {
  tool: ToolDefinition<unknown>;
  files: ReturnType<typeof useFilesStore.getState>['files'];
};

function LeftRunning({ tool, files }: LeftRunningProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-3 pt-3 mb-1">
          Files
        </p>
        <CompactFileList files={files} dimmed />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={cn(
              'size-1.5 rounded-full shrink-0',
              categoryDot[tool.category] ?? 'bg-slate-400',
            )}
          />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {catLabel(tool.category)}
          </span>
        </div>
        <p className="text-sm font-semibold">{tool.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Processing&hellip;</p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Left-pane: done state
// ---------------------------------------------------------------------------
type LeftDoneProps = {
  tool: ToolDefinition<unknown>;
  files: ReturnType<typeof useFilesStore.getState>['files'];
  outputCount: number;
  onStartOver: () => void;
};

function LeftDone({ tool, files, outputCount, onStartOver }: LeftDoneProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-3 pt-3 mb-1">
          Files
        </p>
        <CompactFileList files={files} />
      </div>
      <div className="border-t border-border p-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-500 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold">Done!</p>
            <p className="text-xs text-muted-foreground">
              {outputCount} file{outputCount === 1 ? '' : 's'} ready
            </p>
          </div>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Tool
        </p>
        <p className="text-sm font-semibold -mt-2">{tool.name}</p>
        <Button variant="outline" className="w-full" size="sm" onClick={onStartOver}>
          Process another file
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Left-pane: error state
// ---------------------------------------------------------------------------
type LeftErrorProps = {
  files: ReturnType<typeof useFilesStore.getState>['files'];
  message: string;
  onRetry: () => void;
  onReset: () => void;
};

function LeftError({ files, message, onRetry, onReset }: LeftErrorProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-3 pt-3 mb-1">
          Files
        </p>
        <CompactFileList files={files} />
      </div>
      <div className="border-t border-border p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive shrink-0" aria-hidden />
          <p className="text-sm font-semibold">Something went wrong</p>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3">{message}</p>
        <div className="flex gap-2 mt-1">
          <Button size="sm" className="flex-1" onClick={onRetry}>
            <RotateCcw className="size-3.5" aria-hidden />
            Retry
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={onReset}>
            Start over
          </Button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main workspace
// ---------------------------------------------------------------------------
export function Workspace({ presetToolId }: WorkspaceProps = {}) {
  const files = useFilesStore((s) => s.files);
  const removeFile = useFilesStore((s) => s.remove);
  const clearFiles = useFilesStore((s) => s.clear);

  const status = useJobStore((s) => s.status);
  const progress = useJobStore((s) => s.progress);
  const result = useJobStore((s) => s.result);
  const error = useJobStore((s) => s.error);
  const start = useJobStore((s) => s.start);
  const setProgress = useJobStore((s) => s.setProgress);
  const succeed = useJobStore((s) => s.succeed);
  const fail = useJobStore((s) => s.fail);
  const cancel = useJobStore((s) => s.cancel);
  const resetJob = useJobStore((s) => s.reset);
  const recordToolUse = usePreferencesStore((s) => s.recordToolUse);

  const presetTool = useMemo(
    () => (presetToolId ? (getToolById(presetToolId) ?? null) : null),
    [presetToolId],
  );

  const [selectedTool, setSelectedTool] = useState<ToolDefinition<unknown> | null>(presetTool);
  const [lastOptions, setLastOptions] = useState<unknown>(null);

  // A preset tool only counts as "selected" if the current files actually match it.
  const matchesPreset = useMemo(() => {
    if (!selectedTool || files.length === 0) return true;
    return matchToolsForFiles(files).some((t) => t.id === selectedTool.id);
  }, [selectedTool, files]);
  const effectiveTool = matchesPreset ? selectedTool : null;

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
        recordToolUse(tool.id);
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
    [files, start, setProgress, succeed, fail, resetJob, recordToolUse],
  );

  const startOver = useCallback(() => {
    resetJob();
    clearFiles();
    setSelectedTool(presetTool);
    setLastOptions(null);
  }, [resetJob, clearFiles, presetTool]);

  const retry = useCallback(() => {
    if (!selectedTool) {
      resetJob();
      return;
    }
    void runSelected(selectedTool, lastOptions ?? selectedTool.defaultOptions ?? {});
  }, [selectedTool, lastOptions, runSelected, resetJob]);

  // Idle — empty (no files): full-width drop zone, no two-pane
  if (files.length === 0) {
    return (
      <div className="w-full">
        <DropZone />
      </div>
    );
  }

  // All other states: two-pane layout
  const errorMessage = error ?? 'Unknown error';

  return (
    <div
      className="w-full rounded-2xl border border-border overflow-hidden flex flex-col md:flex-row min-h-[520px]"
    >
      {/* ── LEFT PANE ─────────────────────────────────────────────── */}
      <div className="md:w-72 shrink-0 border-b border-border md:border-b-0 md:border-r flex flex-col bg-card">
        {status === 'running' && effectiveTool ? (
          <LeftRunning tool={effectiveTool} files={files} />
        ) : status === 'done' && result && effectiveTool ? (
          <LeftDone
            tool={effectiveTool}
            files={files}
            outputCount={result.outputs.length}
            onStartOver={startOver}
          />
        ) : status === 'error' ? (
          <LeftError
            files={files}
            message={errorMessage}
            onRetry={retry}
            onReset={startOver}
          />
        ) : effectiveTool ? (
          <LeftConfigure
            tool={effectiveTool}
            files={files}
            onRemoveFile={removeFile}
            onBack={() => setSelectedTool(null)}
            onRun={(opts) => void runSelected(effectiveTool, opts)}
          />
        ) : (
          <LeftIdleFiles files={files} onRemoveFile={removeFile} />
        )}
      </div>

      {/* ── RIGHT PANE ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {status === 'running' && effectiveTool ? (
          <ProgressRing progress={progress} toolName={effectiveTool.name} onCancel={cancel} />
        ) : status === 'done' && result ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <ResultPanel result={result} originalFiles={files} onReset={startOver} />
          </div>
        ) : status === 'error' ? (
          <RightError message={errorMessage} onRetry={retry} onReset={startOver} />
        ) : effectiveTool ? (
          <FilePreview files={files} />
        ) : (
          <ToolPicker onPick={(tool) => setSelectedTool(tool)} />
        )}
      </div>
    </div>
  );
}
