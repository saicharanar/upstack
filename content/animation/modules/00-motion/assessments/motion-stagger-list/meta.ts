const meta = {
  id: 'motion-stagger-list',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  dependencies: { motion: '^12' },
  concepts: [
    {
      id: 'stagger-one-per-item',
      label: 'Renders one animated item per skill',
      tests: ['renders one list item per skill'],
      required: true,
    },
    {
      id: 'stagger-shows-content',
      label: 'Shows every skill',
      tests: ['shows every skill'],
      required: true,
    },
  ],
};

export default meta;
