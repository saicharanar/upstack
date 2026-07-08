const meta = {
  id: 'shopping-cart',
  template: 'react',
  entry: '/App.js',
  passRule: 'all-required',
  visibleFiles: ['/App.js'],
  readOnlyFiles: [],
  concepts: [
    {
      id: 'cart-add',
      label: 'Adds a product to the cart',
      tests: ['adds a product to the cart'],
      required: true,
    },
    {
      id: 'cart-increment',
      label: 'Increments quantity for a repeat product',
      tests: ['increases the quantity when the same product is added again'],
      required: true,
    },
    {
      id: 'cart-remove',
      label: 'Removes a product',
      tests: ['removes a product from the cart'],
      required: true,
    },
    {
      id: 'cart-total',
      label: 'Shows the derived running total',
      tests: ['shows the running total'],
      required: true,
    },
  ],
};

export default meta;
