import { PASS_RULE_ALL_REQUIRED, type AssessmentMeta, type PassRule } from '@/content-layer/schema';

export interface SpecTestResult {
  readonly name: string;
  readonly passed: boolean;
}

export interface ConceptResult {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  readonly passed: boolean;
}

export interface GradeResult {
  readonly passed: boolean;
  readonly concepts: readonly ConceptResult[];
  readonly passedConcepts: readonly string[];
  readonly passedTests: readonly string[];
}

function scoreConcepts(meta: AssessmentMeta, passedTests: ReadonlySet<string>): ConceptResult[] {
  return meta.concepts.map((concept) => ({
    id: concept.id,
    label: concept.label,
    required: concept.required,
    passed: concept.tests.every((testName) => passedTests.has(testName)),
  }));
}

function evaluatePassRule(passRule: PassRule, concepts: readonly ConceptResult[]): boolean {
  const required = concepts.filter((concept) => concept.required);
  const gated = required.length > 0 ? required : concepts;
  if (gated.length === 0) return false;

  if (passRule === PASS_RULE_ALL_REQUIRED) return gated.every((concept) => concept.passed);

  const passedCount = gated.filter((concept) => concept.passed).length;
  const percent = (passedCount / gated.length) * 100;
  return percent >= passRule.minPercent;
}

export function grade(meta: AssessmentMeta, results: readonly SpecTestResult[]): GradeResult {
  const passedTests = new Set(results.filter((result) => result.passed).map((result) => result.name));
  const concepts = scoreConcepts(meta, passedTests);

  return {
    passed: evaluatePassRule(meta.passRule, concepts),
    concepts,
    passedConcepts: concepts.filter((concept) => concept.passed).map((concept) => concept.id),
    passedTests: [...passedTests],
  };
}
