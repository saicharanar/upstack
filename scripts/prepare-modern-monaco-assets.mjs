import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const editorCore = fileURLToPath(import.meta.resolve('modern-monaco/editor-core'));
const sourceDirectory = dirname(editorCore);
const targetDirectory = resolve('public/vendor/modern-monaco');

await mkdir(targetDirectory, { recursive: true });
await cp(sourceDirectory, targetDirectory, { recursive: true, force: true });
