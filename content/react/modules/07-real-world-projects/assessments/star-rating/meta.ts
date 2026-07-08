const meta = {
  id: 'star-rating',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'star-initial',
      label: 'Starts with no stars filled',
      tests: ['starts with no stars filled'],
      required: true,
    },
    {
      id: 'star-fill',
      label: 'Fills stars up to the one clicked',
      tests: ['fills stars up to the one you click'],
      required: true,
    },
    {
      id: 'star-number',
      label: 'Shows the numeric rating',
      tests: ['shows the numeric rating'],
      required: true,
    },
  ],
};

export default meta;
