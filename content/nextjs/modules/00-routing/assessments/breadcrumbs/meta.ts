const meta = {
  id: 'breadcrumbs',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'crumbs-one-per-segment',
      label: 'One crumb per path segment',
      tests: ['builds one crumb per path segment'],
      required: true,
    },
    {
      id: 'crumbs-cumulative-href',
      label: 'Cumulative href for each crumb',
      tests: ['builds the cumulative href for each crumb'],
      required: true,
    },
    {
      id: 'crumbs-empty-root',
      label: 'Handles the root path',
      tests: ['returns no crumbs for the root path'],
      required: true,
    },
  ],
};

export default meta;
