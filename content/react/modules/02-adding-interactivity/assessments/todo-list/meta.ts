const meta = {
  id: 'todo-list',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'array-initial',
      label: 'Shows the starting tasks',
      tests: ['shows the starting tasks'],
      required: true,
    },
    {
      id: 'array-immutable-add',
      label: 'Adds a task immutably',
      tests: ['adds a task when clicked'],
      required: true,
    },
  ],
};

export default meta;
