const meta = {
  id: 'tea-set',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'pure-render-count',
      label: 'Renders one cupcake per guest',
      tests: ['sets out one cupcake per guest'],
      required: true,
    },
    {
      id: 'pure-from-props',
      label: 'Computes each cupcake from its prop',
      tests: ['numbers each cupcake from its guest prop'],
      required: true,
    },
  ],
};

export default meta;
