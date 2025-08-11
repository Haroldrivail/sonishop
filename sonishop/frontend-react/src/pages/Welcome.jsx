// src/pages/Welcome.jsx

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Welcome() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://public.test/api/hello')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Erreur lors du chargement'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Bienvenue sur Sonishop 🛍️</h1>
      <p>{message || 'Chargement...'}</p>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => navigate('/produits')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Nos Produits
        </button>

        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}

export default Welcome;
