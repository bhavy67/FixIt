import { describe, expect, it, vi } from 'vitest';
import { runInWorker, type WorkerLike, type WorkerMessage } from './worker-runner';

class MockWorker implements WorkerLike {
  private msgListeners = new Set<EventListener>();
  private errListeners = new Set<EventListener>();
  public terminated = false;
  public lastPosted: unknown;
  public lastTransfer: Transferable[] | undefined;

  addEventListener(type: 'message' | 'error', listener: EventListener): void {
    (type === 'message' ? this.msgListeners : this.errListeners).add(listener);
  }
  removeEventListener(type: 'message' | 'error', listener: EventListener): void {
    (type === 'message' ? this.msgListeners : this.errListeners).delete(listener);
  }

  postMessage(msg: unknown, transfer?: Transferable[]) {
    this.lastPosted = msg;
    this.lastTransfer = transfer;
  }

  terminate() {
    this.terminated = true;
  }

  // Helpers used by tests to simulate worker output.
  emit<T>(data: WorkerMessage<T>) {
    const ev = { data } as unknown as Event;
    this.msgListeners.forEach((l) => l(ev));
  }
  emitError(message: string) {
    const ev = { message } as unknown as Event;
    this.errListeners.forEach((l) => l(ev));
  }
}

const makeAbortError = () => Object.assign(new Error('cancelled'), { name: 'AbortError' });

describe('runInWorker', () => {
  it('resolves with the worker result and terminates', async () => {
    const worker = new MockWorker();
    const promise = runInWorker<number>({
      worker,
      input: { hello: 'world' },
      signal: new AbortController().signal,
      makeAbortError,
    });
    // Simulate worker: progress then result
    worker.emit<number>({ type: 'progress', value: 0.5 });
    worker.emit<number>({ type: 'result', value: 42 });
    await expect(promise).resolves.toBe(42);
    expect(worker.terminated).toBe(true);
    expect(worker.lastPosted).toEqual({ hello: 'world' });
  });

  it('reports progress via the callback', async () => {
    const worker = new MockWorker();
    const onProgress = vi.fn();
    const promise = runInWorker<string>({
      worker,
      input: null,
      signal: new AbortController().signal,
      onProgress,
      makeAbortError,
    });
    worker.emit<string>({ type: 'progress', value: 0.25 });
    worker.emit<string>({ type: 'progress', value: 0.75 });
    worker.emit<string>({ type: 'result', value: 'ok' });
    await promise;
    expect(onProgress).toHaveBeenCalledWith(0.25);
    expect(onProgress).toHaveBeenCalledWith(0.75);
  });

  it('rejects when the worker posts an error message', async () => {
    const worker = new MockWorker();
    const promise = runInWorker<number>({
      worker,
      input: null,
      signal: new AbortController().signal,
      makeAbortError,
    });
    worker.emit<number>({ type: 'error', message: 'kaboom' });
    await expect(promise).rejects.toThrow('kaboom');
    expect(worker.terminated).toBe(true);
  });

  it('rejects when the worker emits an ErrorEvent', async () => {
    const worker = new MockWorker();
    const promise = runInWorker<number>({
      worker,
      input: null,
      signal: new AbortController().signal,
      makeAbortError,
    });
    worker.emitError('oops');
    await expect(promise).rejects.toThrow('oops');
  });

  it('terminates and rejects when the signal aborts mid-run', async () => {
    const worker = new MockWorker();
    const controller = new AbortController();
    const promise = runInWorker<number>({
      worker,
      input: null,
      signal: controller.signal,
      makeAbortError,
    });
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminated).toBe(true);
  });

  it('rejects immediately if the signal is already aborted', async () => {
    const worker = new MockWorker();
    const controller = new AbortController();
    controller.abort();
    await expect(
      runInWorker<number>({
        worker,
        input: null,
        signal: controller.signal,
        makeAbortError,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    // Never posted anything to the worker
    expect(worker.lastPosted).toBeUndefined();
    expect(worker.terminated).toBe(true);
  });

  it('passes transferables to postMessage', async () => {
    const worker = new MockWorker();
    const buffer = new ArrayBuffer(8);
    const promise = runInWorker<number>({
      worker,
      input: { buffer },
      transfer: [buffer],
      signal: new AbortController().signal,
      makeAbortError,
    });
    worker.emit<number>({ type: 'result', value: 1 });
    await promise;
    expect(worker.lastTransfer).toEqual([buffer]);
  });

  it('does not terminate when terminateOnSettle is false', async () => {
    const worker = new MockWorker();
    const promise = runInWorker<number>({
      worker,
      input: null,
      signal: new AbortController().signal,
      terminateOnSettle: false,
      makeAbortError,
    });
    worker.emit<number>({ type: 'result', value: 1 });
    await promise;
    expect(worker.terminated).toBe(false);
  });
});
