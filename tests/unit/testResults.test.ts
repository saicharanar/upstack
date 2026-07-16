import { describe, expect, it } from 'vitest';
import { flattenSandpackRun, sanitizeFailureMessage } from '@/assessment/testResults';

describe('Sandpack assessment results', () => {
  it('flattens nested checks and keeps useful failure information', () => {
    const result = flattenSandpackRun({
      '/UserCard.test.js': {
        name: '/UserCard.test.js',
        error: {
          message: [
            'Unable to initialize one test suite',
            'at /UserCard.test.js:1:1',
            'at https://2-19-8-sandpack.codesandbox.io/worker.js:1:20',
          ].join('\n'),
        },
        tests: {
          avatar: {
            name: 'renders the avatar',
            status: 'fail',
            errors: [
              {
                message: [
                  'Expected an image with alt text',
                  'at /UserCard.test.js:18:4',
                  'at https://2-19-8-sandpack.codesandbox.io/worker.js:1:20',
                ].join('\n'),
              },
            ],
          },
        },
        describes: {
          heading: {
            name: 'heading',
            tests: {
              heading: {
                name: 'shows the heading',
                status: 'pass',
                errors: [],
              },
            },
            describes: {},
          },
        },
      },
    });

    expect(result).toEqual({
      tests: [
        {
          name: 'renders the avatar',
          passed: false,
          failureMessage: 'Expected an image with alt text',
        },
        { name: 'shows the heading', passed: true, failureMessage: null },
      ],
      technicalMessages: ['Unable to initialize one test suite'],
    });
  });

  it('treats missing maps and malformed errors as empty data', () => {
    expect(flattenSandpackRun({ broken: null, empty: {} })).toEqual({
      tests: [],
      technicalMessages: [],
    });
  });

  it('deduplicates useful lines and caps failure messages', () => {
    const repeated = `Expected the button to be enabled\nExpected the button to be enabled\n${'x'.repeat(600)}`;
    const message = sanitizeFailureMessage(repeated);

    expect(message).toContain('Expected the button to be enabled');
    expect(message?.length).toBeLessThanOrEqual(480);
    expect(message?.match(/Expected the button to be enabled/g)).toHaveLength(1);
  });
});
