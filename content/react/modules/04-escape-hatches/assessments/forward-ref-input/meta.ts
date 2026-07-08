const meta = {
  id: 'forward-ref-input',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'forwardref-initial',
      label: 'Input starts unfocused',
      tests: ['leaves the input unfocused before clicking'],
      required: true,
    },
    {
      id: 'forwardref-focus',
      label: 'Parent focuses the forwarded input',
      tests: ['focuses the forwarded input when the button is clicked'],
      required: true,
    },
  ],
};

export default meta;
