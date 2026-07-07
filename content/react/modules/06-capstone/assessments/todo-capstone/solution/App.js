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
    const text = draft.trim();
    if (!text) return;
    setTasks([...tasks, { id: nextId++, text, done: false }]);
    setDraft('');
  }

  function toggleTask(id) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
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

      {tasks.length === 0 && <p>All done — add a task to get started.</p>}
    </div>
  );
}
