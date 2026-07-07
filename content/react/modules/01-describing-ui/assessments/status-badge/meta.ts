const meta = {
  id: 'status-badge',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'conditional-online',
      label: 'Renders the online state',
      tests: ['shows Online for an available teammate'],
      required: true,
    },
    {
      id: 'conditional-offline',
      label: 'Renders the offline state',
      tests: ['shows Offline for an away teammate'],
      required: true,
    },
  ],
};

export default meta;
