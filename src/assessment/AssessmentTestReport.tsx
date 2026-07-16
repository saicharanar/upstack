import Link from 'next/link';
import React from 'react';
import type { ReactNode } from 'react';
import type { ConceptResult, GradeResult } from './grade';

const REPORT_LABELS = {
  pending: 'Waiting for the first test run',
  running: 'Checking your latest changes…',
  passed: 'Assessment passed',
  failed: 'Some checks still need work',
} as const;

type ReportStatus = keyof typeof REPORT_LABELS;

function reportStatus(result: GradeResult | null, isRunning: boolean): ReportStatus {
  if (isRunning) return 'running';
  if (!result) return 'pending';
  return result.passed ? 'passed' : 'failed';
}

function conceptRank(concept: ConceptResult): number {
  if (!concept.required) return 2;
  return concept.passed ? 1 : 0;
}

function orderedConcepts(concepts: readonly ConceptResult[]): ConceptResult[] {
  return concepts
    .map((concept, index) => ({ concept, index }))
    .sort((left, right) => conceptRank(left.concept) - conceptRank(right.concept) || left.index - right.index)
    .map(({ concept }) => concept);
}

function conceptStatus(concept: ConceptResult): string {
  if (!concept.required) return concept.passed ? 'Optional · passed' : 'Optional';
  return concept.passed ? 'Passed' : 'Needs work';
}

function ConceptGroup({ concept }: { readonly concept: ConceptResult }): ReactNode {
  const passedChecks = concept.checks.filter((check) => check.passed).length;

  return (
    <details
      className="assessment-report__concept"
      data-passed={concept.passed}
      data-required={concept.required}
      open={concept.required && !concept.passed}
    >
      <summary className="assessment-report__concept-heading">
        <span className="assessment-report__concept-copy">
          <span className="assessment-report__concept-label">{concept.label}</span>
          <span className="assessment-report__concept-count">
            {passedChecks} of {concept.checks.length} checks
          </span>
        </span>
        <span className="assessment-report__status">{conceptStatus(concept)}</span>
      </summary>

      <ul className="assessment-report__checks">
        {concept.checks.map((check) => (
          <li key={check.name} className="assessment-report__check" data-passed={check.passed}>
            <span className="assessment-report__check-mark" aria-hidden="true">
              {check.passed ? '✓' : '×'}
            </span>
            <span className="assessment-report__check-copy">
              <span className="assessment-report__check-name">{check.name}</span>
              {!check.passed && check.failureMessage ? (
                <span className="assessment-report__failure">{check.failureMessage}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export interface AssessmentTestReportProps {
  readonly result: GradeResult | null;
  readonly isRunning: boolean;
  readonly nextHref: string | null;
}

export function AssessmentTestReport({
  result,
  isRunning,
  nextHref,
}: AssessmentTestReportProps): ReactNode {
  const status = reportStatus(result, isRunning);
  const checks = result?.concepts.flatMap((concept) => concept.checks) ?? [];
  const passedChecks = checks.filter((check) => check.passed).length;

  return (
    <section className="assessment-report" data-status={status} aria-live="polite">
      <header className="assessment-report__summary">
        <div>
          <p className="assessment-report__eyebrow">Test results</p>
          <h2 className="assessment-report__headline">{REPORT_LABELS[status]}</h2>
          {result ? (
            <p className="assessment-report__count">
              {passedChecks} of {checks.length} checks passed
            </p>
          ) : null}
        </div>
        {result?.passed && nextHref ? (
          <Link className="button button--primary assessment-report__next" href={nextHref}>
            Continue to next chapter
          </Link>
        ) : null}
      </header>

      {result ? (
        <div className="assessment-report__body">
          <div className="assessment-report__groups">
            {orderedConcepts(result.concepts).map((concept) => (
              <ConceptGroup key={concept.id} concept={concept} />
            ))}
          </div>

          {result.technicalMessages.length > 0 ? (
            <details className="assessment-report__technical">
              <summary>Technical details</summary>
              <ul>
                {result.technicalMessages.map((message) => <li key={message}>{message}</li>)}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
