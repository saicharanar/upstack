const meta = {
  id: 'useid-labels',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'useid-connect',
      label: 'Links each label to its own input',
      tests: ['connects each label to its own input'],
      required: true,
    },
    {
      id: 'useid-describe',
      label: 'Points each input at its hint for screen readers',
      tests: ['points each input at its hint text for screen readers'],
      required: true,
    },
    {
      id: 'useid-unique',
      label: 'Keeps ids unique when reused',
      tests: ['gives the two fields different ids'],
      required: true,
    },
  ],
};

export default meta;
