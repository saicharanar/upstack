import fs from 'node:fs';
import fg from 'fast-glob';
import { assessmentMetaSchema } from '../src/content-layer/schema';
import { findAssessments, importMeta } from './lib';

const TEST_NAME_PATTERN = /(?:test|it)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

function testNamesIn(dir: string): Set<string> {
  const files = fg.sync('**/*', { cwd: dir, absolute: true, onlyFiles: true });
  const names = new Set<string>();

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(TEST_NAME_PATTERN)) {
      if (match[2]) names.add(match[2]);
    }
  }

  return names;
}

async function run(): Promise<void> {
  const assessments = findAssessments();
  let failures = 0;

  for (const assessment of assessments) {
    const meta = assessmentMetaSchema.parse(await importMeta(assessment.metaPath));
    const testNames = testNamesIn(assessment.testsDir);

    for (const concept of meta.concepts) {
      for (const testName of concept.tests) {
        if (testNames.has(testName)) continue;
        console.error(`[${assessment.id}] concept "${concept.id}" references a missing test: "${testName}"`);
        failures += 1;
      }
    }
  }

  if (failures > 0) {
    console.error(`\nConcept→test existence check failed with ${failures} issue(s).`);
    process.exit(1);
  }

  console.log(`Concept→test map OK across ${assessments.length} assessment(s).`);
}

await run();
