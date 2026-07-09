const meta = {
  id: 'external-store',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'store-subscribe',
      label: 'Re-renders when the store changes',
      tests: ['updates when the store changes'],
      required: true,
    },
    {
      id: 'store-shared',
      label: 'Keeps every subscribed component in sync',
      tests: ['keeps every subscribed component in sync'],
      required: true,
    },
  ],
};

export default meta;
