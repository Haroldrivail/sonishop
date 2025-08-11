import { useEffect, useState } from 'react';
import axios from 'axios';

function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://public.test/api/products')
      .then(res => setProducts(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Nos Produits</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(product => (
          <li key={product.id} style={{ marginBottom: 20 }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Prix: {product.price} €</p>
            {product.image && (
              <img
                src={`http://public.test/storage/${product.image}`}
                alt={product.name}
                style={{ maxWidth: '200px' }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductsList;
