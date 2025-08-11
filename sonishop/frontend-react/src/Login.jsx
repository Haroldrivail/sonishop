import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://public.test/api/login', {
        email,
        password,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      const { token, user } = response.data;

      // Stocker le token et l'utilisateur dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setMessage(`Bienvenue ${user.name} !`);

      // Redirection selon le rôle
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }

    } catch (error) {
      setMessage('Erreur : ' + (error.response?.data?.message || 'Login échoué'));
    }
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Se connecter</button>
      </form>

      <button onClick={handleGoToRegister} style={{ marginTop: '10px' }}>
        S’inscrire
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
