const meta = {
  id: 'gsap-set',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  dependencies: { gsap: '^3', '@gsap/react': '^2' },
  concepts: [
    {
      id: 'gsap-set-x',
      label: 'Moves the box to the right',
      tests: ['moves the box to the right'],
      required: true,
    },
    {
      id: 'gsap-set-opacity',
      label: 'Makes the box half transparent',
      tests: ['makes the box half transparent'],
      required: true,
    },
  ],
};

export default meta;
