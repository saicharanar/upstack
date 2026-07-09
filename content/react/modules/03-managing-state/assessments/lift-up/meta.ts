const meta = {
  id: 'lift-up',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'lift-shared-update',
      label: 'Updates shared state from a child',
      tests: ['adds a star from the button to the shared count'],
      required: true,
    },
    {
      id: 'lift-accumulates',
      label: 'Keeps accumulating across clicks',
      tests: ['keeps counting up across clicks'],
      required: true,
    },
  ],
};

export default meta;
