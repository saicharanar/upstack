import { act } from 'react';
import { createRoot } from 'react-dom/client';
import TodoApp from './App';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// These tests check BEHAVIOR only — what a user can do and see. They never assert
// on styling, class names, colors, or layout. Controls are found the way a user
// finds them: by their text and their task's text.

function setup() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<TodoApp />));
  return container;
}

function typeInDraft(container, value) {
  const input = container.querySelector('input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function submitForm(container) {
  const form = container.querySelector('form');
  act(() => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

function click(node) {
  act(() => node.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

const items = (container) => container.querySelectorAll('li');
const taskWithText = (container, text) =>
  [...container.querySelectorAll('li')].find((li) => li.textContent.includes(text));
const isDeleteButton = (button) => /^delete$/i.test(button.textContent.trim());
// The "complete/toggle" control is the button that carries the task text (not Delete).
const completeButton = (li) => [...li.querySelectorAll('button')].find((b) => !isDeleteButton(b));
const deleteButton = (li) => [...li.querySelectorAll('button')].find((b) => isDeleteButton(b));

describe('Todo capstone', () => {
  test('adds a task from the input field', () => {
    const c = setup();
    typeInDraft(c, 'Write tests');
    submitForm(c);
    expect(items(c).length).toBe(4);
    expect(c.textContent).toContain('Write tests');
  });

  test('a new task starts as still to-do', () => {
    const c = setup();
    expect(c.textContent).toContain('3 left');
    typeInDraft(c, 'Write tests');
    submitForm(c);
    expect(c.textContent).toContain('4 left');
  });

  test('ignores empty or whitespace-only input', () => {
    const c = setup();
    typeInDraft(c, 'Write tests');
    submitForm(c);
    expect(items(c).length).toBe(4); // a real task is added...
    typeInDraft(c, '   ');
    submitForm(c);
    expect(items(c).length).toBe(4); // ...but whitespace is ignored
  });

  test('marks a task done and updates the remaining count', () => {
    const c = setup();
    expect(c.textContent).toContain('3 left');
    click(completeButton(taskWithText(c, 'Learn JSX')));
    expect(c.textContent).toContain('2 left');
  });

  test('un-completes a task when clicked again', () => {
    const c = setup();
    click(completeButton(taskWithText(c, 'Learn JSX')));
    expect(c.textContent).toContain('2 left');
    click(completeButton(taskWithText(c, 'Learn JSX')));
    expect(c.textContent).toContain('3 left');
  });

  test('removes only the clicked task, leaving the others', () => {
    const c = setup();
    click(deleteButton(taskWithText(c, 'Learn state')));
    expect(items(c).length).toBe(2);
    expect(c.textContent).not.toContain('Learn state');
    expect(c.textContent).toContain('Learn JSX');
    expect(c.textContent).toContain('Build a todo app');
  });

  test('shows a message when all tasks are gone', () => {
    const c = setup();
    for (let i = 0; i < 3; i++) {
      click(deleteButton([...c.querySelectorAll('li')][0]));
    }
    expect(items(c).length).toBe(0);
    expect(c.textContent).toContain('All done');
  });
});
