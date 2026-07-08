import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import Nav from './App';

function render(pathname) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<Nav pathname={pathname} />));
  return container;
}

describe('Active navigation', () => {
  test('renders a link for each item', () => {
    const container = render('/blog');
    expect(container.querySelectorAll('a').length).toBe(3);
  });

  test('marks the current route as active', () => {
    const container = render('/blog');
    const links = [...container.querySelectorAll('a')];
    const active = links.filter((a) => a.getAttribute('aria-current') === 'page');
    expect(active.length).toBe(1);
    expect(active[0].textContent).toBe('Blog');
  });
});
