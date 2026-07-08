const meta = {
  id: 'reduced-motion',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'rm-default',
      label: 'Uses a normal duration by default',
      tests: ['uses a normal duration by default'],
      required: true,
    },
    {
      id: 'rm-reduced',
      label: 'Goes instant when reduced motion is preferred',
      tests: ['makes motion instant when reduced motion is preferred'],
      required: true,
    },
  ],
};

export default meta;
