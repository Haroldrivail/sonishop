// src/pages/client/Home.jsx

import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Bienvenue sur Sonishop 🛍️</h1>
      <p>Découvrez nos produits en ligne !</p>

      <button onClick={() => navigate('/login')}>
        Se connecter
      </button>
    </div>
  );
}

export default Home;
