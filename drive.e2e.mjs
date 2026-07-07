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

const log = (...a) => console.log(...a);
const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };

const browser = await chromium.launch({ chromiumSandbox: false });
const context = await browser.newContext({
  viewport: { width: 1536, height: 960 },
  serviceWorkers: 'block',
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
page.on('console', (m) => { if (m.type() === 'error') log('[browser error]', m.text().split('\n')[0]); });

try {
  log('1) Enter at "/" — redirects straight into the course');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/learn/describing-ui/jsx', { timeout: 30_000 });
  log(`   -> ${page.url()}`);

  log('2) Open the assessment workspace (Sandpack)');
  await page.locator('a.launch-card').click();
  await page.waitForURL('**/assessment', { timeout: 30_000 });

  log('3) Wait for the Sandpack editor + tests to run against the starter (return null)');
  await page.locator('.assessment .cm-content').first().waitFor({ state: 'visible', timeout: 90_000 });
  await page.locator('.result-panel[data-status="failed"]').waitFor({ state: 'visible', timeout: 90_000 });
  const failList = await page.locator('.sp-tests', { hasText: 'FAIL' }).count();
  failList ? log('   -> Tests panel populated with a failing list') : fail('failing test list not visible');
  await page.screenshot({ path: '/tmp/upstack-workspace-failing.png', fullPage: true });
  log('   -> Failing-state screenshot: /tmp/upstack-workspace-failing.png');

  log('4) Type a correct solution — SandpackTests re-runs automatically in watch mode');
  const editor = page.locator('.assessment .cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(SOLUTION);

  log('5) Wait for a passing result');
  await page.locator('.result-panel[data-status="passed"]').waitFor({ state: 'visible', timeout: 90_000 });
  log('   -> Assessment PASSED in the workspace');
  await page.screenshot({ path: '/tmp/upstack-workspace-passing.png', fullPage: true });
  log('   -> Passing-state screenshot: /tmp/upstack-workspace-passing.png');

  log('6) Return to the chapter');
  await page.locator('a.workspace__back').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/assessment'), { timeout: 30_000 });
  await page.locator('.sidebar').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);

  log('7) Sidebar reflects the pass (shared progress store)');
  const done = await page.locator('.sidebar__chapter[data-state="completed"]', { hasText: 'Writing Markup with JSX' }).count();
  done ? log('   -> JSX chapter Completed ✓') : fail('JSX not marked completed');
  const nextState = await page.locator('.sidebar__chapter', { hasText: 'Passing Props' }).first().getAttribute('data-state');
  ['unlocked', 'in-progress'].includes(nextState) ? log(`   -> Next chapter UNLOCKED (${nextState})`) : fail(`next chapter not unlocked (${nextState})`);

  log('8) Reload and confirm progress persisted');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const stillDone = await page.locator('.sidebar__chapter[data-state="completed"]', { hasText: 'Writing Markup with JSX' }).count();
  stillDone ? log('   -> After refresh, JSX still Completed ✓ (localStorage persisted)') : fail('progress lost after refresh');

  log(process.exitCode ? '\nRESULT: FAILURES ABOVE' : '\nRESULT: ALL EXIT CRITERIA MET');
} catch (err) {
  fail(err.message);
  await page.screenshot({ path: '/tmp/upstack-workspace-error.png', fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}
