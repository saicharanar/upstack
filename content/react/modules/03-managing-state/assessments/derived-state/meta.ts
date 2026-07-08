const meta = {
  id: 'derived-state',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'derived-shows',
      label: 'Shows the derived full name',
      tests: ['shows the full name'],
      required: true,
    },
    {
      id: 'derived-live',
      label: 'Stays in sync when a field changes',
      tests: ['updates the full name when a field changes'],
      required: true,
    },
  ],
};

export default meta;
