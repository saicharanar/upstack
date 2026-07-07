const meta = {
  id: 'title-effect',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'effect-on-mount',
      label: 'Syncs on first render',
      tests: ['sets the document title on mount'],
      required: true,
    },
    {
      id: 'effect-on-change',
      label: 'Re-syncs when the value changes',
      tests: ['keeps the title in sync when the count changes'],
      required: true,
    },
  ],
};

export default meta;
