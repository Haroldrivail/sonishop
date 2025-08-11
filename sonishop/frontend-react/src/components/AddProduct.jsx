import { useState } from 'react';
import axios from 'axios';

function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    if (form.image) {
      data.append('image', form.image);
    }

    try {
      // Attention: ici il faut envoyer le token d'authentification si besoin
      await axios.post('http://public.test/api/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('Produit ajouté avec succès !');
      setForm({ name: '', description: '', price: '', image: null });
    } catch (error) {
      setMessage('Erreur lors de l’ajout');
    }
  };

  return (
    <div>
      <h2>Ajouter un produit</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nom du produit"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <br />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Prix"
          value={form.price}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <br />
        <button type="submit">Ajouter</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AddProduct;
