import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    password_confirmation: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://public.test/api/register', form, {
        withCredentials: true,
      });
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate('/login');
      }, 2000); // redirection après 2 secondes
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’inscription.');
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Compte créé avec succès ! Redirection vers la page de connexion...</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Nom" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Téléphone (optionnel)" onChange={handleChange} />
        <input type="text" name="location" placeholder="Localisation (optionnelle)" onChange={handleChange} />
        <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
        <input type="password" name="password_confirmation" placeholder="Confirmer le mot de passe" onChange={handleChange} required />
        <button type="submit" disabled={success}>S’inscrire</button>
      </form>
    </div>
  );
}

export default Register;
