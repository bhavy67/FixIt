import { create } from 'zustand';
import type { ProcessingResult } from '@/core/tool-types';

export type JobStatus = 'idle' | 'running' | 'done' | 'error' | 'cancelled';

interface JobState {
  status: JobStatus;
  toolId?: string;
  progress: number;
  result?: ProcessingResult;
  error?: string;
  abortController?: AbortController;

  start: (toolId: string, abortController: AbortController) => void;
  setProgress: (p: number) => void;
  succeed: (result: ProcessingResult) => void;
  fail: (message: string) => void;
  cancel: () => void;
  reset: () => void;
}

const initial = {
  status: 'idle' as JobStatus,
  progress: 0,
  toolId: undefined,
  result: undefined,
  error: undefined,
  abortController: undefined,
};

export const useJobStore = create<JobState>((set, get) => ({
  ...initial,

  start: (toolId, abortController) =>
    set({
      status: 'running',
      toolId,
      progress: 0,
      result: undefined,
      error: undefined,
      abortController,
    }),

  setProgress: (p) => {
    if (get().status !== 'running') return;
    set({ progress: Math.max(0, Math.min(1, p)) });
  },

  succeed: (result) =>
    set({
      status: 'done',
      progress: 1,
      result,
      error: undefined,
      abortController: undefined,
    }),

  fail: (message) =>
    set({
      status: 'error',
      error: message,
      abortController: undefined,
    }),

  cancel: () => {
    const { abortController, status } = get();
    if (status !== 'running') return;
    abortController?.abort();
    set({ status: 'cancelled', abortController: undefined });
  },

  reset: () => set({ ...initial }),
}));
