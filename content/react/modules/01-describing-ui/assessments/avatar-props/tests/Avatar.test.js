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

describe('Avatar', () => {
  test("shows the person's name as the image alt text", () => {
    const container = mountApp();
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image.getAttribute('alt')).toBe('Ada Lovelace');
  });

  test('sizes the avatar from the size prop', () => {
    const container = mountApp();
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    expect(image.getAttribute('width')).toBe('64');
  });

  test('labels the avatar with the name', () => {
    const container = mountApp();
    const caption = container.querySelector('figcaption');
    expect(caption).not.toBeNull();
    expect(caption.textContent).toContain('Ada Lovelace');
  });
});
