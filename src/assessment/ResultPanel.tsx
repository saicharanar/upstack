import type { ReactNode } from 'react';
import type { GradeResult } from './grade';

const STATUS_LABELS = {
  pending: 'Run the tests to check your work.',
  passed: 'Passed — all required concepts mastered.',
  failed: 'Not yet — keep iterating on the failing concepts.',
} as const;

function statusKey(result: GradeResult | null): keyof typeof STATUS_LABELS {
  if (!result) return 'pending';
  return result.passed ? 'passed' : 'failed';
}

export function ResultPanel({ result }: { result: GradeResult | null }): ReactNode {
  const status = statusKey(result);

  return (
    <section className="result-panel" data-status={status} aria-live="polite">
      <p className="result-panel__headline">{STATUS_LABELS[status]}</p>
      {result ? (
        <ul className="result-panel__concepts">
          {result.concepts.map((concept) => (
            <li key={concept.id} className="result-panel__concept" data-passed={concept.passed}>
              <span className="result-panel__concept-mark" aria-hidden="true">
                {concept.passed ? '✓' : '○'}
              </span>
              <span className="result-panel__concept-label">{concept.label}</span>
              {!concept.required ? <span className="result-panel__concept-tag">optional</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
