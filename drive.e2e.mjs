import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3013';
const SOLUTION = `export default function UserCard() {
  return (
    <div className="user-card">
      <img src="https://i.imgur.com/MK3eW3As.jpg" alt="Ada Lovelace" />
      <h1>Ada Lovelace</h1>
    </div>
  );
}`;
const INCOMPLETE_SOLUTION = `export default function UserCard() {
  return (
    <div`;
const FORBIDDEN_EDITOR_CDNS = ['esm.sh', 'unpkg.com', 'cdn.jsdelivr.net'];
const EDITOR_ASSET_PATH_PARTS = [
  'modern-monaco',
  'tm-grammars',
  'tm-themes',
  'typescript',
  '@types/',
];

const log = (...a) => console.log(...a);
const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };

const browser = await chromium.launch({ chromiumSandbox: false });
const context = await browser.newContext({
  viewport: { width: 1536, height: 960 },
  serviceWorkers: 'block',
  permissions: ['clipboard-read', 'clipboard-write'],
});
const forbiddenEditorRequests = [];

/**
 * In this sandboxed CI the browser's own egress to the codesandbox CDN can be
 * flaky, so we proxy those requests through Node's network (which reaches it).
 * This only affects the headless harness — a real user's browser talks to the
 * CDN directly, exactly like the /sandpack-check diagnostic proved works.
 */
const STRIP_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding'];
await context.route('**/*', async (route) => {
  const request = route.request();
  const url = request.url();
  const parsedUrl = new URL(url);
  const isEditorCdnRequest =
    FORBIDDEN_EDITOR_CDNS.includes(parsedUrl.hostname) &&
    EDITOR_ASSET_PATH_PARTS.some((part) => parsedUrl.pathname.includes(part));
  if (isEditorCdnRequest) {
    forbiddenEditorRequests.push(url);
    await route.abort();
    return;
  }
  if (url.startsWith(BASE) || url.startsWith('data:') || url.startsWith('blob:')) {
    await route.continue();
    return;
  }
  try {
    const method = request.method();
    const hasBody = method !== 'GET' && method !== 'HEAD';
    const upstream = await fetch(url, {
      method,
      headers: request.headers(),
      body: hasBody ? request.postDataBuffer() ?? undefined : undefined,
      redirect: 'follow',
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    const headers = {};
    upstream.headers.forEach((value, key) => {
      if (!STRIP_HEADERS.includes(key)) headers[key] = value;
    });
    await route.fulfill({ status: upstream.status, headers, body });
  } catch {
    await route.abort();
  }
});

const page = await context.newPage();
const browserErrors = [];
page.on('console', (message) => {
  if (message.type() !== 'error') return;
  const firstLine = message.text().split('\n')[0];
  if (!firstLine.startsWith('Failed to load resource:')) browserErrors.push(firstLine);
  log('[browser error]', firstLine);
});
page.on('pageerror', (error) => browserErrors.push(error.message));

async function replaceEditorContents(source) {
  const editor = page.locator('.assessment-editor__modern-surface .monaco-editor');
  await editor.click({ position: { x: 240, y: 120 } });
  await page.keyboard.press('ControlOrMeta+A');
  await page.evaluate((text) => navigator.clipboard.writeText(text), source);
  await page.keyboard.press('ControlOrMeta+V');
}

async function readModernEditorText() {
  return (await page.locator('.assessment-editor__modern-surface .view-lines').innerText())
    .replaceAll('\u00a0', ' ');
}

async function assertTypedClosingTag(prefix, typedCharacter, expectedText, label) {
  await replaceEditorContents(prefix);
  await page.waitForTimeout(250);
  await page.keyboard.type(typedCharacter);
  await page.waitForTimeout(750);
  const editorText = await readModernEditorText();
  editorText.includes(expectedText)
    ? log(`   -> ${label}`)
    : fail(`${label} failed (${JSON.stringify(editorText)})`);
}

async function assertTypedSuggestion(prefix, typedText, expectedText, label) {
  await replaceEditorContents(prefix);
  await page.waitForTimeout(500);
  await page.keyboard.type(typedText, { delay: 100 });
  const suggestionWidget = page.locator('.suggest-widget');
  await suggestionWidget.waitFor({ state: 'visible', timeout: 10_000 });
  const suggestionText = await suggestionWidget.innerText();
  suggestionText.includes(expectedText)
    ? log(`   -> ${label}`)
    : fail(`${label} missing from suggestions (${suggestionText})`);
  await page.keyboard.press('Escape');
}

async function verifyLegacyFallback() {
  const fallbackContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    serviceWorkers: 'block',
  });
  const fallbackPage = await fallbackContext.newPage();
  const fallbackErrors = [];
  fallbackPage.on('pageerror', (error) => fallbackErrors.push(error.message));
  await fallbackPage.route('**/vendor/types/react/index.d.ts', (route) =>
    route.fulfill({ status: 500, body: 'forced editor type failure' }),
  );

  try {
    await fallbackPage.goto(`${BASE}/learn/react/describing-ui/jsx/assessment`, {
      waitUntil: 'domcontentloaded',
    });
    await fallbackPage.locator('.assessment-editor__legacy-surface .monaco-editor').waitFor({
      state: 'visible',
      timeout: 90_000,
    });
    fallbackErrors.length === 0
      ? log('   -> Forced modern-editor failure is contained by the legacy editor')
      : fail(`fallback page raised ${fallbackErrors.length} page error(s)`);
  } finally {
    await fallbackContext.close();
  }
}

try {
  log('1) Open the JSX assessment workspace');
  await page.goto(`${BASE}/learn/react/describing-ui/jsx/assessment`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForURL('**/learn/react/describing-ui/jsx/assessment/**', { timeout: 30_000 });
  log(`   -> ${page.url()}`);

  log('2) Wait for the modern Monaco surface and the readable starter test report');
  await page.locator('.assessment-editor__modern-surface .monaco-editor').waitFor({ state: 'visible', timeout: 90_000 });
  const legacyEditorCount = await page.locator('.assessment-editor__legacy-surface').count();
  legacyEditorCount === 0
    ? log('   -> Modern editor loaded; legacy fallback is not mounted')
    : fail('legacy editor mounted during the modern-editor acceptance path');
  await page.locator('.assessment-report[data-status="failed"]').waitFor({ state: 'visible', timeout: 90_000 });
  const starterSummary = await page.locator('.assessment-report__count').innerText();
  const starterChecks = await page.locator('.assessment-report__check').count();
  starterChecks > 0
    ? log(`   -> ${starterSummary}; ${starterChecks} individual checks shown`)
    : fail('individual test checks not visible');
  await page.screenshot({ path: '/tmp/upstack-workspace-failing.png', fullPage: true });
  log('   -> Failing-state screenshot: /tmp/upstack-workspace-failing.png');

  log('3) Verify JSX tag closing from real keystrokes');
  await assertTypedClosingTag(
    'export default function App() {\n  return <section',
    '>',
    '<section></section>',
    'Native tags close',
  );
  await assertTypedClosingTag(
    'function UserCard() { return null; }\nexport default function App() {\n  return <UserCard',
    '>',
    '<UserCard></UserCard>',
    'React component tags close',
  );
  await assertTypedClosingTag(
    'export default function App() {\n  return <',
    '>',
    '<></>',
    'Fragments close',
  );
  await assertTypedClosingTag(
    'export default function App() {\n  return <img /',
    '>',
    '<img />',
    'Self-closing tags are not expanded',
  );
  await assertTypedClosingTag(
    'export default function App() {\n  return <section></section',
    '>',
    '<section></section>',
    'Existing closing tags are not duplicated',
  );

  log('4) Verify JSX-aware IntelliSense dropdowns from real typing');
  await assertTypedSuggestion(
    'export default function App() {\n  return <',
    'div',
    'React.JSX.IntrinsicElements.div',
    'Native div tag includes its React intrinsic type',
  );
  await assertTypedSuggestion(
    'export default function App() {\n  return <button ',
    'onCl',
    'React.MouseEventHandler<HTMLButtonElement>',
    'onClick includes its button event-handler type',
  );
  await assertTypedSuggestion(
    'function UserCard(props: { name: string; active?: boolean }) { return null; }\n' +
      'export default function App() {\n  return <UserCard ',
    'nam',
    '(property) name: string',
    'Local component props are inferred',
  );
  await assertTypedSuggestion(
    'const existingTitle = "Ready";\nexport default function App() {\n  return exis',
    't',
    'const existingTitle: "Ready"',
    'Existing local symbols include their inferred type',
  );

  log('5) Type incomplete JSX — keep the last valid preview instead of crashing');
  await replaceEditorContents(INCOMPLETE_SOLUTION);
  await page.locator('.assessment-editor__status[data-status="blocked"]').waitFor({
    state: 'visible',
    timeout: 30_000,
  });
  const sandboxErrorCount = await page.locator('.sandbox-error').count();
  sandboxErrorCount === 0
    ? log('   -> Syntax is blocked locally; preview remains available')
    : fail('sandbox error appeared while typing incomplete JSX');

  log('6) Type a correct solution — only the validated revision reaches Sandpack');
  await replaceEditorContents(SOLUTION);

  log('7) Wait for a passing result');
  await page.locator('.assessment-report[data-status="passed"]').waitFor({ state: 'visible', timeout: 90_000 });
  const passingSummary = await page.locator('.assessment-report__count').innerText();
  passingSummary === '4 of 4 checks passed'
    ? log(`   -> Assessment PASSED: ${passingSummary}`)
    : fail(`unexpected passing summary (${passingSummary})`);
  await page.screenshot({ path: '/tmp/upstack-workspace-passing.png', fullPage: true });
  log('   -> Passing-state screenshot: /tmp/upstack-workspace-passing.png');

  log('8) Restart the preview and confirm the editor draft survives');
  await page.getByRole('button', { name: 'Restart preview' }).click();
  await page.locator('.assessment-editor__modern-surface .monaco-editor').waitFor({ state: 'visible' });
  await page.locator('.assessment .view-lines', { hasText: 'Ada Lovelace' }).waitFor({
    state: 'visible',
    timeout: 10_000,
  });
  log('   -> Draft preserved across runtime restart');

  log('9) Return to the chapter');
  await page.locator('a.workspace__back').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/assessment'), { timeout: 30_000 });
  await page.locator('.sidebar').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);

  log('10) Chapter reflects the pass (shared progress store)');
  await page.locator('.launch-card[data-passed="true"]').waitFor({ state: 'visible' });
  await page.getByText('Chapter complete ✓', { exact: true }).waitFor({ state: 'visible' });
  log('   -> Assessment card passed and chapter completed');

  log('11) Reload and confirm progress persisted');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const stillDone = await page.locator('.launch-card[data-passed="true"]').count();
  stillDone
    ? log('   -> After refresh, JSX still completed ✓ (localStorage persisted)')
    : fail('progress lost after refresh');

  log('12) Force modern initialization failure and verify containment');
  await verifyLegacyFallback();

  forbiddenEditorRequests.length === 0
    ? log('   -> No editor modules, workers, themes, or types requested from public CDNs')
    : fail(`editor attempted public CDN requests: ${forbiddenEditorRequests.join(', ')}`);

  browserErrors.length === 0
    ? log('   -> No browser console errors')
    : fail(`${browserErrors.length} browser console error(s) occurred`);

  log(process.exitCode ? '\nRESULT: FAILURES ABOVE' : '\nRESULT: ALL EXIT CRITERIA MET');
} catch (err) {
  fail(err.message);
  await page.screenshot({ path: '/tmp/upstack-workspace-error.png', fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}
