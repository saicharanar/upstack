const meta = {
  id: 'memo-skip',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'memo-skips-unrelated',
      label: 'Skips re-rendering on an unrelated parent update',
      tests: ['does not re-render the child on an unrelated parent update'],
      required: true,
    },
  ],
};

export default meta;
