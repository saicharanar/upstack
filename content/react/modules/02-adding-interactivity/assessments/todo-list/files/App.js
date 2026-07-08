import { useState } from 'react';

export default function TodoList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Learn JSX' },
    { id: 2, text: 'Learn props' },
  ]);
  // Render one <li> per task, inside a <ul>.
  // Add a button that appends a new task to the list when clicked.
  return null;
}
