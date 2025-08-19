import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from "../../../components/icons/CommonIcons"

const RegisterClientModal = ({ isOpen, onClose, onSuccess, mode = 'create', initialData = null }) => {
  // mode: 'create' ou 'edit'
  // initialData: objet client quand on édite
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const { register, updatedUser, loading, error, clearError } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [formError, setFormError] = useState(null)

  // Quand le modal s'ouvre et mode edit, on pré-remplit les données
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        password_confirmation: '',
        phone: initialData.phone || '',
        address: initialData.address || ''
      })
      setFormErrors({})
      clearError && clearError()
    } else if (isOpen && mode === 'create') {
      // reset form pour création
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: ''
      })
      setFormErrors({})
      clearError && clearError()
    }
  }, [isOpen, mode, initialData, clearError])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
    if (error) clearError()
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Le nom est requis'
    if (!formData.email.trim()) errors.email = 'L\'email est requis'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'L\'email n\'est pas valide'

    if (mode === 'create' || formData.password || formData.password_confirmation) {
      // Mot de passe obligatoire en création, facultatif en édition (mais si rempli, validation)
      if (!formData.password) errors.password = 'Le mot de passe est requis'
      else if (formData.password.length < 8) errors.password = 'Le mot de passe doit contenir au moins 8 caractères'

      if (!formData.password_confirmation) errors.password_confirmation = 'La confirmation du mot de passe est requise'
      else if (formData.password !== formData.password_confirmation) errors.password_confirmation = 'Les mots de passe ne correspondent pas'
    }

    if (!formData.phone.trim()) errors.phone = 'Le numéro de téléphone est requis'
    if (!formData.address.trim()) errors.address = 'L\'adresse est requise'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const dataToSend = { ...formData }
    if (mode === 'edit' && !formData.password) {
      // Si on modifie sans changer le mot de passe, on supprime ces champs pour ne pas écraser
      delete dataToSend.password
      delete dataToSend.password_confirmation
    }

    if (mode === 'create') {

      const result = await register({ ...dataToSend, role: 'client' })
      if (result.success) {
        onSuccess && onSuccess()
        onClose()
      }
    } else if (mode === 'edit') {
      // updateUser devrait être une fonction dans ton contexte pour update un client
      const result = await updateUser(initialData.id, dataToSend)
      if (result.success) {
        onSuccess && onSuccess()
        onClose()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Fermer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-6 text-center text-soni-navy">
          {mode === 'create' ? 'Ajouter un client' : 'Modifier le client'}
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nom complet */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-soni-navy mb-2">
              Nom complet *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm`}
              placeholder="Votre nom complet"
              required
            />
            {formErrors.name && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-soni-navy mb-2">
              Adresse email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm`}
              placeholder="exemple@email.com"
              required
            />
            {formErrors.email && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-soni-navy mb-2">
              Numéro de téléphone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm`}
              placeholder="Votre numéro de téléphone"
              required
            />
            {formErrors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.phone}</p>}
          </div>

          {/* Adresse */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-soni-navy mb-2">
              Adresse de livraison *
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${formErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm resize-none`}
              placeholder="Votre adresse complète"
              required
            />
            {formErrors.address && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.address}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-soni-navy mb-2">
              Mot de passe {mode === 'create' ? '*' : '(laisser vide pour ne pas changer)'}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm`}
                placeholder={mode === 'create' ? "••••••••" : "(optionnel)"}
                {...(mode === 'create' ? { required: true } : {})}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-soni-gray cursor-pointer" /> : <EyeIcon className="h-5 w-5 text-soni-gray cursor-pointer" />}
              </button>
            </div>
            {formErrors.password && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.password}</p>}
          </div>

          {/* Confirmation mot de passe */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-semibold text-soni-navy mb-2">
              Confirmer le mot de passe {mode === 'create' ? '*' : '(laisser vide pour ne pas changer)'}
            </label>
            <div className="relative">
              <input
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border ${formErrors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm`}
                placeholder={mode === 'create' ? "••••••••" : "(optionnel)"}
                {...(mode === 'create' ? { required: true } : {})}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5 text-soni-gray cursor-pointer" /> : <EyeIcon className="h-5 w-5 text-soni-gray cursor-pointer" />}
              </button>
            </div>
            {formErrors.password_confirmation && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.password_confirmation}</p>}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'create' ? 'Création...' : 'Modification...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? 'Ajouter' : 'Modifier'} <ArrowRightIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterClientModal