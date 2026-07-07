const meta = {
  id: 'toggle-visibility',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'state-initial-hidden',
      label: 'Starts with the light off',
      tests: ['starts with the light off'],
      required: true,
    },
    {
      id: 'state-toggle',
      label: 'Turns on when flipped',
      tests: ['turns the light on when flipped'],
      required: true,
    },
  ],
};

export default meta;
