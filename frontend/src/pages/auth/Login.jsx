import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiClient } from '../../api/client'
import { EyeIcon, EyeOffIcon, ArrowRightIcon } from '../../components/icons/CommonIcons'
import AuthLayout from '../../components/layout/AuthLayout'

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const location = useLocation()
    
    const { setSession } = useAuth()
    const navigate = useNavigate()

    // Récupération du message de succès depuis l'état de navigation
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Nettoyer l'URL après affichage du message
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
            const { data } = await apiClient.post('/auth/login', formData)
            
            if (data.email_verification_required) {
                navigate('/verify-email', {
                    state: {
                        email: data.user?.email || formData.email,
                        message: data.message || 'Votre email doit être vérifié avant de pouvoir accéder à votre compte.',
                        fromLogin: true
                    }
                })
                return
            }
            
            setSession(data.user, data.token)
            navigate('/')
        } catch (error) {
            console.log('Login error:', error)
            
            // Gestion des erreurs plus spécifique
            if (error.response?.status === 422) {
                // Erreurs de validation Laravel
                const errors = error.response.data.errors
                if (errors?.email) {
                    setError(errors.email[0])
                } else {
                    setError('Erreur de validation')
                }
            } else if (error.response?.status === 429) {
                // Rate limiting
                setError('Trop de tentatives. Veuillez patienter avant de réessayer.')
            } else if (error.response?.data?.message) {
                setError(error.response.data.message)
            } else {
                setError('Une erreur est survenue lors de la connexion.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Connexion"
            subtitle="Accédez à votre espace personnel"
        >
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
                    <div className="flex">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p>{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white"
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
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-600 font-medium">
                            Se souvenir de moi
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link
                            to="/forgot-password"
                            className="font-semibold text-accent-600 hover:text-accent-700 transition-colors hover:underline"
                        >
                            Mot de passe oublié ?
                        </Link>
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
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion en cours...
                            </>
                        ) : (
                            <span className="flex items-center">
                                Se connecter
                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors hover:underline"
                            >
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
        </AuthLayout>
    )
}

export default Login
