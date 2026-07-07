const meta = {
  id: 'edit-profile',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'object-initial',
      label: 'Shows the starting profile',
      tests: ['starts as a member'],
      required: true,
    },
    {
      id: 'object-immutable-update',
      label: 'Updates one field immutably',
      tests: ['promotes to admin when clicked'],
      required: true,
    },
  ],
};

export default meta;
