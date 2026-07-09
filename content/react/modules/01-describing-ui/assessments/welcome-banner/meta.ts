const meta = {
  id: 'welcome-banner',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'badge-hello',
      label: 'Greets with a hello heading',
      tests: ['greets with a hello heading'],
      required: true,
    },
    {
      id: 'badge-name',
      label: 'Names the wearer below the greeting',
      tests: ['introduces a name below the greeting'],
      required: true,
    },
  ],
};

export default meta;
