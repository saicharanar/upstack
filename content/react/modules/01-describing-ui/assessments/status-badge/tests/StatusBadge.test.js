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

describe('Status badge', () => {
  test('shows Online for an available teammate', () => {
    const container = mountApp();
    expect(container.textContent).toContain('Online');
  });

  test('shows Offline for an away teammate', () => {
    const container = mountApp();
    expect(container.textContent).toContain('Offline');
  });
});
