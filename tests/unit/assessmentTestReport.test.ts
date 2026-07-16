import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AssessmentTestReport } from '@/assessment/AssessmentTestReport';
import type { GradeResult } from '@/assessment/grade';

const PARTIAL_RESULT: GradeResult = {
  passed: false,
  concepts: [
    {
      id: 'structure',
      label: 'Builds the card structure',
      required: true,
      passed: true,
      checks: [
        { name: 'renders one card', passed: true, failureMessage: null },
      ],
    },
    {
      id: 'avatar',
      label: 'Sets accessible image attributes',
      required: true,
      passed: false,
      checks: [
        {
          name: 'renders the avatar image with the correct alt text',
          passed: false,
          failureMessage: 'Expected an image with alt text',
        },
        { name: 'uses a non-empty image source', passed: true, failureMessage: null },
      ],
    },
    {
      id: 'bonus',
      label: 'Adds the optional biography',
      required: false,
      passed: false,
      checks: [
        { name: 'shows a biography', passed: false, failureMessage: null },
      ],
    },
  ],
  passedConcepts: ['structure'],
  passedTests: ['renders one card', 'uses a non-empty image source'],
  technicalMessages: ['Unable to start one optional suite'],
};

function renderReport(
  result: GradeResult | null,
  options: { isRunning?: boolean; nextHref?: string | null } = {},
): string {
  return renderToStaticMarkup(createElement(AssessmentTestReport, {
    result,
    isRunning: options.isRunning ?? false,
    nextHref: options.nextHref ?? null,
  }));
}

describe('assessment test report', () => {
  it('shows a useful summary and expands the failed concept first', () => {
    const html = renderReport(PARTIAL_RESULT);

    expect(html).toContain('Some checks still need work');
    expect(html).toContain('2 of 4 checks passed');
    expect(html.indexOf('Sets accessible image attributes')).toBeLessThan(
      html.indexOf('Builds the card structure'),
    );
    expect(html).toMatch(/<details[^>]*open=""[^>]*>.*Sets accessible image attributes/s);
    expect(html).toContain('Expected an image with alt text');
    expect(html).toContain('Needs work');
  });

  it('keeps technical details collapsed and strips runtime internals upstream', () => {
    const html = renderReport(PARTIAL_RESULT);

    expect(html).toContain('Technical details');
    expect(html).toContain('Unable to start one optional suite');
    expect(html).not.toMatch(/<details[^>]*open=""[^>]*>\s*<summary[^>]*>Technical details/s);
    expect(html).not.toContain('sandpack.codesandbox.io');
  });

  it('announces running and pending states plainly', () => {
    expect(renderReport(null, { isRunning: true })).toContain('Checking your latest changes…');
    expect(renderReport(null)).toContain('Waiting for the first test run');
  });

  it('offers the next chapter only after the assessment passes', () => {
    const passedResult: GradeResult = {
      ...PARTIAL_RESULT,
      passed: true,
      concepts: PARTIAL_RESULT.concepts.map((concept) => ({
        ...concept,
        passed: true,
        checks: concept.checks.map((check) => ({ ...check, passed: true, failureMessage: null })),
      })),
      passedConcepts: ['structure', 'avatar', 'bonus'],
      passedTests: PARTIAL_RESULT.concepts.flatMap((concept) => concept.checks.map((check) => check.name)),
      technicalMessages: [],
    };

    const passedHtml = renderReport(passedResult, { nextHref: '/next' });
    expect(passedHtml).toContain('Assessment passed');
    expect(passedHtml).toContain('Continue to next chapter');
    expect(renderReport(PARTIAL_RESULT, { nextHref: '/next' })).not.toContain('Continue to next chapter');
  });
});
