const meta = {
  id: 'theme-context',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'context-provide',
      label: 'Provides a value to the tree',
      tests: ['makes the theme available deep in the tree'],
      required: true,
    },
    {
      id: 'context-consume',
      label: 'Reads the value with useContext',
      tests: ['reads the theme without prop drilling'],
      required: true,
    },
  ],
};

export default meta;
