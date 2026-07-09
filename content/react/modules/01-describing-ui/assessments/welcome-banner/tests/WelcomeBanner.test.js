import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import NameBadge from './App';

function mountBadge() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<NameBadge />));
  return container;
}

describe('Name badge', () => {
  test('greets with a hello heading', () => {
    const container = mountBadge();
    const heading = container.querySelector('h1');
    expect(heading).not.toBeNull();
    expect((heading.textContent ?? '').toLowerCase()).toContain('hello');
  });

  test('introduces a name below the greeting', () => {
    const container = mountBadge();
    const heading = container.querySelector('h1');
    const line = container.querySelector('p');
    expect(line).not.toBeNull();
    const name = (line.textContent ?? '').trim();
    // A real name line — present, and not just repeating the greeting.
    expect(name.length).toBeGreaterThan(0);
    expect(name).not.toBe((heading?.textContent ?? '').trim());
  });
});
