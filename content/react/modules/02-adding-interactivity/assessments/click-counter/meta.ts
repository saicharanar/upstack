const meta = {
  id: 'click-counter',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'event-initial-render',
      label: 'Starts with zero likes',
      tests: ['starts with zero likes'],
      required: true,
    },
    {
      id: 'event-updates-state',
      label: 'Adds a like on each tap',
      tests: ['adds a like each time the heart is tapped'],
      required: true,
    },
  ],
};

export default meta;
