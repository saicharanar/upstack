const meta = {
  id: 'derive-not-effect',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'dne-initial',
      label: 'Shows all items at first',
      tests: ['shows all items at first'],
      required: true,
    },
    {
      id: 'dne-filter',
      label: 'Filters during render as you type',
      tests: ['filters the list as you type'],
      required: true,
    },
  ],
};

export default meta;
