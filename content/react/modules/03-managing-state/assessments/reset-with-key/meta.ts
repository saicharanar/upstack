const meta = {
  id: 'reset-with-key',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'reset-type',
      label: 'Lets you type a note',
      tests: ['lets you type a note'],
      required: true,
    },
    {
      id: 'reset-key',
      label: 'Resets the note when the user changes',
      tests: ['resets the note when you switch users'],
      required: true,
    },
  ],
};

export default meta;
