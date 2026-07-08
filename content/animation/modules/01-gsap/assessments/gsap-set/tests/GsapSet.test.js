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

describe('Positioning a box with gsap.set', () => {
  test('moves the box to the right', () => {
    const container = setup();
    const box = container.querySelector('.box');
    expect(box.style.transform).toContain('translate');
    expect(box.style.transform).toContain('120');
  });

  test('makes the box half transparent', () => {
    const container = setup();
    const box = container.querySelector('.box');
    expect(box.style.opacity).toBe('0.5');
  });
});
