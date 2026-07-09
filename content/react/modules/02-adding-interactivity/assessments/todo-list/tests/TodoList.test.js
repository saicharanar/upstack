import { act } from 'react';
import { createRoot } from 'react-dom/client';
import TodoList from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<TodoList />);
  });
  return container;
}

function click(node) {
  act(() => {
    node.click();
  });
}

describe('Todo list', () => {
  test('shows the starting tasks', () => {
    const container = setup();
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  test('adds a task when clicked', () => {
    const container = setup();
    click(container.querySelector('button'));
    expect(container.querySelectorAll('li').length).toBe(3);
  });
});
