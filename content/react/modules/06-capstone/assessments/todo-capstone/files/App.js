import { useState } from 'react';

let nextId = 4;

export default function TodoApp() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn JSX', done: false },
    { id: 2, text: 'Learn state', done: false },
    { id: 3, text: 'Build a todo app', done: false },
  ]);
  const [draft, setDraft] = useState('');

  function addTask(event) {
    event.preventDefault();
    // TODO: If `draft` (trimmed) is not empty, add a new task to `tasks` immutably:
    //   { id: nextId++, text: draft.trim(), done: false }
    // Then clear the draft. Ignore empty or whitespace-only input.
  }

  function toggleTask(id) {
    // TODO: Flip the `done` flag of the task with this id, immutably (use map).
  }

  function deleteTask(id) {
    // TODO: Remove the task with this id, immutably (use filter).
  }

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <div className="todo-app">
      <form onSubmit={addTask}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="New task" />
        <button type="submit">Add</button>
      </form>

      <p>{remaining} left</p>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'todo todo--done' : 'todo'}>
            <button type="button" className="todo__toggle" onClick={() => toggleTask(task.id)}>
              {task.done ? '✓ ' : ''}
              {task.text}
            </button>
            <button type="button" className="todo__delete" onClick={() => deleteTask(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* TODO: When there are no tasks left, show a <p> containing the words "All done". */}
    </div>
  );
}
