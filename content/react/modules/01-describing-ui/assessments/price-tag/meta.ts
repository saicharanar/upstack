const meta = {
  id: 'price-tag',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'jsx-expression-text',
      label: 'Shows a value with { }',
      tests: ['shows the product name in a heading'],
      required: true,
    },
    {
      id: 'jsx-expression-format',
      label: 'Formats a value inside { }',
      tests: ['formats the price with a dollar sign and two decimals'],
      required: true,
    },
  ],
};

export default meta;
