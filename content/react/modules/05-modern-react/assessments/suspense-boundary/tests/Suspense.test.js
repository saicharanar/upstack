import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<App />));
  return container;
}

describe('Suspense boundary', () => {
  test('shows the loading fallback while content is not ready', () => {
    const container = setup();
    expect(container.textContent).toContain('Loading…');
  });

  test('keeps the surrounding heading visible while loading', () => {
    // With a boundary, the suspension is contained and the rest still renders.
    const container = setup();
    expect(container.textContent).toContain('Profile');
  });
});
