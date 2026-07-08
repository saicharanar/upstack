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
    // TODO: Add a new task with the trimmed draft text (starting undone), then
    // clear the draft. Ignore empty or whitespace-only input. Each task needs a
    // unique id (nextId is available above).
  }

  function toggleTask(id) {
    // TODO: Flip the done/undone state of the task with this id.
  }

  function deleteTask(id) {
    // TODO: Remove the task with this id from the list.
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

      {/* TODO: When no tasks remain, show a <p> that contains the words "All done". */}
    </div>
  );
}
