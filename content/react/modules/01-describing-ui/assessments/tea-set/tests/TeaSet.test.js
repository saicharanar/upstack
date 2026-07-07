import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import TeaParty from './App';

function mountParty() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<TeaParty />));
  return container;
}

describe('Tea party', () => {
  test('sets out one cupcake per guest', () => {
    const container = mountParty();
    expect(container.querySelectorAll('li').length).toBe(3);
  });

  test('numbers each cupcake from its guest prop', () => {
    const container = mountParty();
    const text = container.textContent ?? '';
    expect(text).toContain('guest #1');
    expect(text).toContain('guest #2');
    expect(text).toContain('guest #3');
  });
});
