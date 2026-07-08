import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fg from 'fast-glob';

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');

export const DEFAULT_STACK = 'react';

export function stackRoot(stack: string = DEFAULT_STACK): string {
  return path.join(CONTENT_DIR, stack);
}

// Back-compat default (the React stack). Stack-aware callers use stackRoot(id).
export const CONTENT_ROOT = stackRoot(DEFAULT_STACK);

export interface AssessmentPaths {
  readonly id: string;
  readonly dir: string;
  readonly metaPath: string;
  readonly filesDir: string;
  readonly testsDir: string;
  readonly solutionDir: string;
}

// Every stack is a directory under content/. Verification runs across all of
// them (regardless of registry status) so new stacks are checked before launch.
export function discoverStacks(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function findAllAssessments(): AssessmentPaths[] {
  return discoverStacks().flatMap((stack) => findAssessments(stack));
}

export function findAssessments(stack: string = DEFAULT_STACK): AssessmentPaths[] {
  const metaFiles = fg.sync('modules/*/assessments/*/meta.ts', {
    cwd: stackRoot(stack),
    absolute: true,
  });

  return metaFiles.map((metaPath) => {
    const dir = path.dirname(metaPath);
    return {
      id: path.basename(dir),
      dir,
      metaPath,
      filesDir: path.join(dir, 'files'),
      testsDir: path.join(dir, 'tests'),
      solutionDir: path.join(dir, 'solution'),
    };
  });
}

export async function importMeta(metaPath: string): Promise<unknown> {
  const mod = (await import(pathToFileURL(metaPath).href)) as { default?: unknown; meta?: unknown };
  return mod.default ?? mod.meta;
}
