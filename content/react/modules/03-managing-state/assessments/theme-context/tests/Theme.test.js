import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';

function mountApp() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<App />));
  return container;
}

describe('Theme context', () => {
  test('makes the theme available deep in the tree', () => {
    const container = mountApp();
    expect(container.querySelector('p')).not.toBeNull();
  });

  test('reads the theme without prop drilling', () => {
    const container = mountApp();
    expect(container.textContent).toContain('Theme: dark');
  });
});
