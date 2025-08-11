import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from '../../components/icons/CommonIcons'
import AuthLayout from '../../components/layout/AuthLayout'

function Register() {
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
    const { register, loading, error, clearError } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Effacer l'erreur pour ce champ spécifique
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }

        // Effacer l'erreur générale quand l'utilisateur tape
        if (error) clearError()
    }

    const validateForm = () => {
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = 'Le nom est requis'
        }

        if (!formData.email.trim()) {
            errors.email = 'L\'email est requis'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'L\'email n\'est pas valide'
        }

        if (!formData.password) {
            errors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 8) {
            errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
        }

        if (!formData.password_confirmation) {
            errors.password_confirmation = 'La confirmation du mot de passe est requise'
        } else if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Les mots de passe ne correspondent pas'
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Le numéro de téléphone est requis'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        const result = await register(formData)
        if (result.success) {
            navigate('/verify-email')
        }
    }

    return (
        <AuthLayout
            title="Créer un compte"
            subtitle="Rejoignez la communauté SoniShop"
        >
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
                <div className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-soni-navy mb-2">
                            Nom complet *
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light`}
                            placeholder="Votre nom complet"
                        />
                        {formErrors.name && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-soni-navy mb-2">
                            Adresse email *
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light`}
                            placeholder="exemple@email.com"
                        />
                        {formErrors.email && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-soni-navy mb-2">
                            Numéro de téléphone *
                        </label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light`}
                            placeholder="Votre numéro de téléphone"
                        />
                        {formErrors.phone && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-soni-navy mb-2">
                            Adresse de livraison
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light resize-none"
                            placeholder="Votre adresse complète (optionnel)"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-soni-navy mb-2">
                            Mot de passe *
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 border ${formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light`}
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-soni-gray cursor-pointer" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-soni-gray cursor-pointer" />
                                )}
                            </button>
                        </div>
                        {formErrors.password && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.password}</p>}
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-soni-navy mb-2">
                            Confirmer le mot de passe *
                        </label>
                        <div className="relative">
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 border ${formErrors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light`}
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-soni-gray cursor-pointer" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-soni-gray cursor-pointer" />
                                )}
                            </button>
                        </div>
                        {formErrors.password_confirmation && <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.password_confirmation}</p>}
                    </div>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded transition-all"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-soni-gray">
                            J'accepte les{' '}
                            <Link to="/terms" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
                                conditions d'utilisation
                            </Link>{' '}
                            et la{' '}
                            <Link to="/privacy" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
                                politique de confidentialité
                            </Link>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-soni-navy to-blue-800 hover:from-soni-navy/90 hover:to-blue-800/90 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] hover:cursor-pointer mb-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Création en cours...
                            </>
                        ) : (
                            <span className="flex items-center">
                                Créer mon compte
                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-soni-gray">
                            Déjà un compte ?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </AuthLayout>
    )
}

export default Register
