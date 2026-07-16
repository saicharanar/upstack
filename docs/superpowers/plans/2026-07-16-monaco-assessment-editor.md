# Monaco Assessment Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragile Sandpack editing surface with a locally bundled Monaco editor that gates execution on valid syntax, preserves drafts across runtime recovery, and presents test failures as an actionable Upstack-owned report.

**Architecture:** Monaco owns editable draft models and validates each debounced revision before publishing a complete snapshot to the Sandpack runtime. Sandpack remains a replaceable preview/test engine inside a scoped recovery boundary. Upstack converts Sandpack's test payload into ordered concept and check results, then renders a readable report instead of Sandpack's stock test UI.

**Tech Stack:** Next.js 15, React 19, TypeScript, Monaco Editor 0.55.1, `@monaco-editor/react` 4.7.0, Sandpack 2.20.0, Vitest 2, Playwright 1.61.

## Global Constraints

- IntelliSense is deterministic and locally bundled; no Monaco or type-definition CDN is used.
- Execution debounce is exactly 600 milliseconds.
- Only Monaco syntactic errors block execution; semantic warnings do not.
- Incomplete JavaScript or JSX never reaches Sandpack.
- The last valid preview stays visible while the current draft is invalid.
- Runtime restart preserves Monaco models and the current unsent draft.
- Sandpack remains the preview/test runner; WebContainers are outside this iteration.
- Hidden test source, iframe URLs, internal paths, and framework stacks are never exposed.
- Existing assessment metadata, pass rules, progress persistence, preview/console switch, and chapter navigation remain compatible.
- Inline `LiveExampleRunner` continues using `SandpackCodeEditor` in this iteration.

---

## File Structure

- `src/assessment/testResults.ts`: defensively flatten and sanitize Sandpack test payloads.
- `src/assessment/grade.ts`: map ordered test outcomes into concepts and calculate pass state.
- `src/assessment/AssessmentTestReport.tsx`: render summary, concept groups, checks, failure messages, and technical details.
- `src/assessment/executionGate.ts`: revision-aware 600 ms debounce and syntax-validation state machine.
- `src/assessment/monacoReactTypes.ts`: locally bundled assessment-focused React/JSX declarations.
- `src/assessment/monacoSetup.ts`: configure local Monaco workers, JavaScript compiler options, diagnostics, and extra libraries.
- `src/assessment/AssessmentEditor.tsx`: Monaco tabs/models, draft state, formatting, validation, and execution publication.
- `src/assessment/AssessmentRunner.tsx`: place the persistent editor beside the recoverable Sandpack runtime.
- `src/assessment/SandpackBoundary.tsx`: restart only the runtime when an `onRetry` callback is supplied.
- `app/globals.css`: Monaco toolbar, execution states, hidden test engine, and readable report styling.
- `tests/unit/testResults.test.ts`: sanitizer and nested Sandpack payload coverage.
- `tests/unit/grade.test.ts`: ordered per-concept check coverage.
- `tests/unit/executionGate.test.ts`: debounce, stale revision, block, and publish coverage.
- `tests/unit/assessmentTestReport.test.ts`: server-rendered semantic report coverage.
- `drive.e2e.mjs`: current multi-stack route, incomplete-code gating, passing flow, and draft-preserving restart.

---

### Task 1: Preserve actionable test results

**Files:**
- Create: `src/assessment/testResults.ts`
- Modify: `src/assessment/useAssessmentResult.ts`
- Modify: `src/assessment/grade.ts`
- Create: `tests/unit/testResults.test.ts`
- Modify: `tests/unit/grade.test.ts`

**Interfaces:**
- Produces: `flattenSandpackRun(specs): FlattenedAssessmentRun`.
- Produces: `sanitizeFailureMessage(value): string | null`.
- Produces: `grade(meta, results, technicalMessages?): GradeResult` with ordered `ConceptResult.checks`.
- Consumes: Sandpack test nodes with optional `tests`, `describes`, `errors`, and suite `error`.

- [ ] **Step 1: Write failing sanitizer and nested-payload tests**

Create fixtures that contain a useful assertion followed by CodeSandbox worker stack lines. Assert
that `flattenSandpackRun` returns every nested check, keeps pass/fail status, keeps the assertion
summary, removes `https://2-19-8-sandpack.codesandbox.io/`, and records suite errors separately.

```ts
expect(flattenSandpackRun(specs)).toEqual({
  tests: [
    { name: 'renders the avatar', passed: false, failureMessage: 'Expected an image with alt text' },
    { name: 'shows the heading', passed: true, failureMessage: null },
  ],
  technicalMessages: ['Unable to initialize one test suite'],
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- tests/unit/testResults.test.ts tests/unit/grade.test.ts`

Expected: FAIL because `testResults.ts`, `checks`, and `technicalMessages` do not exist.

- [ ] **Step 3: Implement defensive flattening and message sanitization**

Use these public result types:

```ts
export interface SpecTestResult {
  readonly name: string;
  readonly passed: boolean;
  readonly failureMessage: string | null;
}

export interface FlattenedAssessmentRun {
  readonly tests: readonly SpecTestResult[];
  readonly technicalMessages: readonly string[];
}
```

Sanitization rules are deterministic: split lines, trim, remove empty lines, drop lines beginning
with `at `, drop lines containing CodeSandbox worker URLs or internal test paths, remove duplicates,
keep at most four useful lines, and cap the final string at 480 characters.

Update `grade.ts` with:

```ts
export interface CheckResult extends SpecTestResult {}

export interface ConceptResult {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  readonly passed: boolean;
  readonly checks: readonly CheckResult[];
}

export interface GradeResult {
  readonly passed: boolean;
  readonly concepts: readonly ConceptResult[];
  readonly passedConcepts: readonly string[];
  readonly passedTests: readonly string[];
  readonly technicalMessages: readonly string[];
}
```

Build each concept's checks from `meta.concepts[].tests` so missing outcomes become failed checks in
metadata order. `useAssessmentResult` calls `flattenSandpackRun`, then passes both arrays to `grade`.

- [ ] **Step 4: Run focused tests and confirm they pass**

Run: `npm test -- tests/unit/testResults.test.ts tests/unit/grade.test.ts`

Expected: both files PASS with nested, malformed, missing, optional, and percentage-rule cases.

- [ ] **Step 5: Commit the result-model change**

```bash
git add src/assessment/testResults.ts src/assessment/useAssessmentResult.ts src/assessment/grade.ts tests/unit/testResults.test.ts tests/unit/grade.test.ts
git commit -m "Improve assessment test result data"
```

---

### Task 2: Build the understandable test report

**Files:**
- Create: `src/assessment/AssessmentTestReport.tsx`
- Delete: `src/assessment/ResultPanel.tsx`
- Create: `tests/unit/assessmentTestReport.test.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `GradeResult | null`, `nextHref: string | null`, and `isRunning: boolean`.
- Produces: `AssessmentTestReport` with accessible summary and grouped checks.
- Consumes later: `AssessmentRunner` mounts this above a visually hidden `SandpackTests` engine.

- [ ] **Step 1: Write failing semantic report tests**

Use `renderToStaticMarkup(createElement(AssessmentTestReport, props))` so the Node Vitest environment
does not need jsdom. Cover pending, partial failure, full pass, optional concept, technical details,
and status text that remains understandable without CSS.

```ts
expect(html).toContain('2 of 4 checks passed');
expect(html).toContain('Needs work');
expect(html).toContain('Expected an image with alt text');
expect(html).toContain('<details open="">');
expect(html).not.toContain('sandpack.codesandbox.io');
```

- [ ] **Step 2: Run the focused report test and confirm failure**

Run: `npm test -- tests/unit/assessmentTestReport.test.ts`

Expected: FAIL because `AssessmentTestReport` does not exist.

- [ ] **Step 3: Implement the report component**

Render a sticky summary header with `passedChecks of totalChecks checks passed`. Sort concept groups
stably into failing required, passing required, then optional. Each group is a `<details>` element;
failed required groups receive `open`, passing groups are collapsed. Each check displays a text mark,
name, and sanitized failure message. Render technical messages in a final collapsed `<details>`.

Use these status labels exactly:

```ts
const REPORT_LABELS = {
  pending: 'Waiting for the first test run',
  running: 'Checking your latest changes…',
  passed: 'Assessment passed',
  failed: 'Some checks still need work',
} as const;
```

The `Continue to next chapter` action appears only when `result.passed && nextHref`.

- [ ] **Step 4: Add the report layout styles**

Remove the horizontal wrapping overrides for `.result-panel__concepts`. Add `.assessment-report`,
`__summary`, `__count`, `__groups`, `__concept`, `__concept-heading`, `__status`, `__checks`,
`__check`, `__failure`, and `__technical` styles. Use existing semantic tokens, 1 px borders, no
gradient, no heavy shadow, and text labels alongside every status color.

- [ ] **Step 5: Run the report and full unit tests**

Run: `npm test -- tests/unit/assessmentTestReport.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all unit tests PASS.

- [ ] **Step 6: Commit the report**

```bash
git add src/assessment/AssessmentTestReport.tsx src/assessment/ResultPanel.tsx tests/unit/assessmentTestReport.test.ts app/globals.css
git commit -m "Redesign the assessment test report"
```

---

### Task 3: Add the revision-aware execution gate

**Files:**
- Create: `src/assessment/executionGate.ts`
- Create: `tests/unit/executionGate.test.ts`

**Interfaces:**
- Produces: `ExecutionStatus = 'ready' | 'editing' | 'checking' | 'blocked' | 'running'`.
- Produces: `AssessmentExecutionGate.schedule(files)` and `.dispose()`.
- Calls: async `validate(files)` and `publish({ files, revision })`.

- [ ] **Step 1: Write failing fake-timer tests**

Cover these cases independently: a burst of edits causes one validation after exactly 600 ms;
invalid syntax emits `blocked` and never publishes; valid syntax publishes once; a slow result for
revision 1 is ignored after revision 2 is scheduled; dispose cancels pending work.

```ts
vi.useFakeTimers();
gate.schedule({ '/App.js': 'export default (' });
await vi.advanceTimersByTimeAsync(599);
expect(validate).not.toHaveBeenCalled();
await vi.advanceTimersByTimeAsync(1);
expect(validate).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the gate test and confirm failure**

Run: `npm test -- tests/unit/executionGate.test.ts`

Expected: FAIL because the execution gate does not exist.

- [ ] **Step 3: Implement the minimal gate**

Use immutable `DraftFiles = Readonly<Record<string, string>>`, increment a numeric revision on every
schedule, clone the scheduled snapshot, and compare the captured revision after validation resolves.
Emit `editing`, then `checking`, then either `blocked` or `running`. Never catch a validator exception
as valid; convert it to `blocked`.

```ts
export interface ValidatedRevision {
  readonly files: DraftFiles;
  readonly revision: number;
}

export class AssessmentExecutionGate {
  schedule(files: DraftFiles): void;
  dispose(): void;
}
```

- [ ] **Step 4: Run the gate tests**

Run: `npm test -- tests/unit/executionGate.test.ts`

Expected: all gate tests PASS without real-time waits.

- [ ] **Step 5: Commit the execution gate**

```bash
git add src/assessment/executionGate.ts tests/unit/executionGate.test.ts
git commit -m "Gate assessment execution on valid revisions"
```

---

### Task 4: Add locally bundled Monaco and IDE suggestions

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/assessment/monacoReactTypes.ts`
- Create: `src/assessment/monacoSetup.ts`
- Create: `src/assessment/AssessmentEditor.tsx`
- Modify: `src/assessment/AssessmentFormatButton.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: bundle file codes, visible paths, active path, read-only flags, and current status.
- Produces: `onValidated({ files, revision })` after Monaco syntactic validation.
- Uses: `AssessmentExecutionGate` from Task 3.

- [ ] **Step 1: Install pinned Monaco dependencies**

Run: `npm install @monaco-editor/react@4.7.0 monaco-editor@0.55.1`

Expected: both packages appear in `dependencies` and the lockfile resolves local worker assets.

- [ ] **Step 2: Add local Monaco configuration and assessment-focused React types**

Configure `loader.config({ monaco })` with the imported `monaco-editor` module. Define local editor
and TypeScript workers with `new Worker(new URL(..., import.meta.url))`. Configure JavaScript defaults
with `allowJs`, `checkJs`, `allowNonTsExtensions`, `NodeJs` module resolution, `ReactJSX`, ES2022 target,
DOM libraries, eager model sync, and diagnostics that keep syntax validation enabled.

Register a local declaration string that covers JSX intrinsic elements, `ReactNode`, components,
events, refs, context, and the common hooks used by the curriculum (`useState`, `useReducer`,
`useContext`, `useEffect`, `useLayoutEffect`, `useMemo`, `useCallback`, `useRef`, `useId`,
`useTransition`, `useDeferredValue`, `useSyncExternalStore`, `useImperativeHandle`, and `memo`).
Register it under `file:///node_modules/@types/react/index.d.ts` through `addExtraLib`.

- [ ] **Step 3: Implement `AssessmentEditor`**

Use `@monaco-editor/react` with a locally configured loader, `saveViewState`, stable model paths such
as `file:///assessment/App.js`, automatic layout, minimap disabled, line numbers on, quick suggestions
on, suggest-on-trigger-characters on, tab size 2, and word wrap off.

On change, update the active draft and schedule the complete visible-file snapshot through the gate.
The validator requests `getSyntacticDiagnostics` from Monaco's JavaScript worker for every visible
model and returns true only when all returned arrays are empty. Dispose the gate and Monaco models on
assessment unmount, not on Sandpack runtime restart.

- [ ] **Step 4: Make formatting editor-controlled**

Change `AssessmentFormatButton` to accept `code`, `readOnly`, and `onFormatted(code)` props instead of
using `useActiveCode`. Keep the current Prettier Babel configuration and error copy. The Monaco editor
passes the formatted code back through its normal draft-change path so it is syntax-gated.

- [ ] **Step 5: Add restrained editor styles**

Style `.assessment-editor`, file tabs, toolbar, and execution status using existing tokens. Monaco
fills the panel height, tabs use filename labels, the active tab uses a border/accent rather than a
filled pill, and status copy remains visible without shifting the editor.

- [ ] **Step 6: Verify static correctness**

Run: `npm run typecheck`

Expected: PASS with no missing worker, Monaco, or controlled-format props.

Run: `npm test`

Expected: all unit tests PASS.

- [ ] **Step 7: Commit Monaco integration**

```bash
git add package.json package-lock.json src/assessment/monacoReactTypes.ts src/assessment/monacoSetup.ts src/assessment/AssessmentEditor.tsx src/assessment/AssessmentFormatButton.tsx app/globals.css
git commit -m "Add Monaco assessment editing"
```

---

### Task 5: Separate the persistent editor from the recoverable runtime

**Files:**
- Modify: `src/assessment/AssessmentRunner.tsx`
- Modify: `src/assessment/SandpackBoundary.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: validated Monaco snapshots from Task 4.
- Produces: Sandpack `files` containing validated visible code plus unchanged hidden/support files.
- Consumes: `AssessmentTestReport` from Task 2 and grading callback from Task 1.

- [ ] **Step 1: Restructure `AssessmentRunner`**

Move the horizontal `PanelGroup` outside `SandpackProvider`. Mount `AssessmentEditor` in the left
panel. In the right panel, mount a keyed `SandpackBoundary` containing `SandpackProvider`, preview,
console, hidden `SandpackTests`, and `AssessmentTestReport`.

Initialize runtime files from `toSandpackFiles(bundle.files)`. When a validated revision arrives,
create a new runtime file map by replacing code only for paths present in the validated draft; keep
hidden tests, read-only state, active state, and dependencies unchanged.

- [ ] **Step 2: Hide Sandpack's stock report without disabling its engine**

Mount `SandpackTests` with `hideTestsAndSupressLogs`, `showVerboseButton={false}`,
`showWatchButton={false}`, and the existing `onComplete`. Put it inside `.assessment-test-engine`, a
1 px clipped container that stays mounted and executable. Render `AssessmentTestReport` as the only
visible content of the tests pane.

- [ ] **Step 3: Scope runtime recovery**

Add optional `onRetry?: () => void` and `preservesDraft?: boolean` props to `SandpackBoundary`. When
`onRetry` exists, the button calls it; otherwise retain full-page reload behavior for inline live
examples. `AssessmentRunner` increments `runtimeKey`, remounting only the right-side boundary and
provider from the last validated runtime files. Expose the same restart callback as a quiet
`Restart preview` button in the existing Preview/Console toolbar so learners can recover a stalled
frame before the boundary throws.

Use this recovery copy:

```text
The preview runtime stopped, but your code is safe.
Restart the preview to run the last valid version again.
```

- [ ] **Step 4: Connect execution and report states**

Pass `isRunning={executionStatus === 'running'}` to the report. On test completion, grade the payload
and change `running` to `ready` without overwriting a newer `editing`, `checking`, or `blocked` state.
While syntax is blocked, preserve the previous report and add only the editor message
`Fix syntax errors to update preview`.

- [ ] **Step 5: Run correctness checks**

Run: `npm run typecheck && npm test && npm run verify:smoke`

Expected: every command PASS and existing grading/progress behavior remains intact.

- [ ] **Step 6: Commit the runtime separation**

```bash
git add src/assessment/AssessmentRunner.tsx src/assessment/SandpackBoundary.tsx app/globals.css
git commit -m "Isolate the assessment runtime from editor drafts"
```

---

### Task 6: Repair and expand the end-to-end assessment flow

**Files:**
- Modify: `drive.e2e.mjs`

**Interfaces:**
- Validates: current `/learn/react/describing-ui/jsx/assessment` route.
- Validates: Monaco suggestions, syntax gate, report clarity, pass flow, progress persistence, and recovery.

- [ ] **Step 1: Update the stale route expectations and editor selectors**

Navigate directly to `/learn/react/describing-ui/jsx/assessment`, assert that URL, and replace
`.cm-content` selectors with `.monaco-editor textarea.inputarea`. Keep service workers blocked and the
existing CodeSandbox request proxy for deterministic headless runs.

- [ ] **Step 2: Add syntax-gate coverage**

Type `export default function UserCard() { return (` and wait longer than 600 ms. Assert the editor
shows `Fix syntax errors to update preview`, the previous report remains mounted, and
`.sandbox-error` is absent.

- [ ] **Step 3: Add report and passing-flow coverage**

Type a valid partial solution and assert a visible `checks passed` count, a `Needs work` group, and
an individual failed check. Type the correct solution, wait for `Assessment passed`, continue to the
chapter, and retain the existing completed/unlocked/localStorage assertions.

- [ ] **Step 4: Add runtime recovery coverage**

Capture the Monaco model text, click the always-available `Restart preview` toolbar action, wait for
the Sandpack frame and test report to return, and assert the Monaco model text is unchanged. The
component test from Task 2 covers the boundary-specific fallback copy; this end-to-end check covers
the shared remount path without adding a production-only crash hook.

- [ ] **Step 5: Run the complete verification suite**

Run in terminal 1: `npm run dev -- --port 3013`

Run in terminal 2: `npm run e2e`

Expected: `RESULT: ALL EXIT CRITERIA MET`.

Then run: `npm run typecheck && npm test && npm run ci:content && npm run verify:smoke && npm run build`

Expected: every command exits 0; build generates all assessment routes.

- [ ] **Step 6: Commit end-to-end coverage**

```bash
git add drive.e2e.mjs
git commit -m "Verify the Monaco assessment workflow"
```

---

### Task 7: Final intent and accessibility review

**Files:**
- Review: all files changed in Tasks 1-6

**Interfaces:**
- Validates the complete feature against `docs/superpowers/specs/2026-07-16-monaco-assessment-editor-design.md`.

- [ ] **Step 1: Review the final diff for scope and accessibility**

Run: `git diff 3eef44c..HEAD --check`

Inspect that status is never color-only, every disclosure has a readable summary, the Monaco editor
has an accessible label, keyboard focus remains visible, hidden tests are not exposed, and no inline
live-example behavior changed.

- [ ] **Step 2: Run final verification from a clean process**

Run: `npm run typecheck && npm test && npm run ci:content && npm run verify:smoke && npm run build`

Expected: all commands exit 0 with no unhandled runtime or test errors.

- [ ] **Step 3: Record the final commit state**

Run: `git status --short && git log -7 --oneline`

Expected: the worktree is clean and the implementation commits are visible after the two design commits.
