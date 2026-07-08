const meta = {
  id: 'error-boundary',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'eb-shows-fallback',
      label: 'Shows the fallback when a child throws',
      tests: ['shows the fallback when a child throws'],
      required: true,
    },
    {
      id: 'eb-contains-crash',
      label: 'Contains the crash so the rest survives',
      tests: ['keeps the rest of the page alive'],
      required: true,
    },
  ],
};

export default meta;
