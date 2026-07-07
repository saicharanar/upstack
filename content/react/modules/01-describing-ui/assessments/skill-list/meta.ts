const meta = {
  id: 'skill-list',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'list-one-per-item',
      label: 'Renders one item per skill',
      tests: ['renders one list item per skill'],
      required: true,
    },
    {
      id: 'list-shows-content',
      label: 'Shows every skill name',
      tests: ['shows every skill name'],
      required: true,
    },
  ],
};

export default meta;
