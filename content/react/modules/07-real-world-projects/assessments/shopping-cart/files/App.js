import { useState } from 'react';

const CATALOG = [
  { id: 1, name: 'Keyboard', price: 50 },
  { id: 2, name: 'Mouse', price: 25 },
];

export default function Cart() {
  const [items, setItems] = useState([]); // each item: { id, name, price, qty }

  function addItem(product) {
    // Add the product with qty 1. If it's already in the cart, increase that
    // item's qty by 1 instead. Update `items` immutably (no push / no mutation).
  }

  function removeItem(id) {
    // Remove the item with this id from the cart (immutably).
  }

  // The total price across the cart (each item's price × qty). Derive it here —
  // don't store it in state.
  const total = 0;

  return (
    <div>
      <div>
        {CATALOG.map((product) => (
          <button key={product.id} onClick={() => addItem(product)}>
            Add {product.name}
          </button>
        ))}
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.qty}{' '}
            <button onClick={() => removeItem(item.id)}>Remove {item.name}</button>
          </li>
        ))}
      </ul>
      <p>Total: ${total}</p>
    </div>
  );
}
