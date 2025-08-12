// src/App.jsx

import { Routes, Route } from 'react-router-dom';

import Welcome from './pages/Welcome.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Dashboard from './pages/admin/dashboard.jsx';
import Home from './pages/client/Home.jsx';
import GestionProduits from './pages/admin/GestionProduits.jsx';
import Produits from './pages/Produits';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/home" element={<Home />} />
      <Route path="/gestion-produits" element={<GestionProduits />} />
      <Route path="/produits" element={<Produits />} />
    </Routes>
  );
}

export default App;
