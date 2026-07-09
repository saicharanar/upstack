const meta = {
  id: 'imperative-handle',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'imperative-clear',
      label: 'Clears through the exposed ref handle',
      tests: ['clears the message box through the ref handle'],
      required: true,
    },
    {
      id: 'imperative-focus',
      label: 'Focuses through the exposed ref handle',
      tests: ['focuses the box through the ref handle'],
      required: true,
    },
  ],
};

export default meta;
