const meta = {
  id: 'filter-params',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'fp-q',
      label: 'Trims the search text',
      tests: ['trims the search text'],
      required: true,
    },
    {
      id: 'fp-sort',
      label: 'Defaults sort to "new"',
      tests: ['defaults sort to new'],
      required: true,
    },
    {
      id: 'fp-page',
      label: 'Coerces page to a number ≥ 1',
      tests: ['coerces page to a number at least 1'],
      required: true,
    },
  ],
};

export default meta;
