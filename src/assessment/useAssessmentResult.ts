'use client';

import { useCallback, useState } from 'react';
import type { AssessmentMeta } from '@/content-layer/schema';
import { useProgressActions } from '@/progress/ProgressProvider';
import { grade, type GradeResult } from './grade';
import { flattenSandpackRun } from './testResults';

export type SandpackSpecs = Record<string, unknown>;

export interface UseAssessmentResult {
  readonly result: GradeResult | null;
  readonly onComplete: (specs: SandpackSpecs) => void;
}

export function useAssessmentResult(meta: AssessmentMeta, chapterId: string): UseAssessmentResult {
  const { recordAssessment } = useProgressActions();
  const [result, setResult] = useState<GradeResult | null>(null);

  const onComplete = useCallback(
    (specs: SandpackSpecs) => {
      // This fires on every SandpackTests run, including error runs. Never let a
      // throw here escape into the render tree — a failed grade should degrade to
      // "not passed", not crash the whole workspace.
      let graded: GradeResult;
      try {
        const run = flattenSandpackRun(specs);
        graded = grade(meta, run.tests, run.technicalMessages);
      } catch (error) {
        console.error('Failed to grade assessment run', error);
        return;
      }
      queueMicrotask(() => {
        setResult(graded);
        recordAssessment(chapterId, {
          passed: graded.passed,
          passedConcepts: graded.passedConcepts,
          passedTests: graded.passedTests,
        });
      });
    },
    [meta, chapterId, recordAssessment],
  );

  return { result, onComplete };
}
