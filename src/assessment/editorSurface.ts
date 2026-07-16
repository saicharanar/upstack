import type { DraftFiles } from './executionGate';

export type EditorTheme = 'light' | 'dark';

export interface AssessmentEditorSurfaceProps {
  readonly files: DraftFiles;
  readonly activePath: string;
  readonly readOnly: boolean;
  readonly theme: EditorTheme;
  readonly onChange: (filePath: string, code: string) => void;
  readonly onFailure?: (error: Error) => void;
}

export function activeDraftValue(files: DraftFiles, activePath: string): string {
  return files[activePath] ?? '';
}

export function editorThemeFromDocument(currentDocument: Document | undefined): EditorTheme {
  return currentDocument?.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
