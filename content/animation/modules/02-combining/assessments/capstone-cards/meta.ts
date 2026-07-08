const meta = {
  id: 'capstone-cards',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  dependencies: { motion: '^12' },
  concepts: [
    {
      id: 'cards-count',
      label: 'Renders one card per project',
      tests: ['renders one card per project'],
      required: true,
    },
    {
      id: 'cards-content',
      label: 'Shows every project name',
      tests: ['shows every project name'],
      required: true,
    },
  ],
};

export default meta;
