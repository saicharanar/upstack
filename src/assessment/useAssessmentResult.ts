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

// A spec/describe node can arrive without its `tests`/`describes` maps when the
// suite errors before running (compile error, a throw at import, a bundler
// hiccup). `Object.values(undefined)` throws "Cannot convert undefined to
// object", which — from the onComplete callback — surfaces as a page-level
// runtime crash. Treat missing maps as empty so an errored run just grades as
// "not passed yet" instead of taking the whole workspace down.
function collectTests(node: {
  tests?: Record<string, SandpackTest>;
  describes?: Record<string, SandpackDescribe>;
} | null | undefined): SpecTestResult[] {
  if (!node) return [];
  const own = Object.values(node.tests ?? {}).map((test) => ({ name: test.name, passed: test.status === 'pass' }));
  const nested = Object.values(node.describes ?? {}).flatMap((describe) => collectTests(describe));
  return [...own, ...nested];
}

export function flattenSpecs(specs: SandpackSpecs | null | undefined): SpecTestResult[] {
  if (!specs) return [];
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
      // This fires on every SandpackTests run, including error runs. Never let a
      // throw here escape into the render tree — a failed grade should degrade to
      // "not passed", not crash the whole workspace.
      let graded: GradeResult;
      try {
        graded = grade(meta, flattenSpecs(specs));
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
