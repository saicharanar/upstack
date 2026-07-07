const meta = {
  id: 'use-counter',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'hook-initial',
      label: 'Custom hook holds initial state',
      tests: ['starts at zero through the hook'],
      required: true,
    },
    {
      id: 'hook-behavior',
      label: 'Custom hook exposes behavior',
      tests: ['increments through the custom hook'],
      required: true,
    },
  ],
};

export default meta;
