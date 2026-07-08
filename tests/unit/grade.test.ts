import { describe, expect, it } from 'vitest';
import { grade, type SpecTestResult } from '@/assessment/grade';
import type { AssessmentMeta } from '@/content-layer/schema';

const META: AssessmentMeta = {
  id: 'demo',
  runner: 'sandpack',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: [],
  readOnlyFiles: [],
  dependencies: {},
  concepts: [
    { id: 'a', label: 'Concept A', tests: ['a1', 'a2'], required: true },
    { id: 'b', label: 'Concept B', tests: ['b1'], required: true },
    { id: 'c', label: 'Concept C', tests: ['c1'], required: false },
  ],
};

function results(...names: string[]): SpecTestResult[] {
  return names.map((name) => ({ name, passed: true }));
}

describe('grading an exercise', () => {
  it('passes only when every required concept is fully solved', () => {
    const result = grade(META, results('a1', 'a2', 'b1'));
    expect(result.passed).toBe(true);
    expect(result.passedConcepts).toEqual(['a', 'b']);
  });

  it('does not pass when a required concept has a failing test', () => {
    const result = grade(META, results('a1', 'b1'));
    expect(result.passed).toBe(false);
    expect(result.concepts.find((concept) => concept.id === 'a')?.passed).toBe(false);
  });

  it('ignores optional concepts when deciding the overall result', () => {
    const result = grade(META, results('a1', 'a2', 'b1'));
    expect(result.passed).toBe(true);
    expect(result.concepts.find((concept) => concept.id === 'c')?.passed).toBe(false);
  });

  it('records exactly which tests passed', () => {
    const result = grade(META, results('a1', 'b1'));
    expect([...result.passedTests].sort()).toEqual(['a1', 'b1']);
  });

  it('honours a minimum-percentage pass rule across required concepts', () => {
    const percentMeta: AssessmentMeta = { ...META, passRule: { minPercent: 50 } };
    const result = grade(percentMeta, results('a1', 'a2'));
    expect(result.passed).toBe(true);
  });
});
