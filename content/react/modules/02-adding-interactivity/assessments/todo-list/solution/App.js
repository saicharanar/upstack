import { useState } from 'react';

export default function TodoList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn JSX' },
    { id: 2, text: 'Learn props' },
  ]);

  function addTask() {
    setTasks([...tasks, { id: tasks.length + 1, text: 'New task' }]);
  }

  return (
    <div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.text}</li>
        ))}
      </ul>
      <button onClick={addTask}>Add task</button>
    </div>
  );
}
