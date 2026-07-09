const meta = {
  id: 'toggle-visibility',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'state-toggle',
      label: 'Toggles the light on and off',
      tests: ['toggles the light on and off'],
      required: true,
    },
    {
      id: 'state-label',
      label: 'Updates the button label to match',
      tests: ['updates the button label as it toggles'],
      required: true,
    },
  ],
};

export default meta;
