const meta = {
  id: 'use-memo-cache',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'memo-only-on-change',
      label: 'Recomputes only when its input changes',
      tests: ['recomputes only when its input changes'],
      required: true,
    },
  ],
};

export default meta;
