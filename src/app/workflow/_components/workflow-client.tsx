'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Play,
  Check,
  AlertTriangle,
  RotateCcw,
  Download,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ToolMeta, ProcessingResultBlob } from '@/core/tool-types';
import type { InspectedFile, FileKind } from '@/core/file-types';
import { getToolById } from '@/core/tool-registry';
import { formatBytes } from '@/lib/format-bytes';
import { downloadBlob } from '@/lib/download';
// side-effect import to register all tools
import '@/tools/index';

type StepConfig = {
  id: string;
  toolId: string | null;
  options: unknown;
};

type StepStatus = 'pending' | 'running' | 'done' | 'error';

type WorkflowPhase =
  | { name: 'idle' }
  | { name: 'building'; files: InspectedFile[] }
  | { name: 'running'; files: InspectedFile[]; currentStep: number; stepProgress: number }
  | { name: 'done'; outputs: ProcessingResultBlob[] }
  | { name: 'error'; message: string; stepIndex: number };

type Props = {
  tools: readonly ToolMeta[];
};

function getCompatibleTools(tools: readonly ToolMeta[], inputKind: FileKind): ToolMeta[] {
  return tools.filter((t) => t.input.accepts.includes(inputKind));
}

type ToolSelectorProps = {
  stepIndex: number;
  steps: StepConfig[];
  tools: readonly ToolMeta[];
  initialKind: FileKind | null;
  onChange: (toolId: string, defaultOptions: unknown) => void;
};

function ToolSelector({ stepIndex, steps, tools, initialKind, onChange }: ToolSelectorProps) {
  let inputKind: FileKind | null = null;
  if (stepIndex === 0) {
    inputKind = initialKind;
  } else {
    const prevToolId = steps[stepIndex - 1]?.toolId;
    if (prevToolId) {
      const prevTool = tools.find((t) => t.id === prevToolId);
      inputKind = prevTool?.output.kind ?? null;
    }
  }

  const compatible = inputKind ? getCompatibleTools(tools, inputKind) : [...tools];

  return (
    <select
      value={steps[stepIndex]?.toolId ?? ''}
      onChange={(e) => {
        const selectedTool = tools.find((t) => t.id === e.target.value);
        const fullTool = selectedTool ? getToolById(selectedTool.id) : null;
        onChange(e.target.value, fullTool?.defaultOptions ?? null);
      }}
      className="border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <option value="">Select a tool&hellip;</option>
      {compatible.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}

export function WorkflowClient({ tools }: Props) {
  const [phase, setPhase] = useState<WorkflowPhase>({ name: 'idle' });
  const [steps, setSteps] = useState<StepConfig[]>([
    { id: crypto.randomUUID(), toolId: null, options: null },
  ]);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addStep = () => {
    setSteps((prev) => [...prev, { id: crypto.randomUUID(), toolId: null, options: null }]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStepTool = (id: string, toolId: string, defaultOptions: unknown) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, toolId, options: defaultOptions } : s)),
    );
  };

  const updateStepOptions = (id: string, options: unknown) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, options } : s)));
  };

  const reset = () => {
    abortRef.current?.abort();
    setPhase({ name: 'idle' });
    setSteps([{ id: crypto.randomUUID(), toolId: null, options: null }]);
    setStepStatuses([]);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;
    const { inspectFile } = await import('@/core/file-inspector');
    const inspected = await Promise.all(droppedFiles.map(inspectFile));
    setPhase({ name: 'building', files: inspected });
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length === 0) return;
    const { inspectFile } = await import('@/core/file-inspector');
    const inspected = await Promise.all(selectedFiles.map(inspectFile));
    setPhase({ name: 'building', files: inspected });
  }, []);

  const runWorkflow = useCallback(async () => {
    if (phase.name !== 'building') return;
    const initialFiles = phase.files;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const statuses: StepStatus[] = steps.map(() => 'pending');
    setStepStatuses([...statuses]);
    setPhase({ name: 'running', files: initialFiles, currentStep: 0, stepProgress: 0 });

    let currentFiles = initialFiles;

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]!;
        if (!step.toolId) throw new Error(`Step ${i + 1} has no tool selected`);

        const toolDef = getToolById(step.toolId);
        if (!toolDef) throw new Error(`Tool not found: ${step.toolId}`);

        statuses[i] = 'running';
        setStepStatuses([...statuses]);
        setPhase({ name: 'running', files: initialFiles, currentStep: i, stepProgress: 0 });

        const result = await toolDef.process({
          files: currentFiles,
          options: step.options,
          signal,
          onProgress: (p) => {
            setPhase({ name: 'running', files: initialFiles, currentStep: i, stepProgress: p });
          },
        });

        statuses[i] = 'done';
        setStepStatuses([...statuses]);

        if (i === steps.length - 1) {
          setPhase({ name: 'done', outputs: result.outputs });
          return;
        }

        // Convert outputs to InspectedFile[] for next step
        const outputKind = toolDef.output.kind;
        currentFiles = result.outputs.map((out) => ({
          id: crypto.randomUUID(),
          file: new File([out.blob], out.filename, { type: out.blob.type }),
          kind: outputKind,
          mime: out.blob.type,
          ext: out.filename.split('.').pop() ?? '',
          name: out.filename,
          sizeBytes: out.bytes,
        }));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const stepIndex = statuses.findIndex((s) => s === 'running');
      setPhase({
        name: 'error',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        stepIndex,
      });
    }
  }, [phase, steps]);

  // ── Idle phase ────────────────────────────────────────────────────────────
  if (phase.name === 'idle') {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-border hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-16 transition-colors"
      >
        <Upload className="text-muted-foreground size-10" aria-hidden />
        <div className="text-center">
          <p className="font-medium">Drop files to start a workflow</p>
          <p className="text-muted-foreground text-sm">or click to browse</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  // ── Building phase ────────────────────────────────────────────────────────
  if (phase.name === 'building') {
    const buildingFiles = phase.files;
    const initialKind = buildingFiles[0]?.kind ?? null;

    return (
      <div className="flex flex-col gap-4">
        {/* Files summary */}
        <div className="border-border bg-card rounded-xl border p-4">
          <p className="mb-2 text-xs font-medium">Input files</p>
          <ul className="flex flex-col gap-1">
            {buildingFiles.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-xs">
                <span className="text-foreground truncate font-medium">{f.name}</span>
                <span className="text-muted-foreground shrink-0">{formatBytes(f.sizeBytes)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        {steps.map((step, i) => (
          <div key={step.id}>
            {i > 0 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="text-muted-foreground size-4" aria-hidden />
              </div>
            )}
            <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-2">
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-xs">
                  Step {i + 1}
                </span>
                {steps.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 w-7 p-0"
                    onClick={() => removeStep(step.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
              <ToolSelector
                stepIndex={i}
                steps={steps}
                tools={tools}
                initialKind={initialKind}
                onChange={(toolId, opts) => updateStepTool(step.id, toolId, opts)}
              />
              {step.toolId &&
                (() => {
                  const toolDef = getToolById(step.toolId);
                  if (!toolDef?.OptionsForm)
                    return (
                      <p className="text-muted-foreground text-xs">No options needed.</p>
                    );
                  const OptionsForm = toolDef.OptionsForm;
                  return (
                    <OptionsForm
                      value={step.options}
                      onChange={(o) => updateStepOptions(step.id, o)}
                    />
                  );
                })()}
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addStep} className="w-full">
          <Plus className="size-4" aria-hidden />
          Add step
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            Start over
          </Button>
          <Button
            className="flex-1"
            disabled={steps.some((s) => !s.toolId)}
            onClick={runWorkflow}
          >
            <Play className="size-4" aria-hidden />
            Run workflow
          </Button>
        </div>
      </div>
    );
  }

  // ── Running phase ─────────────────────────────────────────────────────────
  if (phase.name === 'running') {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-border bg-card rounded-xl border p-6">
          <div className="mb-4 flex items-center gap-3">
            <Loader2 className="text-primary size-5 animate-spin" aria-hidden />
            <p className="text-sm font-medium">
              Running step {phase.currentStep + 1} of {steps.length}&hellip;
            </p>
          </div>
          <div className="bg-muted mb-4 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-200"
              style={{ width: `${Math.round(phase.stepProgress * 100)}%` }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {steps.map((step, i) => {
              const status = stepStatuses[i] ?? 'pending';
              const toolName = tools.find((t) => t.id === step.toolId)?.name ?? step.toolId;
              return (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  {status === 'done' && <Check className="text-primary size-4" aria-hidden />}
                  {status === 'running' && (
                    <Loader2 className="text-primary size-4 animate-spin" aria-hidden />
                  )}
                  {status === 'pending' && (
                    <div className="border-border size-4 rounded-full border" />
                  )}
                  {status === 'error' && (
                    <AlertTriangle className="text-destructive size-4" aria-hidden />
                  )}
                  <span className={status === 'pending' ? 'text-muted-foreground' : ''}>
                    {toolName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <Button variant="outline" onClick={() => abortRef.current?.abort()}>
          Cancel
        </Button>
      </div>
    );
  }

  // ── Done phase ────────────────────────────────────────────────────────────
  if (phase.name === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-border bg-card flex items-center gap-3 rounded-xl border p-4">
          <span className="bg-primary text-primary-foreground inline-flex size-8 items-center justify-center rounded-full">
            <Check className="size-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">Workflow complete</p>
            <p className="text-muted-foreground text-xs">
              {phase.outputs.length} output file{phase.outputs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ul className="divide-border border-border bg-card divide-y overflow-hidden rounded-xl border">
          {phase.outputs.map((o) => (
            <li key={o.filename} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{o.filename}</p>
                <p className="text-muted-foreground text-xs">{formatBytes(o.bytes)}</p>
              </div>
              <Button size="sm" onClick={() => downloadBlob(o.blob, o.filename)}>
                <Download className="size-4" aria-hidden />
                Download
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Run another workflow
        </Button>
      </div>
    );
  }

  // ── Error phase ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      <div className="border-destructive/40 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
        <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Workflow failed</p>
          {phase.stepIndex >= 0 && (
            <p className="text-muted-foreground text-xs">Failed at step {phase.stepIndex + 1}</p>
          )}
          <p className="text-muted-foreground mt-1 text-xs">{phase.message}</p>
        </div>
      </div>
      <Button variant="outline" onClick={reset}>
        <RotateCcw className="size-4" aria-hidden />
        Start over
      </Button>
    </div>
  );
}
