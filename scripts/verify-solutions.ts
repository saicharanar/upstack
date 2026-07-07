import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { PROJECT_ROOT, findAssessments } from './lib';

const WORKSPACE = path.join(PROJECT_ROOT, '.tmp', 'solutions');

const VITEST_CONFIG = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: { globals: true, environment: 'jsdom', include: ['**/*.test.jsx'] },
});
`;

function toJsxName(fileName: string): string {
  return fileName.endsWith('.js') ? `${fileName.slice(0, -3)}.jsx` : fileName;
}

function copyInto(sourceDir: string, destination: string): void {
  if (!fs.existsSync(sourceDir)) return;

  const files = fg.sync('**/*', { cwd: sourceDir, onlyFiles: true });
  for (const relative of files) {
    const target = path.join(destination, toJsxName(relative));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(sourceDir, relative), target);
  }
}

function runSolution(id: string, workDir: string): boolean {
  try {
    execFileSync('npx', ['vitest', 'run', '--config', 'vitest.config.mjs'], {
      cwd: workDir,
      stdio: 'inherit',
    });
    console.log(`[${id}] solution passes all hidden tests ✓`);
    return true;
  } catch {
    console.error(`[${id}] solution FAILED its hidden tests ✗`);
    return false;
  }
}

function run(): void {
  fs.rmSync(WORKSPACE, { recursive: true, force: true });
  const assessments = findAssessments();
  let failures = 0;

  for (const assessment of assessments) {
    const workDir = path.join(WORKSPACE, assessment.id);
    fs.mkdirSync(workDir, { recursive: true });

    copyInto(assessment.filesDir, workDir);
    copyInto(assessment.solutionDir, workDir);
    copyInto(assessment.testsDir, workDir);
    fs.writeFileSync(path.join(workDir, 'vitest.config.mjs'), VITEST_CONFIG);

    if (!runSolution(assessment.id, workDir)) failures += 1;
  }

  if (failures > 0) {
    console.error(`\nSolution-solves-tests gate failed for ${failures} assessment(s).`);
    process.exit(1);
  }

  console.log(`\nAll ${assessments.length} solution(s) provably solve their tests.`);
}

run();
