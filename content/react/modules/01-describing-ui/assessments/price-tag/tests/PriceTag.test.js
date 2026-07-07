import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import PriceTag from './App';

function mountTag() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<PriceTag />));
  return container;
}

describe('Price tag', () => {
  test('shows the product name in a heading', () => {
    const container = mountTag();
    const heading = container.querySelector('h2');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toContain('Mechanical Keyboard');
  });

  test('formats the price with a dollar sign and two decimals', () => {
    const container = mountTag();
    const price = container.querySelector('.price');
    expect(price).not.toBeNull();
    expect(price.textContent).toBe('$49.50');
  });
});
