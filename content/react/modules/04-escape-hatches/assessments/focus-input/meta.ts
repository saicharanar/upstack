const meta = {
  id: 'focus-input',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'ref-not-focused-initially',
      label: 'Input is not focused at first',
      tests: ['leaves the input unfocused before clicking'],
      required: true,
    },
    {
      id: 'ref-focus-on-click',
      label: 'Focuses the input via a ref',
      tests: ['focuses the input when the button is clicked'],
      required: true,
    },
  ],
};

export default meta;
