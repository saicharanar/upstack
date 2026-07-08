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

describe('Error boundary', () => {
  test('shows the fallback when a child throws', () => {
    const container = setup();
    expect(container.textContent).toContain('Something went wrong.');
  });

  test('keeps the rest of the page alive', () => {
    // The boundary should contain the crash — the heading outside it still renders.
    const container = setup();
    expect(container.textContent).toContain('Dashboard');
  });
});
