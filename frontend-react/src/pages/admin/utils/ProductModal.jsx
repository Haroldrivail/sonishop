import axios from 'axios';
import { useState, useEffect } from 'react';


const categories = ['Smartphones', 'Ordinateurs', 'Audio', 'Tablettes', 'Accessoires'];

const ProductModal = ({ isOpen, onClose, onSuccess, mode = 'create', initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        sale_price: '',
        stock: '',
        category: '',
        in_stock: false,
        is_new: false,
        free_shipping: false,
        image: '',
        file: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price?.toString() || '',
                sale_price: initialData.sale_price?.toString() || '',
                stock: initialData.stock?.toString() || '',
                image: initialData.image || '',
                category: initialData.category || '',
                in_stock: Boolean(initialData.in_stock),
                is_new: Boolean(initialData.is_new),
                free_shipping: Boolean(initialData.free_shipping),
                file: null // Réinitialiser le fichier pour éviter les conflits
            });
            setFormErrors({});
            setFormError(null);
        } else if (isOpen && mode === 'create') {
            setFormData({
                name: '',
                description: '',
                price: '',
                sale_price: '',
                stock: '',
                image: '',
                category: '',
                in_stock: false,
                is_new: false,
                free_shipping: false,
                file: null, // Réinitialiser le fichier pour éviter les conflits
            });
            setFormErrors({});
            setFormError(null);
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
        if (formError) setFormError(null);
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) errors.name = 'Le nom est requis';
        if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0) errors.price = 'Le prix doit être un nombre positif';
        if (formData.sale_price && (isNaN(formData.sale_price) || Number(formData.sale_price) < 0)) errors.sale_price = 'Le prix promotionnel doit être un nombre positif ou vide';
        if (!formData.stock || isNaN(formData.stock) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) errors.stock = 'Le stock doit être un entier positif ou zéro';
        if (!formData.category.trim()) errors.category = 'La catégorie est requise';
        if (!formData.image.trim() && !formData.file) errors.image = 'L\'URL de l\'image est requise ou téléchargez un fichier';

        setFormErrors(errors);
        console.log('Validation errors:', errors);  // <--- Ajoute ceci

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            let uploadedImagePath = formData.image.trim(); // Défaut : URL manuelle

            // Si fichier image, on l'upload
            if (formData.file) {
                uploadedImagePath = await uploadImage(formData.file);
            }

            // ⬅️ maintenant qu'on a l'image (via URL ou fichier), on construit les données
            const dataToSend = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                sale_price: formData.sale_price ? Number(formData.sale_price) : null,
                stock: Number(formData.stock),
                image: uploadedImagePath, // ✅ correctement défini ici
                category: formData.category.trim(),
                in_stock: formData.in_stock ? 1 : 0,
                is_new: formData.is_new ? 1 : 0,
                free_shipping: formData.free_shipping ? 1 : 0,
                rating: 0,
                reviews: 0,
                sales: 0,
            };

            // Appel à l'API
            let result;
            if (mode === 'create') {
                result = await createProduct(dataToSend);
            } else {
                result = await updateProduct(initialData.id, dataToSend);
            }

            if (result.success) {
                onSuccess && onSuccess();
                onClose();
            } else {
                setFormError(result.message || 'Erreur lors de la sauvegarde');
            }
        } catch (err) {
            console.error('Erreur lors de la création:', err);
            setFormError("Erreur serveur, veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };


    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            // Appel à l'API pour uploader l'image
            const response = await axios.post('http://public.test/api/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Image Upload Response:', response.data); // <-- à garder pour déboguer

            return response.data.imagePath; // Assurez-vous que l'API retourne l'URL de l'image
        } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error);
            throw new Error('Échec de l\'upload de l\'image');
        }
    };

    const createProduct = async (data) => {
        const res = await axios.post('http://public.test/api/products', data, {
            withCredentials: true
        });
        return res.data;
    };

    const updateProduct = async (id, data) => {
        const res = await axios.put(`http://public.test/api/products/${id}`, data, {
            withCredentials: true
        });
        return res.data;
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-lg max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                    aria-label="Fermer"
                >
                    &times;
                </button>

                <h2 className="text-xl font-bold mb-6 text-center text-soni-navy">
                    {mode === 'create' ? 'Ajouter un produit' : 'Modifier le produit'}
                </h2>

                {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
                        {formError}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Nom */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-soni-navy mb-1">Nom *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Nom du produit"
                            required
                        />
                        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-soni-navy mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm resize-none"
                            placeholder="Description du produit"
                        />
                    </div>

                    {/* Prix */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-semibold text-soni-navy mb-1">Prix *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Prix en FCFA"
                            min="0"
                            step="0.01"
                            required
                        />
                        {formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    {/* Prix promotionnel */}
                    <div>
                        <label htmlFor="sale_price" className="block text-sm font-semibold text-soni-navy mb-1">Prix promotionnel</label>
                        <input
                            type="number"
                            id="sale_price"
                            name="sale_price"
                            value={formData.sale_price}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.sale_price ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Prix promo en FCFA"
                            min="0"
                            step="0.01"
                        />
                        {formErrors.sale_price && <p className="text-red-600 text-sm mt-1">{formErrors.sale_price}</p>}
                    </div>

                    {/* Stock */}
                    <div>
                        <label htmlFor="stock" className="block text-sm font-semibold text-soni-navy mb-1">Stock *</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Quantité en stock"
                            min="0"
                            step="1"
                            required
                        />
                        {formErrors.stock && <p className="text-red-600 text-sm mt-1">{formErrors.stock}</p>}
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-soni-navy mb-1">Catégorie *</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            required
                        >
                            <option value="">-- Sélectionnez une catégorie --</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {formErrors.category && <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>}
                    </div>





                    {/* Image URL */}
                    {/* Image URL ou Upload */}
                    {/* Image Section: soit URL soit Upload, pas les deux */}
                    <div>
                        <label className="block text-sm font-semibold text-soni-navy mb-1">Image *</label>

                        {/* Affiche champ URL SEULEMENT si aucun fichier n'est sélectionné */}
                        {!formData.file && (
                            <input
                                type="url"
                                name="image"
                                placeholder="URL de l'image"
                                value={formData.image}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        image: e.target.value,
                                        file: null, // Si l'utilisateur met une URL, on efface le fichier
                                    }));
                                }}
                                className={`w-full px-4 py-2 border rounded-lg shadow-sm ${formErrors.image ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                        )}

                        {/* Afficher bouton Upload si aucune image n'est uploadée */}
                        {!formData.file && (
                            <>
                                <p className="text-center my-2 text-gray-500">Ou téléversez une image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    file,
                                                    image: reader.result, // Pour la preview uniquement
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </>
                        )}

                        {/* Preview de l'image (upload OU URL) */}
                        {formData.image && (
                            <div className="mt-4 text-center">
                                <img
                                    src={formData.image}
                                    alt="Aperçu"
                                    className="max-h-40 mx-auto"
                                />
                                {formData.file && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData(prev => ({ ...prev, file: null, image: '' }))
                                        }
                                        className="mt-2 text-sm text-red-600 hover:underline"
                                    >
                                        Supprimer l’image sélectionnée
                                    </button>
                                )}
                            </div>
                        )}

                        {formErrors.image && <p className="text-red-600 text-sm mt-1">{formErrors.image}</p>}
                    </div>



                    {/* Checkbox Booléens */}
                    <div className="flex space-x-6 mt-4">
                        <label className="flex items-center space-x-2 text-sm text-soni-navy">
                            <input
                                type="checkbox"
                                name="in_stock"
                                checked={formData.in_stock}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span>En stock</span>
                        </label>

                        <label className="flex items-center space-x-2 text-sm text-soni-navy">
                            <input
                                type="checkbox"
                                name="is_new"
                                checked={formData.is_new}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span>Nouveau</span>
                        </label>

                        <label className="flex items-center space-x-2 text-sm text-soni-navy">
                            <input
                                type="checkbox"
                                name="free_shipping"
                                checked={formData.free_shipping}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span>Livraison gratuite</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border rounded hover:bg-gray-100"
                            disabled={loading}
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'En cours...' : (mode === 'create' ? 'Créer' : 'Enregistrer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
