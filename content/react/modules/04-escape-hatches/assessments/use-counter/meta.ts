const meta = {
  id: 'use-counter',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'hook-behavior',
      label: 'Custom hook exposes behavior',
      tests: ['increments through the custom hook'],
      required: true,
    },
    {
      id: 'hook-accumulates',
      label: 'State persists across renders',
      tests: ['keeps counting up across clicks'],
      required: true,
    },
  ],
};

export default meta;
