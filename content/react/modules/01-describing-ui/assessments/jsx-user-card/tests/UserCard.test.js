import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import UserCard from './App';

function mountCard() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => root.render(<UserCard />));
  return container;
}

describe('User profile card', () => {
  test('wraps the whole card in a single parent element', () => {
    const container = mountCard();
    expect(container.children.length).toBe(1);
  });

  test('gives the card the user-card class name', () => {
    const container = mountCard();
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root.classList.contains('user-card')).toBe(true);
  });

  test('renders the avatar image with the correct alt text', () => {
    const container = mountCard();
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image.getAttribute('alt')).toBe('Ada Lovelace');
    expect(image.getAttribute('src')).toBeTruthy();
  });

  test('shows the user name inside a heading', () => {
    const container = mountCard();
    const heading = container.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toContain('Ada Lovelace');
  });
});
