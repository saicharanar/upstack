const meta = {
  id: 'portal-modal',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'portal-hidden-until-open',
      label: 'Hidden until opened',
      tests: ['shows no modal until it is opened'],
      required: true,
    },
    {
      id: 'portal-renders-outside',
      label: 'Renders outside the app container',
      tests: ['renders the modal outside the app container when opened'],
      required: true,
    },
    {
      id: 'portal-shows-content',
      label: 'Shows the modal content',
      tests: ['shows the modal content when opened'],
      required: true,
    },
    {
      id: 'portal-closes',
      label: 'Closes again',
      tests: ['closes the modal when close is clicked'],
      required: true,
    },
  ],
};

export default meta;
