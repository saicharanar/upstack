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
  test('reads the theme from context instead of the placeholder', () => {
    // The deep label should show a real theme value it pulled from context,
    // not the "?" placeholder it started with.
    const container = mountApp();
    const label = container.querySelector('p');
    expect(label).not.toBeNull();
    expect(label.textContent).not.toContain('?');
    expect(label.textContent).toMatch(/Theme: (light|dark)/);
  });

  test('shows the provided dark theme deep in the tree', () => {
    // Reaching "dark" only happens when a provider supplies it — the context's
    // own default is "light", so this fails if nothing provides a value.
    const container = mountApp();
    expect(container.textContent).toContain('Theme: dark');
  });
});
