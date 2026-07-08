const meta = {
  id: 'theme-context',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'context-consume',
      label: 'Reads the value from context',
      tests: ['reads the theme from context instead of the placeholder'],
      required: true,
    },
    {
      id: 'context-provide',
      label: 'Provides a value to the tree',
      tests: ['shows the provided dark theme deep in the tree'],
      required: true,
    },
  ],
};

export default meta;
