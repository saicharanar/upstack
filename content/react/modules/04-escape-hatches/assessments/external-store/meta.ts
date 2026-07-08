const meta = {
  id: 'external-store',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'store-read',
      label: 'Shows the store value',
      tests: ['shows the store value'],
      required: true,
    },
    {
      id: 'store-subscribe',
      label: 'Re-renders when the store changes',
      tests: ['updates when the store changes'],
      required: true,
    },
  ],
};

export default meta;
