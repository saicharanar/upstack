const meta = {
  id: 'reducer-context',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'rc-initial',
      label: 'Shares the count through context',
      tests: ['shows the initial count'],
      required: true,
    },
    {
      id: 'rc-dispatch',
      label: 'Dispatches from a nested button',
      tests: ['adds through context from a nested button'],
      required: true,
    },
  ],
};

export default meta;
