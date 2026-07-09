const meta = {
  id: 'derive-not-effect',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'dne-filter',
      label: 'Filters during render as you type',
      tests: ['filters the list as you type'],
      required: true,
    },
    {
      id: 'dne-no-match',
      label: 'Shows nothing when no item matches',
      tests: ['shows nothing when no fruit matches'],
      required: true,
    },
  ],
};

export default meta;
