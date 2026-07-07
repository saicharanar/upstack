const meta = {
  id: 'lift-up',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'lift-initial',
      label: 'Shares a starting value',
      tests: ['starts with zero stars'],
      required: true,
    },
    {
      id: 'lift-shared-update',
      label: 'Updates shared state from a child',
      tests: ['adds a star from the button to the shared count'],
      required: true,
    },
  ],
};

export default meta;
