import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Produits() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://public.test/api/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage('Erreur lors du chargement des produits');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', padding: '20px' }}>
      <h2>🛍️ Nos Produits</h2>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Retour à l'accueil
      </button>

      {loading && <p>Chargement des produits...</p>}
      {message && <p style={{ color: 'red' }}>{message}</p>}

      {!loading && !message && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center'
        }}>
          {products.length === 0 && <p>Aucun produit disponible.</p>}
          {products.map(product => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              width: '250px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {product.image && (
                <img
                  src={`http://public.test/storage/${product.image}`}
                  alt={product.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', marginBottom: '10px' }}
                />
              )}
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>{product.price} €</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Produits;
