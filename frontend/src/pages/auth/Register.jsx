import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from '../../components/icons/CommonIcons'
import AuthLayout from '../../components/layout/AuthLayout'

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        city: '',
        quartier: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Effacer l'erreur quand l'utilisateur tape
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await apiClient.post('/auth/register', formData)
            // Contrat: pas de token, email_verification_required attendu
            if (data.email_verification_required) {
                navigate('/verify-email?registered=1', {
                    state: { email: formData.email.trim().toLowerCase() }
                })
            } else {
                // fallback (au cas où flux web)
                navigate('/')
            }
        } catch (error) {
            if (error.response?.status === 422) {
                const errs = error.response.data.errors
                const first = Object.values(errs || {})[0]
                setError(first || 'Erreur de validation')
            } else {
                setError(error.response?.data?.message || error.message || 'Erreur inconnue')
            }
        } finally {
            setLoading(false)
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                            placeholder="Votre nom complet"
                        />
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                            placeholder="exemple@email.com"
                        />
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                            placeholder="Votre numéro de téléphone"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="city" className="block text-sm font-semibold text-soni-navy mb-2">Ville</label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                                placeholder="Ex: Douala"
                            />
                        </div>
                        <div>
                            <label htmlFor="quartier" className="block text-sm font-semibold text-soni-navy mb-2">Quartier</label>
                            <input
                                id="quartier"
                                name="quartier"
                                type="text"
                                value={formData.quartier}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                                placeholder="Ex: Bonapriso"
                            />
                        </div>
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
                                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                                )}
                            </button>
                        </div>
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
                                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all duration-200 text-soni-navy placeholder-soni-gray-light"
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-accent-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] hover:cursor-pointer mb-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Inscription en cours...
                            </>
                        ) : (
                            <span className="flex items-center">
                                Créer mon compte
                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Déjà un compte ?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors hover:underline"
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
