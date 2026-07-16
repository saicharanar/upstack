const VENDOR_PATH = '/vendor/modern-monaco';

export function modernMonacoImportMap(basePath: string): string {
  return JSON.stringify({
    imports: {
      'modern-monaco/editor-core': `${basePath}${VENDOR_PATH}/editor-core.mjs`,
      'modern-monaco/lsp': `${basePath}${VENDOR_PATH}/lsp/index.mjs`,
    },
  });
}
