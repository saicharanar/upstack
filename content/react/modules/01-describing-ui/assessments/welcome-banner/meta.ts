const meta = {
  id: 'welcome-banner',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'component-returns-heading',
      label: 'Shows a hello heading',
      tests: ['shows a big hello heading'],
      required: true,
    },
    {
      id: 'component-returns-tagline',
      label: 'Shows a name below',
      tests: ['shows a name below the heading'],
      required: true,
    },
  ],
};

export default meta;
