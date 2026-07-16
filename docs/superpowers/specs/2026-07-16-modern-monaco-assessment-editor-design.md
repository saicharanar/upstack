# Modern Monaco Assessment Editor Design

**Date:** 2026-07-16
**Status:** Implemented and verified

## Context

Upstack now separates the Monaco editing draft from the Sandpack execution snapshot. The
execution gate prevents incomplete JavaScript or JSX from reaching Sandpack, and the existing
test report makes assessment failures understandable. Those boundaries are working and must not
change as part of this work.

The remaining editor gap is JSX tag completion. The standalone Monaco integration provides
suggestions and syntax services, but it does not expose the same automatic closing-tag behavior
users expect from VS Code. A handwritten on-type parser would duplicate language-service behavior
and become another JSX edge-case surface to maintain.

The selected direction is a contained evaluation of `modern-monaco`, which packages Monaco with
VS Code-compatible JavaScript and TypeScript language tooling, including JSX and HTML closing-tag
support. The integration will sit behind an Upstack-owned editor-surface contract. The current
`@monaco-editor/react` implementation remains available as a lazy fallback until the replacement
passes every adoption gate below.

## Goals

- Automatically insert matching JSX closing tags for HTML elements, React components, and
  fragments using maintained language tooling rather than custom parsing.
- Preserve VS Code-style suggestion dropdowns for symbols, properties, imports, browser APIs,
  and React types.
- Preserve the current tabs, draft state, formatting command, syntax gate, runtime isolation,
  tests, grading, and runtime restart behavior.
- Keep all editor code, workers, themes, and type libraries local to the Upstack build.
- Contain editor initialization failures and recover with the current editor without losing the
  learner's draft.
- Make removal of the evaluated integration straightforward if it does not meet the acceptance
  gates.

## Non-goals

- Replacing Sandpack or changing how validated snapshots are executed.
- Changing the 600 millisecond execution debounce or the rules that block invalid syntax.
- Changing assessment content, hidden tests, grading, progress, or the test-report layout.
- Building a complete VS Code workbench, terminal, debugger, source control view, or extension
  marketplace.
- Adding an external language server or a server-side editor service.
- Fetching editor assets, workers, extensions, or type definitions from a CDN at runtime.
- Supporting arbitrary new assessment languages in this iteration.

## Decision

Upstack will evaluate an exactly pinned version of `modern-monaco` behind a narrow editor-surface
contract. The package is pre-1.0, so it will not become an unguarded application-wide dependency.
The exact version selected during implementation will be recorded without a caret or tilde and
upgraded only through an explicit editor verification pass.

The modern surface becomes the default only after it passes the functional, offline, failure,
and build gates in this document. Until then, the legacy Monaco surface remains the production
default. If a gate cannot be met without runtime network access or changes to the assessment
runtime contract, the evaluation fails and the current editor remains in place.

## Architecture

### Stable assessment editor shell

`AssessmentEditor` continues to own all product behavior around the code editor:

- File tabs and the active-file selection.
- Editable and read-only file rules.
- Learner draft state and draft restoration.
- Toolbar status and the format command.
- The `AssessmentExecutionGate` connection.
- Delivery of validated snapshots to the isolated Sandpack runtime.

It will depend on an internal editor-surface contract rather than directly owning a specific
React Monaco wrapper. The contract supplies only what the assessment shell needs:

```ts
interface AssessmentEditorSurfaceProps {
  path: string;
  value: string;
  readOnly: boolean;
  theme: "light" | "dark";
  onChange(value: string): void;
  onReady(api: AssessmentEditorSurfaceApi): void;
}

interface AssessmentEditorSurfaceApi {
  formatDocument(): Promise<void>;
  focus(): void;
}
```

The final types may adapt to existing project names, but the boundary will not expose
`modern-monaco`, VS Code service, or worker implementation details to runtime, grading, or page
components.

### `ModernMonacoSurface`

`ModernMonacoSurface` owns the new package integration:

- One guarded, client-only initialization promise for global Monaco and VS Code services.
- Local worker and extension registration.
- A workspace scoped to the current assessment files.
- Stable model URIs derived from assessment file paths.
- JavaScript, JSX, DOM, React, and React DOM language configuration.
- Model switching without recreating the surrounding assessment shell.
- Model and workspace disposal when the assessment changes or unmounts.

Global services initialize once per browser session. Assessment workspaces and models have a
shorter lifecycle and must be disposed without tearing down shared global services.

### `LegacyMonacoSurface`

The current `@monaco-editor/react` implementation moves behind the same surface contract with no
intentional behavior change. It is loaded lazily so it remains a recovery path without adding its
full cost to a successful modern-editor session.

During the evaluation phase, a development-only switch may select either surface for comparison.
The production selection is a static application decision, not a learner preference.

### Failure containment

Editor initialization is wrapped in an editor-only error boundary and a bounded initialization
timeout. If initialization rejects, times out, or the modern surface throws before it is ready,
Upstack mounts the legacy surface with the same current draft and active file.

An editor failure must not remount `AssessmentRuntime`, clear test results, reset progress, or
replace the full assessment with a generic error screen. After the modern surface has accepted
edits, fallback must first copy the latest values from the Upstack-owned draft; model state is
never the only copy of learner code.

## Asset and Network Policy

The assessment editor must load on a network connection that can serve the Upstack application
but blocks public package CDNs. The integration must therefore bundle or self-host:

- Monaco editor code and CSS.
- Every editor and language worker.
- VS Code service and extension assets used by the integration.
- Themes and icons required by the editor surface.
- TypeScript standard libraries.
- React and React DOM type definitions used for suggestions and diagnostics.

No editor path may fetch from `esm.sh`, `unpkg`, `jsDelivr`, or another third-party CDN at runtime.
Automatic type acquisition is disabled. Assessments continue to receive only the known dependency
types shipped with the application. Any package default that points to a CDN must be explicitly
overridden; if it cannot be overridden reliably, `modern-monaco` will not be adopted.

## Editing Behavior

The modern surface must preserve the current editor experience and add language-service-driven
closing tags:

- Typing `>` after `<section` inserts `</section>` and leaves the caret between the tags.
- Typing `>` after `<Card` inserts `</Card>` when the construct is a component element.
- Typing a JSX fragment opening inserts its matching fragment close.
- Self-closing tags remain self-closing and receive no duplicate close.
- Existing closing tags are not duplicated.
- Editing an opening tag follows the language service's normal linked-editing behavior when
  available; Upstack will not add a second custom synchronization layer.
- `Ctrl+Space` opens suggestions for identifiers and properties already available in the model
  and configured type environment.
- Formatting, keyboard navigation, selection, undo/redo, and read-only files continue to work.

Closing-tag insertion updates only the local draft. Like every other edit, it passes through the
existing execution debounce and syntax gate before Sandpack receives it.

The execution gate remains editor-independent. `modern-monaco` exposes combined syntax and
semantic markers rather than a public syntax-only diagnostic API, so a pinned local JavaScript
parser validates the draft snapshot. Editor semantic warnings remain visible but never block a
valid assessment from running.

## Data Flow

1. The assessment shell creates its initial draft independently of either editor surface.
2. The selected surface opens the active draft file in its assessment workspace.
3. A learner edit, including an inserted closing tag, calls the shell's `onChange` callback.
4. The shell updates the authoritative draft immediately.
5. The existing execution gate waits for 600 milliseconds of inactivity.
6. The execution gate parses every editable JavaScript or JSX file in the current revision.
7. An invalid revision remains editor-only while Sandpack displays the last valid preview.
8. A valid revision is published to the existing Sandpack runtime and tests run as they do now.
9. If the surface fails, the legacy adapter reopens the same authoritative draft; the runtime is
   unaffected.

## Rollout

### Phase 1: Isolated integration

- Add the exact dependency pin and local worker/asset configuration.
- Extract the editor-surface contract without changing assessment behavior.
- Put the existing integration behind `LegacyMonacoSurface`.
- Add `ModernMonacoSurface` behind a development-only selection.
- Verify both surfaces against the same draft, syntax-gate, and formatting tests.

### Phase 2: Adoption decision

- Run the browser acceptance suite with the modern surface selected.
- Verify the editor while public CDN requests are blocked.
- Exercise initialization failure and confirm draft-preserving fallback.
- Compare production bundle impact and page/build stability.
- Make the modern surface the default only when every required gate passes.

The legacy surface remains available through the first adopted browser verification cycle. Its
later removal is a separate cleanup decision, not part of this migration.

## Acceptance Gates

### Editor behavior

- HTML JSX tags, React component tags, and fragments close automatically with the correct caret
  placement.
- Self-closing elements and elements with an existing close are not duplicated.
- `Ctrl+Space` displays existing local symbols and known object properties.
- React component props and DOM APIs remain available when their local type definitions apply.
- Tabs, cursor restoration, undo/redo, read-only files, formatting, and draft persistence work.

### Runtime isolation

- Typing incomplete JSX never renders the generic `sandbox hit a snag` screen.
- Invalid syntax leaves the last valid preview and test result visible.
- A corrected valid revision reaches Sandpack and can produce the expected full-pass result.
- Restarting the runtime preserves the current editor draft.
- Falling back from the modern surface preserves the active draft and does not remount Sandpack.

### Offline and failure behavior

- The editor initializes and provides tag closing and suggestions while requests to known public
  package CDNs are blocked.
- Browser network logs contain no required editor or type-library request to a public CDN.
- A forced worker or initialization failure produces the legacy editor, not a page-level crash.
- Model and workspace cleanup produces no stale-file suggestions when moving between assessments.
- The supported assessment flow produces no unexpected browser console errors.

### Repository verification

- Focused unit tests cover surface selection, adapter behavior, editor-independent JSX parsing,
  revision-safe validation, and fallback with an existing draft.
- Browser tests type representative JSX instead of setting the whole model programmatically.
- The existing assessment browser flow still reaches its expected passing check count.
- Type checking, unit tests, assessment-content validation, smoke checks, and the production build
  all pass.

## Verification Record

Verified on 2026-07-16 with:

- `npm test` — 49 unit tests passed.
- `npm run typecheck` — no TypeScript errors.
- `npm run ci:content` — all 46 assessment solutions passed their hidden tests.
- `npm run verify:smoke` — assessment assembly and grading smoke check passed.
- `BASE_URL=http://localhost:3013 npm run e2e` — modern surface, JSX tag closing,
  native tag/attribute/component-prop suggestions, syntax gating, grading, persistence, local-only
  editor assets, and legacy fallback all passed.
- `npm run build` — 143 static pages generated and exported.
- `git diff --check` — no whitespace errors.

The static export measures 62,368 KiB versus the 30,188 KiB baseline, an increase of 32,180 KiB.
This is the explicit cost of serving the editor core, TypeScript runtime, language worker, and React
type libraries locally instead of depending on public editor CDNs.

## Risks and Trade-offs

- `modern-monaco` is pre-1.0 and may change APIs. The exact pin and internal adapter contain that
  volatility.
- VS Code-compatible services and extensions can increase bundle size and initialization cost.
  Lazy client initialization and measurement during the adoption gate keep this visible.
- Monaco and VS Code services commonly assume singleton initialization. A guarded global promise
  prevents duplicate registration during React remounts and development strict mode.
- Two temporary surfaces add maintenance cost. Keeping one small contract and a time-bounded
  adoption decision prevents them from becoming two permanent editor architectures.
- The fallback may not auto-close JSX tags. Its purpose is recovery; the modern surface cannot be
  declared adopted while normal supported environments require fallback.

## Rollback

Rollback changes the surface selector to `LegacyMonacoSurface` and removes the modern adapter,
worker configuration, local assets, and dependency. Because draft ownership, syntax gating,
Sandpack execution, grading, and reporting remain outside the adapter, rollback does not require
changes to assessment content or runtime state.

## References

- [`modern-monaco`](https://github.com/esm-dev/modern-monaco)
- [`monaco-vscode-api`](https://github.com/CodinGame/monaco-vscode-api)
- [`monaco-languageclient`](https://github.com/TypeFox/monaco-languageclient)
