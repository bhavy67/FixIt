import { beforeEach, describe, expect, it } from 'vitest';
import { useJobStore } from './job-store';

describe('job-store', () => {
  beforeEach(() => {
    useJobStore.getState().reset();
  });

  it('starts idle with zero progress', () => {
    const s = useJobStore.getState();
    expect(s.status).toBe('idle');
    expect(s.progress).toBe(0);
    expect(s.toolId).toBeUndefined();
  });

  it('start() transitions to running with the tool id and controller', () => {
    const ac = new AbortController();
    useJobStore.getState().start('image-resize', ac);
    const s = useJobStore.getState();
    expect(s.status).toBe('running');
    expect(s.toolId).toBe('image-resize');
    expect(s.abortController).toBe(ac);
  });

  it('setProgress clamps to [0, 1] and only applies while running', () => {
    useJobStore.getState().start('t', new AbortController());
    useJobStore.getState().setProgress(0.5);
    expect(useJobStore.getState().progress).toBe(0.5);
    useJobStore.getState().setProgress(-1);
    expect(useJobStore.getState().progress).toBe(0);
    useJobStore.getState().setProgress(2);
    expect(useJobStore.getState().progress).toBe(1);

    useJobStore.getState().succeed({ outputs: [] });
    useJobStore.getState().setProgress(0.5);
    expect(useJobStore.getState().progress).toBe(1); // succeed sets to 1, ignored after
  });

  it('succeed transitions to done and clears controller', () => {
    useJobStore.getState().start('t', new AbortController());
    useJobStore.getState().succeed({ outputs: [] });
    const s = useJobStore.getState();
    expect(s.status).toBe('done');
    expect(s.progress).toBe(1);
    expect(s.abortController).toBeUndefined();
  });

  it('fail transitions to error and stores the message', () => {
    useJobStore.getState().start('t', new AbortController());
    useJobStore.getState().fail('nope');
    const s = useJobStore.getState();
    expect(s.status).toBe('error');
    expect(s.error).toBe('nope');
  });

  it('cancel aborts the controller and marks cancelled', () => {
    const ac = new AbortController();
    useJobStore.getState().start('t', ac);
    useJobStore.getState().cancel();
    expect(ac.signal.aborted).toBe(true);
    expect(useJobStore.getState().status).toBe('cancelled');
  });

  it('cancel is a no-op when not running', () => {
    const ac = new AbortController();
    useJobStore.getState().cancel();
    expect(ac.signal.aborted).toBe(false);
    expect(useJobStore.getState().status).toBe('idle');
  });
});
