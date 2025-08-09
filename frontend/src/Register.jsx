import React, { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // ou admin si tu veux tester

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Inscription réussie, connecte-toi !');
      window.location.href = '/';
    } else {
      alert(data.message || 'Erreur inscription');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Inscription</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="client">Client</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">S’inscrire</button>
    </form>
  );
}
