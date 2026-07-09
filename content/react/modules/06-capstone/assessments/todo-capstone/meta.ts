const meta = {
  id: 'todo-capstone',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'capstone-add',
      label: 'Adds a task from the input',
      tests: ['adds a task from the input field', 'a new task starts as still to-do'],
      required: true,
    },
    {
      id: 'capstone-validate-empty',
      label: 'Ignores empty input (edge case)',
      tests: ['ignores empty or whitespace-only input'],
      required: true,
    },
    {
      id: 'capstone-toggle',
      label: 'Toggles done (and back) and updates the remaining count',
      tests: [
        'marks a task done and updates the remaining count',
        'un-completes a task when clicked again',
      ],
      required: true,
    },
    {
      id: 'capstone-delete',
      label: 'Deletes the right task',
      tests: ['removes only the clicked task, leaving the others'],
      required: true,
    },
    {
      id: 'capstone-empty-state',
      label: 'Shows an empty state (edge case)',
      tests: ['shows a message when all tasks are gone'],
      required: true,
    },
  ],
};

export default meta;
