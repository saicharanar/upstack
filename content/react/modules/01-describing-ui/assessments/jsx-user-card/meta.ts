const meta = {
  id: 'jsx-user-card',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'jsx-single-root',
      label: 'Returns a single wrapping element',
      tests: ['wraps the whole card in a single parent element'],
      required: true,
    },
    {
      id: 'jsx-classes',
      label: 'Styles elements with className',
      tests: ['gives the card the user-card class name'],
      required: true,
    },
    {
      id: 'jsx-attributes',
      label: 'Sets JSX attributes correctly',
      tests: [
        'renders the avatar image with the correct alt text',
        'shows the user name inside a heading',
      ],
      required: true,
    },
  ],
};

export default meta;
