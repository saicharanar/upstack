const meta = {
  id: 'avatar-props',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'props-read-value',
      label: 'Reads a prop and shows it',
      tests: ["shows the person's name as the image alt text", 'labels the avatar with the name'],
      required: true,
    },
    {
      id: 'props-in-attribute',
      label: 'Uses a prop in an attribute',
      tests: ['sizes the avatar from the size prop'],
      required: true,
    },
  ],
};

export default meta;
