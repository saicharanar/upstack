import { useState } from 'react';

export default function TodoList() {
  // State is an array of tasks. Start with two.
  //
  // 1. Render one <li> per task inside a <ul>.
  // 2. An "Add task" button appends a new task WITHOUT mutating the old array —
  //    build a new array with spread:
  //      setTasks([...tasks, { id: tasks.length + 1, text: 'New task' }])
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn JSX' },
    { id: 2, text: 'Learn props' },
  ]);
  return null;
}
