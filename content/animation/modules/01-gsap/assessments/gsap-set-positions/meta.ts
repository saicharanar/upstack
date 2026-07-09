const meta = {
  id: 'gsap-set-positions',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  dependencies: { gsap: '^3', '@gsap/react': '^2' },
  concepts: [
    {
      id: 'positions-row',
      label: 'Lays the boxes out in a row',
      tests: ['places each box further right than the last'],
      required: true,
    },
  ],
};

export default meta;
