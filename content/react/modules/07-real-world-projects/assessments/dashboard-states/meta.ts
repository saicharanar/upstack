const meta = {
  id: 'dashboard-states',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'dash-loading',
      label: 'Shows a loading state',
      tests: ['shows a loading message while loading'],
      required: true,
    },
    {
      id: 'dash-error',
      label: 'Shows an error state',
      tests: ['shows the error message on failure'],
      required: true,
    },
    {
      id: 'dash-empty',
      label: 'Shows an empty state',
      tests: ['shows an empty message when there are no users'],
      required: true,
    },
    {
      id: 'dash-data',
      label: 'Shows the data',
      tests: ['lists the users on success'],
      required: true,
    },
  ],
};

export default meta;
