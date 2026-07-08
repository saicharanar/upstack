const meta = {
  id: 'use-memo-cache',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'memo-skips-unrelated',
      label: 'Skips the work on an unrelated re-render',
      tests: ['does not recompute on an unrelated re-render'],
      required: true,
    },
    {
      id: 'memo-recomputes-on-change',
      label: 'Recomputes when its input changes',
      tests: ['recomputes when its input changes'],
      required: true,
    },
  ],
};

export default meta;
