import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssessmentMemoryFileSystem } from '@/assessment/assessmentMemoryFileSystem';
import {
  configureModernMonacoEnvironment,
  loadModernReactTypeFiles,
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

  it('loads the full local React DOM and JSX type libraries without a public CDN', async () => {
    const requestedUrls: string[] = [];
    const fetchAsset = vi.fn(async (url: string) => {
      requestedUrls.push(url);
      return new Response(`type source for ${url}`, { status: 200 });
    });

    const typeFiles = await loadModernReactTypeFiles('/upstack', fetchAsset);

    expect(requestedUrls).toContain('/upstack/vendor/types/react/index.d.ts');
    expect(requestedUrls).toContain('/upstack/vendor/types/react/global.d.ts');
    expect(requestedUrls).toContain('/upstack/vendor/types/react/jsx-runtime.d.ts');
    expect(requestedUrls).toContain('/upstack/vendor/types/csstype/index.d.ts');
    expect(typeFiles['/node_modules/@types/react/index.d.ts']).toContain('react/index.d.ts');
    expect(typeFiles['/node_modules/csstype/index.d.ts']).toContain('csstype/index.d.ts');
  });

  it('uses only bundled themes and grammars', () => {
    const options = modernMonacoInitOptions();

    expect(typeof options.defaultTheme).toBe('object');
    expect(options.themes?.every((theme) => typeof theme === 'object')).toBe(true);
    expect(
      options.themes?.every(
        (theme) =>
          typeof theme === 'object' &&
          theme !== null &&
          'tokenColors' in theme &&
          Array.isArray(theme.tokenColors) &&
          theme.tokenColors.length > 0,
      ),
    ).toBe(true);
    expect(options.cdn).toBe('');
  });

  it('enables the bundled JavaScript and JSX language service before initialization', () => {
    const runtime = {};

    configureModernMonacoEnvironment(runtime);

    expect(runtime).toEqual({ MonacoEnvironment: { useBuiltinLSP: true } });
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
