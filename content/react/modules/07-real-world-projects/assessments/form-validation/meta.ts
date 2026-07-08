const meta = {
  id: 'form-validation',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'form-shows-errors',
      label: 'Shows errors for invalid input',
      tests: ['shows validation errors for invalid input'],
      required: true,
    },
    {
      id: 'form-rejects-short-password',
      label: 'Rejects a short password',
      tests: ['rejects a short password'],
      required: true,
    },
    {
      id: 'form-succeeds',
      label: 'Creates the account when valid',
      tests: ['creates the account when the input is valid'],
      required: true,
    },
  ],
};

export default meta;
