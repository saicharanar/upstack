import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fg from 'fast-glob';

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export const CONTENT_ROOT = path.join(PROJECT_ROOT, 'content', 'react');

export interface AssessmentPaths {
  readonly id: string;
  readonly dir: string;
  readonly metaPath: string;
  readonly filesDir: string;
  readonly testsDir: string;
  readonly solutionDir: string;
}

export function findAssessments(): AssessmentPaths[] {
  const metaFiles = fg.sync('modules/*/assessments/*/meta.ts', {
    cwd: CONTENT_ROOT,
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
