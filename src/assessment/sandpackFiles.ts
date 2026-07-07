import type { SandpackFile } from '@codesandbox/sandpack-react';
import type { AssessmentFile } from '@/content-layer/loader';

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
