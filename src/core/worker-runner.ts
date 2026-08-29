/**
 * Message contract between the caller and the worker.
 * Workers post `progress`, then exactly one of `result` or `error`.
 */
export type WorkerMessage<TResult> =
  | { type: 'progress'; value: number }
  | { type: 'result'; value: TResult }
  | { type: 'error'; message: string };

/**
 * Minimal Worker-shape so we can accept both `Worker` and a MockWorker in tests.
 * `EventListener` accepts a plain `Event`, which is contravariantly assignable
 * to MessageEvent / ErrorEvent listeners without needing overloads.
 */
export interface WorkerLike {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  addEventListener(type: 'message' | 'error', listener: EventListener): void;
  removeEventListener(type: 'message' | 'error', listener: EventListener): void;
  terminate(): void;
}

export interface RunInWorkerOptions {
  worker: WorkerLike;
  input: unknown;
  transfer?: Transferable[];
  signal: AbortSignal;
  onProgress?: (progress: number) => void;
  /**
   * Terminate the worker when the promise settles. Defaults to `true` — this
   * runner is intended for one-shot workers.
   */
  terminateOnSettle?: boolean;
  /** Injected in tests to avoid depending on the global DOMException. */
  makeAbortError?: () => unknown;
}

const defaultAbortError = () =>
  typeof DOMException !== 'undefined'
    ? new DOMException('cancelled', 'AbortError')
    : Object.assign(new Error('cancelled'), { name: 'AbortError' });

export function runInWorker<TResult>(opts: RunInWorkerOptions): Promise<TResult> {
  const {
    worker,
    input,
    transfer = [],
    signal,
    onProgress,
    terminateOnSettle = true,
    makeAbortError = defaultAbortError,
  } = opts;

  return new Promise<TResult>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      worker.removeEventListener('message', onMessage as EventListener);
      worker.removeEventListener('error', onError as EventListener);
      signal.removeEventListener('abort', onAbort);
      if (terminateOnSettle) worker.terminate();
    };

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onMessage = (e: MessageEvent) => {
      const msg = e.data as WorkerMessage<TResult>;
      switch (msg.type) {
        case 'progress':
          onProgress?.(msg.value);
          return;
        case 'result':
          finish(() => resolve(msg.value));
          return;
        case 'error':
          finish(() => reject(new Error(msg.message)));
          return;
      }
    };

    const onError = (e: ErrorEvent) => {
      finish(() => reject(new Error(e.message || 'Worker error')));
    };

    const onAbort = () => {
      finish(() => reject(makeAbortError()));
    };

    if (signal.aborted) {
      finish(() => reject(makeAbortError()));
      return;
    }

    worker.addEventListener('message', onMessage as EventListener);
    worker.addEventListener('error', onError as EventListener);
    signal.addEventListener('abort', onAbort);

    worker.postMessage(input, transfer);
  });
}
