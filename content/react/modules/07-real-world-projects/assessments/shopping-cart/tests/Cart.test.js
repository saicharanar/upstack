import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Cart />));
  return container;
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

const addButton = (c, name) => [...c.querySelectorAll('button')].find((b) => b.textContent === `Add ${name}`);
const removeButton = (c, name) => [...c.querySelectorAll('button')].find((b) => b.textContent === `Remove ${name}`);
const cart = (c) => c.querySelector('ul');

describe('Shopping cart', () => {
  test('adds a product to the cart', () => {
    const c = setup();
    click(addButton(c, 'Keyboard'));
    expect(cart(c).querySelectorAll('li').length).toBe(1);
    expect(cart(c).textContent).toContain('Keyboard × 1');
  });

  test('increases the quantity when the same product is added again', () => {
    const c = setup();
    click(addButton(c, 'Keyboard'));
    click(addButton(c, 'Keyboard'));
    expect(cart(c).querySelectorAll('li').length).toBe(1);
    expect(cart(c).textContent).toContain('Keyboard × 2');
  });

  test('removes a product from the cart', () => {
    const c = setup();
    click(addButton(c, 'Keyboard'));
    click(addButton(c, 'Mouse'));
    click(removeButton(c, 'Keyboard'));
    expect(cart(c).querySelectorAll('li').length).toBe(1);
    expect(cart(c).textContent).not.toContain('Keyboard');
    expect(cart(c).textContent).toContain('Mouse');
  });

  test('shows the running total', () => {
    const c = setup();
    click(addButton(c, 'Keyboard')); // 50
    click(addButton(c, 'Mouse')); // 25
    expect(c.textContent).toContain('Total: $75');
    click(addButton(c, 'Keyboard')); // +50
    expect(c.textContent).toContain('Total: $125');
  });
});
