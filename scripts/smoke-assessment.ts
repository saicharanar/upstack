import assert from 'node:assert/strict';
import { grade } from '../src/assessment/grade';
import { getAssessmentBundle } from '../src/content-layer/loader';

const ASSESSMENT_ID = 'jsx-user-card';

async function run(): Promise<void> {
  const bundle = await getAssessmentBundle(ASSESSMENT_ID);

  assert.ok(bundle.files[bundle.entry], `entry file ${bundle.entry} must be present`);
  assert.ok(
    Object.keys(bundle.files).some((file) => file.endsWith('.test.js')),
    'hidden tests must be bundled so the runner can execute them',
  );
  assert.ok(
    Object.keys(bundle.files).every((file) => !file.toLowerCase().includes('solution')),
    'reference solution must never reach the bundle',
  );
  assert.ok(
    Object.entries(bundle.files).every(([file, meta]) => (file.endsWith('.test.js') ? meta.hidden : true)),
    'hidden test files must be marked hidden',
  );

  const allTestNames = bundle.meta.concepts.flatMap((concept) => concept.tests);
  const passing = grade(bundle.meta, allTestNames.map((name) => ({ name, passed: true })));
  assert.equal(passing.passed, true, 'all tests passing must grade as passed');
  assert.equal(passing.passedConcepts.length, bundle.meta.concepts.length, 'every concept must be mastered');

  const failing = grade(bundle.meta, []);
  assert.equal(failing.passed, false, 'no tests passing must grade as failed');

  console.log(`Smoke OK: "${ASSESSMENT_ID}" assembles, excludes solution, and grades correctly.`);
}

await run();
