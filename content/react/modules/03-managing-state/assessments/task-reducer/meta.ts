const meta = {
  id: 'task-reducer',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'reducer-increment',
      label: 'Handles the increment action',
      tests: ['increments on the increment action'],
      required: true,
    },
    {
      id: 'reducer-reset',
      label: 'Handles the reset action',
      tests: ['resets to zero on the reset action'],
      required: true,
    },
  ],
};

export default meta;
