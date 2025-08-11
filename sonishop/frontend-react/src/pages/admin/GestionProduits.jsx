import { useEffect, useState } from 'react';
import axios from 'axios';

function GestionProduits() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem('token'); // Récupère le token

  // Récupérer les produits
  const fetchProducts = () => {
    axios.get('http://public.test/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error(err);
        setMessage('Erreur lors du chargement des produits');
      });
  };

  useEffect(() => {
    if (token) fetchProducts();
    else setMessage('Non autorisé. Connectez-vous.');
  }, []);

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
    if (form.image) data.append('image', form.image);

    try {
      if (editing) {
        data.append('_method', 'PUT'); // Spoof PUT
        await axios.post(`http://public.test/api/products/${form.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage('Produit modifié avec succès !');
      } else {
        await axios.post('http://public.test/api/products', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage('Produit ajouté avec succès !');
      }

      setForm({ id: null, name: '', description: '', price: '', image: null });
      setEditing(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de l’enregistrement');
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: null,
    });
    setEditing(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://public.test/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Produit supprimé avec succès !');
      fetchProducts();
    } catch (error) {
      console.error(error);
      setMessage('Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Gestion des produits</h2>

      {token ? (
        <>
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
            <button type="submit">{editing ? 'Modifier' : 'Ajouter'}</button>
          </form>

          {message && <p>{message}</p>}

          <hr />

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {products.map(product => (
              <li key={product.id} style={{ marginBottom: 20 }}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Prix: {product.price} €</p>
                <button onClick={() => handleEdit(product)}>Modifier</button>{' '}
                <button onClick={() => handleDelete(product.id)}>Supprimer</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>⚠️ Vous devez être connecté pour accéder à cette page.</p>
      )}
    </div>
  );
}

export default GestionProduits;
