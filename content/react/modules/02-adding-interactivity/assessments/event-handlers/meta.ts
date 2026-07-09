const meta = {
  id: 'event-handlers',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'eh-renders',
      label: 'Renders a button for each item',
      tests: ['renders a button for each item'],
      required: true,
    },
    {
      id: 'eh-calls',
      label: 'Calls onPick with the clicked id, only on click',
      tests: ['calls onPick with the clicked id, and only on click'],
      required: true,
    },
  ],
};

export default meta;
