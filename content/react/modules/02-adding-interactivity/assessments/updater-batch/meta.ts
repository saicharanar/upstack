const meta = {
  id: 'updater-batch',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'queue-starts-zero',
      label: 'Starts at zero',
      tests: ['starts at zero'],
      required: true,
    },
    {
      id: 'queue-updater-function',
      label: 'Adds three in one click with updater functions',
      tests: ['adds three in a single click'],
      required: true,
    },
  ],
};

export default meta;
