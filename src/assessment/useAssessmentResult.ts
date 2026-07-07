'use client';

import { useCallback, useState } from 'react';
import type { AssessmentMeta } from '@/content-layer/schema';
import { useProgressActions } from '@/progress/ProgressProvider';
import { grade, type GradeResult, type SpecTestResult } from './grade';

type SandpackTestStatus = 'idle' | 'running' | 'pass' | 'fail';

interface SandpackTest {
  readonly name: string;
  readonly status: SandpackTestStatus;
}

interface SandpackDescribe {
  readonly tests: Record<string, SandpackTest>;
  readonly describes: Record<string, SandpackDescribe>;
}

interface SandpackSpec {
  readonly tests: Record<string, SandpackTest>;
  readonly describes: Record<string, SandpackDescribe>;
}

export type SandpackSpecs = Record<string, SandpackSpec>;

function collectTests(node: { tests: Record<string, SandpackTest>; describes: Record<string, SandpackDescribe> }): SpecTestResult[] {
  const own = Object.values(node.tests).map((test) => ({ name: test.name, passed: test.status === 'pass' }));
  const nested = Object.values(node.describes).flatMap((describe) => collectTests(describe));
  return [...own, ...nested];
}

export function flattenSpecs(specs: SandpackSpecs): SpecTestResult[] {
  return Object.values(specs).flatMap((spec) => collectTests(spec));
}

export interface UseAssessmentResult {
  readonly result: GradeResult | null;
  readonly onComplete: (specs: SandpackSpecs) => void;
}

export function useAssessmentResult(meta: AssessmentMeta, chapterId: string): UseAssessmentResult {
  const { recordAssessment } = useProgressActions();
  const [result, setResult] = useState<GradeResult | null>(null);

  const onComplete = useCallback(
    (specs: SandpackSpecs) => {
      const graded = grade(meta, flattenSpecs(specs));
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
