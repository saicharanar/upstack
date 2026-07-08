const meta = {
  id: 'suspense-boundary',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'suspense-fallback',
      label: 'Shows the loading fallback',
      tests: ['shows the loading fallback while content is not ready'],
      required: true,
    },
    {
      id: 'suspense-contains',
      label: 'Contains the suspense so the page still renders',
      tests: ['keeps the surrounding heading visible while loading'],
      required: true,
    },
  ],
};

export default meta;
