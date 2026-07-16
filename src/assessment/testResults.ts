import type { SpecTestResult } from './grade';

const MAX_FAILURE_MESSAGE_LENGTH = 480;
const MAX_FAILURE_MESSAGE_LINES = 4;
const STACK_LINE_PATTERN = /^at\s/u;
const INTERNAL_PATH_PATTERN = /(?:sandpack\.codesandbox\.io|\/(?:[^/\s]+\.)?test\.[jt]sx?):/iu;

interface SandpackResultNode {
  readonly tests?: unknown;
  readonly describes?: unknown;
  readonly error?: unknown;
}

export interface FlattenedAssessmentRun {
  readonly tests: readonly SpecTestResult[];
  readonly technicalMessages: readonly string[];
}

function messageFromError(error: unknown): string | null {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return null;

  const message = Reflect.get(error, 'message');
  return typeof message === 'string' ? message : null;
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Readonly<Record<string, unknown>>;
}

function firstFailureMessage(errors: unknown): string | null {
  if (!Array.isArray(errors)) return null;
  for (const error of errors) {
    const message = sanitizeFailureMessage(messageFromError(error));
    if (message) return message;
  }
  return null;
}

function collectTests(node: SandpackResultNode | null | undefined): SpecTestResult[] {
  if (!node) return [];

  const ownTests = Object.values(asRecord(node.tests)).flatMap((value) => {
    const test = asRecord(value);
    if (typeof test.name !== 'string') return [];
    const passed = test.status === 'pass';
    return [{
      name: test.name,
      passed,
      failureMessage: passed ? null : firstFailureMessage(test.errors),
    }];
  });

  const nestedTests = Object.values(asRecord(node.describes)).flatMap((value) =>
    collectTests(value as SandpackResultNode),
  );

  return [...ownTests, ...nestedTests];
}

export function sanitizeFailureMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const usefulLines = value
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !STACK_LINE_PATTERN.test(line))
    .filter((line) => !INTERNAL_PATH_PATTERN.test(line));

  const uniqueLines = [...new Set(usefulLines)].slice(0, MAX_FAILURE_MESSAGE_LINES);
  if (uniqueLines.length === 0) return null;
  return uniqueLines.join('\n').slice(0, MAX_FAILURE_MESSAGE_LENGTH);
}

export function flattenSandpackRun(specs: unknown): FlattenedAssessmentRun {
  const tests: SpecTestResult[] = [];
  const technicalMessages: string[] = [];

  for (const value of Object.values(asRecord(specs))) {
    if (!value || typeof value !== 'object') continue;
    const spec = value as SandpackResultNode;
    tests.push(...collectTests(spec));

    const technicalMessage = sanitizeFailureMessage(messageFromError(spec.error));
    if (technicalMessage) technicalMessages.push(technicalMessage);
  }

  return {
    tests,
    technicalMessages: [...new Set(technicalMessages)],
  };
}
