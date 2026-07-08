const meta = {
  id: 'imperative-handle',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'imperative-types',
      label: 'Shows what you type',
      tests: ['shows what you type'],
      required: true,
    },
    {
      id: 'imperative-clear',
      label: 'Clears through the exposed ref handle',
      tests: ['clears the message box through the ref handle'],
      required: true,
    },
  ],
};

export default meta;
