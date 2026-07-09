const meta = {
  id: 'portal-modal',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'portal-outside',
      label: 'Renders the modal into document.body, outside the app',
      tests: ['renders the modal into document.body, outside the app, when opened'],
      required: true,
    },
    {
      id: 'portal-content',
      label: 'Shows the modal content when opened',
      tests: ['shows the modal content when opened'],
      required: true,
    },
    {
      id: 'portal-closes',
      label: 'Closes the modal',
      tests: ['closes the modal when close is clicked'],
      required: true,
    },
  ],
};

export default meta;
