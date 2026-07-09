const meta = {
  id: 'event-handlers',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'eh-pass-not-call',
      label: 'Passes the handler (does not call it during render)',
      tests: ['does not call the handler while rendering'],
      required: true,
    },
    {
      id: 'eh-argument',
      label: 'Calls the handler with the clicked id',
      tests: ['calls the handler with the clicked item id'],
      required: true,
    },
  ],
};

export default meta;
