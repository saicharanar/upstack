const meta = {
  id: 'map-range',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'map-endpoints',
      label: 'Maps the range endpoints',
      tests: ['maps the endpoints of the range'],
      required: true,
    },
    {
      id: 'map-interpolate',
      label: 'Interpolates between the ranges',
      tests: ['interpolates between arbitrary ranges'],
      required: true,
    },
  ],
};

export default meta;
