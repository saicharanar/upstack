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

const log = (...a) => console.log(...a);
const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };

const browser = await chromium.launch({ chromiumSandbox: false });
const context = await browser.newContext({
  viewport: { width: 1536, height: 960 },
  serviceWorkers: 'block',
  permissions: ['clipboard-read', 'clipboard-write'],
});

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
  const editor = page.locator('.assessment .monaco-editor').first();
  await editor.click({ position: { x: 240, y: 120 } });
  await page.keyboard.press('ControlOrMeta+A');
  await page.evaluate((text) => navigator.clipboard.writeText(text), source);
  await page.keyboard.press('ControlOrMeta+V');
}

try {
  log('1) Open the JSX assessment workspace');
  await page.goto(`${BASE}/learn/react/describing-ui/jsx/assessment`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForURL('**/learn/react/describing-ui/jsx/assessment/**', { timeout: 30_000 });
  log(`   -> ${page.url()}`);

  log('2) Wait for Monaco and the readable starter test report');
  await page.locator('.assessment .monaco-editor').first().waitFor({ state: 'visible', timeout: 90_000 });
  await page.locator('.assessment-report[data-status="failed"]').waitFor({ state: 'visible', timeout: 90_000 });
  const starterSummary = await page.locator('.assessment-report__count').innerText();
  const starterChecks = await page.locator('.assessment-report__check').count();
  starterChecks > 0
    ? log(`   -> ${starterSummary}; ${starterChecks} individual checks shown`)
    : fail('individual test checks not visible');
  await page.screenshot({ path: '/tmp/upstack-workspace-failing.png', fullPage: true });
  log('   -> Failing-state screenshot: /tmp/upstack-workspace-failing.png');

  log('3) Type incomplete JSX — keep the last valid preview instead of crashing');
  await replaceEditorContents(INCOMPLETE_SOLUTION);
  await page.locator('.assessment-editor__status[data-status="blocked"]').waitFor({
    state: 'visible',
    timeout: 30_000,
  });
  const sandboxErrorCount = await page.locator('.sandbox-error').count();
  sandboxErrorCount === 0
    ? log('   -> Syntax is blocked locally; preview remains available')
    : fail('sandbox error appeared while typing incomplete JSX');

  log('4) Type a correct solution — only the validated revision reaches Sandpack');
  await replaceEditorContents(SOLUTION);

  log('5) Wait for a passing result');
  await page.locator('.assessment-report[data-status="passed"]').waitFor({ state: 'visible', timeout: 90_000 });
  const passingSummary = await page.locator('.assessment-report__count').innerText();
  passingSummary === '4 of 4 checks passed'
    ? log(`   -> Assessment PASSED: ${passingSummary}`)
    : fail(`unexpected passing summary (${passingSummary})`);
  await page.screenshot({ path: '/tmp/upstack-workspace-passing.png', fullPage: true });
  log('   -> Passing-state screenshot: /tmp/upstack-workspace-passing.png');

  log('6) Restart the preview and confirm the editor draft survives');
  await page.getByRole('button', { name: 'Restart preview' }).click();
  await page.locator('.assessment .monaco-editor').first().waitFor({ state: 'visible' });
  await page.locator('.assessment .view-lines', { hasText: 'Ada Lovelace' }).waitFor({
    state: 'visible',
    timeout: 10_000,
  });
  log('   -> Draft preserved across runtime restart');

  log('7) Return to the chapter');
  await page.locator('a.workspace__back').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/assessment'), { timeout: 30_000 });
  await page.locator('.sidebar').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);

  log('8) Chapter reflects the pass (shared progress store)');
  await page.locator('.launch-card[data-passed="true"]').waitFor({ state: 'visible' });
  await page.getByText('Chapter complete ✓', { exact: true }).waitFor({ state: 'visible' });
  log('   -> Assessment card passed and chapter completed');

  log('9) Reload and confirm progress persisted');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const stillDone = await page.locator('.launch-card[data-passed="true"]').count();
  stillDone
    ? log('   -> After refresh, JSX still completed ✓ (localStorage persisted)')
    : fail('progress lost after refresh');

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
