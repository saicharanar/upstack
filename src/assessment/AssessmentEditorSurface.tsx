'use client';

import { lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import type { AssessmentEditorSurfaceProps } from './editorSurface';
import { EditorSurfaceBoundary } from './EditorSurfaceBoundary';
import { ModernMonacoSurface } from './ModernMonacoSurface';

const LegacyMonacoSurface = lazy(async () => {
  const module = await import('./LegacyMonacoSurface');
  return { default: module.LegacyMonacoSurface };
});

const loadingEditor = <p className="assessment-editor__loading">Loading editor…</p>;

export function AssessmentEditorSurface(props: AssessmentEditorSurfaceProps): ReactNode {
  const [isUsingLegacyEditor, setIsUsingLegacyEditor] = useState(false);
  const useLegacyEditor = useCallback(() => setIsUsingLegacyEditor(true), []);

  if (isUsingLegacyEditor) {
    return (
      <div className="assessment-editor__legacy-surface">
        <Suspense fallback={loadingEditor}>
          <LegacyMonacoSurface {...props} />
        </Suspense>
      </div>
    );
  }

  return (
    <EditorSurfaceBoundary fallback={loadingEditor} onFailure={useLegacyEditor}>
      <ModernMonacoSurface {...props} onFailure={useLegacyEditor} />
    </EditorSurfaceBoundary>
  );
}
