# Monaco Assessment Editor Design

**Date:** 2026-07-16  
**Status:** Approved for implementation planning

## Context

Upstack assessments currently use `SandpackCodeEditor`, `SandpackPreview`, and
`SandpackTests` inside one Sandpack provider. Every editor keystroke is sent directly to
Sandpack. Normal in-progress code is often temporarily invalid, so the remote Sandpack Babel
worker repeatedly compiles incomplete JavaScript and JSX.

The failure was reproduced by typing incomplete JSX. Sandpack emitted errors such as:

```text
Cannot assign to read only property 'message' of object 'SyntaxError ...'
```

This is an error in Sandpack's syntax-error handling path, not an error in Upstack's grading
rules. Depending on timing and browser state, it can escape into `SandpackBoundary`, replacing
the assessment with the generic "sandbox hit a snag" fallback.

The current editor also lacks IDE-style IntelliSense. It closes brackets and highlights syntax,
but it does not provide the familiar VS Code dropdown for existing variables, imports, object
properties, component props, and browser APIs.

## Goals

- Provide VS Code-style IntelliSense using Monaco Editor.
- Preserve automatic preview and test updates without compiling every keystroke.
- Never send syntactically invalid JavaScript or JSX to Sandpack.
- Preserve the learner's draft if the preview or test runtime crashes.
- Recover the Sandpack runtime without reloading the whole assessment page.
- Keep the existing assessment metadata, hidden tests, grading, and progress behavior.
- Keep the first implementation focused on the existing JavaScript/JSX Sandpack assessments.

## Non-goals

- AI-generated code completion or chat-assisted coding.
- Replacing Sandpack with WebContainers in this iteration.
- Providing a full project terminal, package manager, debugger, or Git integration.
- Adding TypeScript authoring to assessments that currently use JavaScript.
- Changing assessment content, grading concepts, or pass rules.

## Approaches Considered

### Enhance the existing CodeMirror editor

This is the smallest change and Sandpack accepts CodeMirror extensions. It could add keyword or
snippet completion, but reproducing Monaco's JavaScript language service, object-property
suggestions, hover information, and diagnostics would require substantial custom integration.
It would retain a weaker editing experience.

### Monaco editor with a syntax-gated Sandpack runtime

This is the selected approach. Monaco owns the editable draft and language tooling. Sandpack
continues to own execution, preview, console, and tests. A controller sends a debounced snapshot
to Sandpack only after Monaco's JavaScript worker reports no syntax errors.

This directly prevents the reproduced crash path while preserving the existing assessment and
grading architecture.

### Monaco editor with a WebContainer runtime

This would provide a more complete in-browser development environment and remove the current
Sandpack bundler dependency. It also adds a much larger runtime, browser isolation requirements,
dependency installation concerns, and a wider migration of preview and test behavior. It is a
possible future runner behind the existing `bundle.runner` seam, but it is not required for the
current React exercises.

## Architecture

The assessment workspace will be divided into two independently recoverable areas:

1. **Editor domain:** Monaco, editor models, draft state, diagnostics, and execution gating.
2. **Runtime domain:** Sandpack provider, preview, console, tests, and grading callbacks.

The editor domain must remain mounted when the runtime is restarted. The runtime receives only
validated file snapshots and has no ownership of the learner's current draft.

### `AssessmentEditor`

`AssessmentEditor` replaces `SandpackCodeEditor` in the assessment workspace. It owns a Monaco
model for every visible file, applies read-only state where required, and exposes the active file
through the existing tabbed layout.

Responsibilities:

- Initialize Monaco only on the client.
- Create stable model URIs from assessment file paths.
- Load the starter files into Monaco models.
- Apply read-only state from `bundle.meta.readOnlyFiles`.
- Configure JavaScript, JSX, React, and DOM language services.
- Expose editor formatting through Monaco's document formatting action.
- Report draft changes without writing them directly to Sandpack.
- Preserve the current model, cursor, selection, and scroll state across runtime restarts.

### `useAssessmentExecutionGate`

This hook coordinates draft validation and execution.

Inputs:

- Current Monaco file snapshot.
- Active model and language worker.
- Debounce duration.
- Runtime update callback.

Outputs:

- `editing`: the learner has changed the draft and the debounce timer is active.
- `checking`: Monaco is collecting syntactic diagnostics.
- `blocked`: the latest draft has one or more syntax errors.
- `running`: a validated snapshot has been sent to Sandpack.
- `ready`: Sandpack has processed the latest validated snapshot.
- The last validated revision identifier.

The initial debounce duration will be 600 milliseconds. Each edit cancels the previous pending
check. After the pause, the hook requests syntactic diagnostics for every editable JavaScript or
JSX model. Semantic warnings, lint preferences, and unresolved optional types do not block
execution; only syntax errors block it.

Diagnostics are revision-aware. If the learner types again while a diagnostic request is in
flight, its result is discarded instead of executing a stale snapshot.

### `AssessmentRuntime`

`AssessmentRuntime` contains the Sandpack provider, preview, console, tests, and result panel. It
accepts the last validated files rather than the live Monaco draft.

The provider remains mounted between valid revisions and updates its files through Sandpack's
file API. It is remounted only when the learner explicitly restarts the runtime or the scoped
runtime boundary catches a Sandpack tree failure.

The runtime exposes lifecycle events to the execution gate so the editor toolbar can distinguish
"checking" from "running" and "ready".

### `AssessmentRuntimeBoundary`

The existing boundary currently replaces the whole Sandpack subtree, which includes the editor.
The new boundary will wrap only `AssessmentRuntime`.

When it catches a failure, it displays a compact runtime error in the preview/test region with:

- A clear explanation that the learner's code is safe.
- A `Restart preview` action.
- The latest available error message in development mode.

Restarting increments a runtime key and rebuilds Sandpack from the last validated snapshot. The
Monaco editor and its current draft are not remounted.

## Data Flow

1. The assessment bundle initializes Monaco models and the first validated runtime snapshot.
2. The learner edits a Monaco model.
3. The editor immediately updates the local draft and Monaco diagnostics.
4. The execution gate waits for 600 milliseconds of inactivity.
5. The gate requests syntactic diagnostics for the current revision.
6. If syntax errors exist, execution stops and Sandpack continues showing the last working
   preview.
7. If syntax is valid, the gate copies the complete file snapshot into Sandpack.
8. Sandpack updates the preview and runs hidden tests.
9. `useAssessmentResult` grades the completed test payload and records progress as it does today.

Hidden test files and Sandpack support files never become editable Monaco models. They are added
to the validated snapshot by the existing bundle-to-Sandpack mapping.

## IntelliSense Configuration

Monaco will use its JavaScript language defaults with JSX enabled. The editor will provide:

- Keyword and symbol suggestions.
- Local variable and function suggestions.
- Object-property and DOM API suggestions.
- Import and module-path suggestions when type information is available.
- React component prop suggestions.
- Hover information and function parameter hints.
- Inline syntax markers and matching-bracket behavior.

React and React DOM type definitions will be shipped with the application and registered as
Monaco extra libraries. They must not be fetched from a third-party CDN at editor runtime. This
keeps IntelliSense deterministic and allows the assessment shell to work when the CodeSandbox
runtime is temporarily unavailable.

Compiler options will match the exercises: JavaScript allowed, JSX enabled, modern ECMAScript,
DOM libraries available, and module resolution suitable for the dependency names exposed by an
assessment bundle.

## User Experience

The editor toolbar will show one quiet status at a time:

- `Editing…` while the debounce is active.
- `Checking syntax…` while Monaco diagnostics are pending.
- `Fix syntax errors to update preview` when execution is blocked.
- `Running…` after a valid snapshot is sent to Sandpack.
- `Preview updated` after the runtime processes the revision.

When syntax is invalid, Monaco highlights the relevant code and the preview remains on the last
valid result. The tests panel must not change to a new failure merely because the current draft
is incomplete.

The existing Preview/Console switch, resizable panels, result panel, and next-chapter flow remain
unchanged. The format action moves into the Monaco toolbar and uses Monaco's formatter.

## Error Handling

- Syntax errors are normal editor state, not runtime errors.
- Stale asynchronous diagnostic results are ignored by revision identifier.
- Sandpack test payloads remain defensively parsed by `useAssessmentResult`.
- A Sandpack render failure affects only the runtime domain.
- A runtime restart uses the last validated snapshot and preserves the newer unsent draft.
- Network and bundler failures present `Restart preview` instead of asking for a full-page reload.
- If a restart fails repeatedly, the learner can continue editing and retry later without losing
  work.

## Testing Strategy

### Unit tests

- Debounce collapses a burst of edits into one diagnostic request.
- A syntactically invalid revision is never sent to the runtime.
- A valid revision is sent exactly once.
- A stale diagnostic result cannot execute an older revision.
- Semantic warnings do not block execution.
- Runtime restart uses the last validated files.
- Current drafts survive runtime key changes.

### Component tests

- Monaco models initialize from the assessment bundle.
- Read-only files cannot be edited.
- Syntax-blocked state shows the correct toolbar message.
- Runtime failure UI does not replace or reset the editor.
- Restart preview remounts only the runtime.
- Test results continue to flow into the existing result panel.

### End-to-end tests

- Opening an assessment loads Monaco, preview, and the initial failing tests.
- Typing incomplete JSX does not invoke Sandpack and does not show the snag fallback.
- Monaco displays IntelliSense suggestions for local symbols and React/DOM APIs.
- Completing valid JSX updates the preview and runs tests automatically.
- A correct solution passes the assessment and persists chapter progress.
- A forced runtime failure preserves the draft and recovers through `Restart preview`.

The existing end-to-end route expectation must be updated to include the stack segment before it
can validate the new workspace.

## Migration and Scope

The first migration targets the graded `AssessmentRunner`. Inline `LiveExampleRunner` instances
will keep `SandpackCodeEditor` initially. This limits risk and verifies the new editor/runtime
contract where stability and IntelliSense matter most. The shared editor can be extended to live
examples in a later change after the assessment flow is proven.

No assessment content format changes are required. The existing `AssessmentBundle`, runner seam,
Sandpack file mapping, grading logic, and progress store remain compatible.

## Acceptance Criteria

- Graded assessments use Monaco instead of `SandpackCodeEditor`.
- IntelliSense provides IDE-style symbol and property suggestions without AI generation.
- Incomplete JavaScript or JSX never reaches Sandpack.
- Valid code runs automatically after a 600 millisecond pause.
- The last valid preview remains visible while the draft has syntax errors.
- Sandpack failure and restart do not lose or reset the Monaco draft.
- Existing assessment tests, grading, completion, and persistence continue to pass.
- Unit, component, and end-to-end coverage exercises the new gating and recovery paths.
