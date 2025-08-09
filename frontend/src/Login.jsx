// src/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Mock login handler
  const handleSubmit = e => {
    e.preventDefault();

    // Simule une connexion admin ou client selon email
    if (email === 'admin@example.com' && password === 'admin') {
      navigate('/admin');
    } else if (email === 'client@example.com' && password === 'client') {
      navigate('/client');
    } else {
      alert('Identifiants invalides');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Se connecter</button>
    </form>
  );
}
