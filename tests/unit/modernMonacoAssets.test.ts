import { describe, expect, it } from 'vitest';
import { modernMonacoImportMap } from '@/assessment/modernMonacoAssets';

describe('modern Monaco local assets', () => {
  it('maps editor core, LSP, and TypeScript modules to local root assets', () => {
    const map = JSON.parse(modernMonacoImportMap('')) as {
      imports: Record<string, string>;
    };

    expect(map.imports).toEqual({
      'modern-monaco/editor-core': '/vendor/modern-monaco/editor-core.mjs',
      'modern-monaco/lsp': '/vendor/modern-monaco/lsp/index.mjs',
      typescript: '/vendor/typescript/typescript.mjs',
    });
  });

  it('includes the GitHub Pages base path', () => {
    const map = JSON.parse(modernMonacoImportMap('/upstack')) as {
      imports: Record<string, string>;
    };

    expect(map.imports['modern-monaco/editor-core']).toBe(
      '/upstack/vendor/modern-monaco/editor-core.mjs',
    );
  });
});
