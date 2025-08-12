// src/pages/client/Home.jsx

import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Bienvenue sur Sonishop 🛍️</h1>
      <p>Découvrez nos produits en ligne !</p>

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
          Voir nos produits
        </button>

        {!isLoggedIn && (
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
        )}
      </div>
    </div>
  );
}

export default Home;
