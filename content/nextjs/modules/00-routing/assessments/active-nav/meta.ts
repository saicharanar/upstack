const meta = {
  id: 'active-nav',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'nav-renders-links',
      label: 'Renders a link per item',
      tests: ['renders a link for each item'],
      required: true,
    },
    {
      id: 'nav-marks-active',
      label: 'Marks the current route active',
      tests: ['marks the current route as active'],
      required: true,
    },
  ],
};

export default meta;
