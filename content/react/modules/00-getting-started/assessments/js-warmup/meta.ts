const meta = {
  id: 'js-warmup',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'js-destructure-template',
      label: 'Destructuring + template strings',
      tests: ['builds a full name from first and last'],
      required: true,
    },
    {
      id: 'js-array-methods',
      label: 'Array filter + sort',
      tests: ['keeps only scores above 50, highest first'],
      required: true,
    },
  ],
};

export default meta;
