import { useState } from 'react';

const CATALOG = [
  { id: 1, name: 'Keyboard', price: 50 },
  { id: 2, name: 'Mouse', price: 25 },
];

export default function Cart() {
  const [items, setItems] = useState([]);

  function addItem(product) {
    setItems((current) => {
      const existing = current.find((it) => it.id === product.id);
      if (existing) {
        return current.map((it) =>
          it.id === product.id ? { ...it, qty: it.qty + 1 } : it,
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  }

  function removeItem(id) {
    setItems((current) => current.filter((it) => it.id !== id));
  }

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

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
