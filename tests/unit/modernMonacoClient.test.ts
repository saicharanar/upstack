import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssessmentMemoryFileSystem } from '@/assessment/assessmentMemoryFileSystem';
import {
  modernModelPath,
  modernMonacoInitOptions,
  modernWorkspaceFiles,
  withTimeout,
} from '@/assessment/modernMonacoClient';

describe('modern Monaco assessment client', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses JSX-aware virtual extensions for JavaScript assessment files', () => {
    expect(modernModelPath('/App.js')).toBe('/assessment/App.jsx');
    expect(modernModelPath('/components/Card.jsx')).toBe('/assessment/components/Card.jsx');
  });

  it('ships React declarations and compiler config in the local workspace', () => {
    const workspaceFiles = modernWorkspaceFiles({
      '/App.js': 'export default () => <div />',
    });

    expect(workspaceFiles['/assessment/App.jsx']).toContain('<div />');
    expect(workspaceFiles['/node_modules/@types/react/index.d.ts']).toContain(
      "declare module 'react'",
    );
    expect(JSON.parse(workspaceFiles['/tsconfig.json'] ?? '{}').compilerOptions.types).toEqual([
      '/node_modules/@types/react/index.d.ts',
    ]);
  });

  it('uses only bundled themes and grammars', () => {
    const options = modernMonacoInitOptions();

    expect(typeof options.defaultTheme).toBe('object');
    expect(options.themes?.every((theme) => typeof theme === 'object')).toBe(true);
    expect(options.cdn).toBe('');
  });

  it('keeps workspace files in memory and removes assessment trees recursively', async () => {
    const fileSystem = new AssessmentMemoryFileSystem();
    await fileSystem.createDirectory('/assessment/components');
    await fileSystem.writeFile('/assessment/components/Card.jsx', 'export function Card() {}');

    expect(await fileSystem.readTextFile('/assessment/components/Card.jsx')).toContain('Card');
    expect(await fileSystem.readDirectory('/assessment')).toEqual([['components', 2]]);

    await fileSystem.delete('/assessment', { recursive: true });

    await expect(fileSystem.stat('/assessment/components/Card.jsx')).rejects.toThrow(
      'No such file or directory',
    );
  });

  it('rejects initialization that exceeds the bounded timeout', async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise<never>(() => undefined), 25);
    const rejection = expect(pending).rejects.toThrow('Modern Monaco initialization timed out');

    await vi.advanceTimersByTimeAsync(25);

    await rejection;
  });
});
