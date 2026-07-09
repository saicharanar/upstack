const meta = {
  id: 'updater-batch',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'queue-updater-function',
      label: 'Adds three in one click with updater functions',
      tests: ['adds three in a single click'],
      required: true,
    },
    {
      id: 'queue-accumulates',
      label: 'Keeps stacking on each click',
      tests: ['adds three again on a second click'],
      required: true,
    },
  ],
};

export default meta;
