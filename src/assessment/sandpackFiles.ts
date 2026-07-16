import type { SandpackFile } from '@codesandbox/sandpack-react';
import type { AssessmentFile } from '@/content-layer/loader';
import type { DraftFiles } from './executionGate';

export function toSandpackFiles(
  files: Readonly<Record<string, AssessmentFile>>,
): Record<string, SandpackFile> {
  const mapped: Record<string, SandpackFile> = {};
  for (const [path, file] of Object.entries(files)) {
    mapped[path] = {
      code: file.code,
      hidden: file.hidden,
      active: file.active,
      readOnly: file.readOnly,
    };
  }
  return mapped;
}

export function mergeValidatedDraft(
  currentFiles: Readonly<Record<string, SandpackFile>>,
  draftFiles: DraftFiles,
): Record<string, SandpackFile> {
  const merged = { ...currentFiles };

  for (const [filePath, code] of Object.entries(draftFiles)) {
    const current = currentFiles[filePath];
    if (!current) continue;
    merged[filePath] = { ...current, code };
  }

  return merged;
}
