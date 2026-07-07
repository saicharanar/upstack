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
  test('shows a big hello heading', () => {
    const container = mountBadge();
    const heading = container.querySelector('h1');
    expect(heading).not.toBeNull();
    expect((heading.textContent ?? '').trim().length).toBeGreaterThan(0);
  });

  test('shows a name below the heading', () => {
    const container = mountBadge();
    const line = container.querySelector('p');
    expect(line).not.toBeNull();
    expect((line.textContent ?? '').trim().length).toBeGreaterThan(0);
  });
});
