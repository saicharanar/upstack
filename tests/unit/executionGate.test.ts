import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AssessmentExecutionGate,
  type DraftFiles,
  type ExecutionStatus,
  type ValidatedRevision,
} from '@/assessment/executionGate';

afterEach(() => {
  vi.useRealTimers();
});

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: (value) => resolvePromise?.(value) };
}

describe('assessment execution gate', () => {
  it('collapses a burst of edits into one check after 600 milliseconds', async () => {
    vi.useFakeTimers();
    const validate = vi.fn(async () => true);
    const publish = vi.fn<(revision: ValidatedRevision) => void>();
    const statuses: ExecutionStatus[] = [];
    const gate = new AssessmentExecutionGate({
      validate,
      publish,
      onStatus: (status) => statuses.push(status),
    });

    gate.schedule({ '/App.js': 'a' });
    gate.schedule({ '/App.js': 'ab' });
    gate.schedule({ '/App.js': 'abc' });

    await vi.advanceTimersByTimeAsync(599);
    expect(validate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(validate).toHaveBeenCalledOnce();
    expect(validate).toHaveBeenCalledWith({ '/App.js': 'abc' });
    expect(publish).toHaveBeenCalledWith({ files: { '/App.js': 'abc' }, revision: 3 });
    expect(statuses.at(-1)).toBe('running');
  });

  it('blocks invalid code without publishing it', async () => {
    vi.useFakeTimers();
    const publish = vi.fn<(revision: ValidatedRevision) => void>();
    const statuses: ExecutionStatus[] = [];
    const gate = new AssessmentExecutionGate({
      validate: async () => false,
      publish,
      onStatus: (status) => statuses.push(status),
    });

    gate.schedule({ '/App.js': 'export default (' });
    await vi.advanceTimersByTimeAsync(600);

    expect(publish).not.toHaveBeenCalled();
    expect(statuses).toEqual(['editing', 'checking', 'blocked']);
  });

  it('ignores a stale diagnostic result after a newer revision starts', async () => {
    vi.useFakeTimers();
    const first = deferred<boolean>();
    const second = deferred<boolean>();
    const validationResults = [first.promise, second.promise];
    const validate = vi.fn((_files: DraftFiles) => validationResults.shift() ?? Promise.resolve(false));
    const publish = vi.fn<(revision: ValidatedRevision) => void>();
    const gate = new AssessmentExecutionGate({ validate, publish, onStatus: vi.fn() });

    gate.schedule({ '/App.js': 'first' });
    await vi.advanceTimersByTimeAsync(600);
    gate.schedule({ '/App.js': 'second' });
    await vi.advanceTimersByTimeAsync(600);

    first.resolve(true);
    await Promise.resolve();
    expect(publish).not.toHaveBeenCalled();

    second.resolve(true);
    await Promise.resolve();
    expect(publish).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenCalledWith({ files: { '/App.js': 'second' }, revision: 2 });
  });

  it('cancels pending checks when disposed', async () => {
    vi.useFakeTimers();
    const validate = vi.fn(async () => true);
    const gate = new AssessmentExecutionGate({ validate, publish: vi.fn(), onStatus: vi.fn() });

    gate.schedule({ '/App.js': 'draft' });
    gate.dispose();
    await vi.advanceTimersByTimeAsync(600);

    expect(validate).not.toHaveBeenCalled();
  });
});
