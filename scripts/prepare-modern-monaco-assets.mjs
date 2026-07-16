import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const editorCore = fileURLToPath(import.meta.resolve('modern-monaco/editor-core'));
const typescriptModule = fileURLToPath(import.meta.resolve('typescript'));
const reactTypesDirectory = dirname(require.resolve('@types/react/package.json'));
const cssTypesDirectory = dirname(require.resolve('csstype/package.json'));
const sourceDirectory = dirname(editorCore);
const targetDirectory = resolve('public/vendor/modern-monaco');
const typescriptTargetDirectory = resolve('public/vendor/typescript');
const typescriptTarget = resolve(typescriptTargetDirectory, 'typescript.mjs');
const typescriptWorkerTarget = resolve(targetDirectory, 'lsp/typescript/worker.mjs');
const reactTypesTargetDirectory = resolve('public/vendor/types/react');
const cssTypesTargetDirectory = resolve('public/vendor/types/csstype');

await mkdir(targetDirectory, { recursive: true });
await cp(sourceDirectory, targetDirectory, { recursive: true, force: true });

await mkdir(typescriptTargetDirectory, { recursive: true });
const typescriptSource = await readFile(typescriptModule, 'utf8');
await writeFile(typescriptTarget, `${typescriptSource}\nexport default ts;\n`);

const workerSource = await readFile(typescriptWorkerTarget, 'utf8');
const localWorkerSource = workerSource.replace(
  'import ts from "typescript";',
  'import ts from "../../../typescript/typescript.mjs";',
);

if (localWorkerSource === workerSource) {
  throw new Error('Could not localize the modern Monaco TypeScript worker import');
}

await writeFile(typescriptWorkerTarget, localWorkerSource);

await mkdir(reactTypesTargetDirectory, { recursive: true });
for (const fileName of [
  'package.json',
  'global.d.ts',
  'index.d.ts',
  'jsx-runtime.d.ts',
  'jsx-dev-runtime.d.ts',
]) {
  await cp(resolve(reactTypesDirectory, fileName), resolve(reactTypesTargetDirectory, fileName));
}

await mkdir(cssTypesTargetDirectory, { recursive: true });
for (const fileName of ['package.json', 'index.d.ts']) {
  await cp(resolve(cssTypesDirectory, fileName), resolve(cssTypesTargetDirectory, fileName));
}
