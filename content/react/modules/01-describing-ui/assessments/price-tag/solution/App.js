const product = { name: 'Mechanical Keyboard', price: 49.5 };

export default function PriceTag() {
  return (
    <div className="price-tag">
      <h2>{product.name}</h2>
      <span className="price">{`$${product.price.toFixed(2)}`}</span>
    </div>
  );
}
