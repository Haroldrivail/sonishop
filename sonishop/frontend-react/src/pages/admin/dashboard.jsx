import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const goToGestion = () => {
    navigate('/gestion-produits');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Tableau de bord Administrateur 🛠️</h1>
      <p>Bienvenue sur le dashboard de gestion.</p>

      <button onClick={handleLogout} style={{ marginBottom: '10px' }}>
        Se déconnecter
      </button>
      <br />
      <button onClick={goToGestion}>
        Gestion des produits
      </button>
    </div>
  );
}

export default Dashboard;
