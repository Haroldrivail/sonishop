import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EyeIcon, ArrowLeftIcon } from './../../components/icons/CommonIcons'
import AuthLayout from './../../components/layout/AuthLayout'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!token || !email) {
            navigate('/forgot-password')
        }
    }, [token, email, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.password_confirmation) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères')
            return
        }

        setLoading(true)

        try {
            // Simulation d'un appel API - remplacer par la vraie logique
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                })
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la réinitialisation du mot de passe')
            }

            // Rediriger vers la page de connexion avec un message de succès
            navigate('/login', {
                state: {
                    message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
                }
            })
        } catch (error) {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (!token || !email) {
        return null
    }

    return (
        <AuthLayout
            title="Réinitialiser votre mot de passe"
            subtitle="Entrez votre nouveau mot de passe ci-dessous"
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
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nouveau mot de passe
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
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200 pr-10"
                                placeholder="Entrez votre nouveau mot de passe"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <EyeIcon isVisible={showPassword} className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Le mot de passe doit contenir au moins 8 caractères.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirmer le nouveau mot de passe
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
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200 pr-10"
                                placeholder="Confirmez votre nouveau mot de passe"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <EyeIcon isVisible={showConfirmPassword} className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-soni-navy to-blue-700 hover:from-soni-navy/90 hover:to-blue-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soni-navy/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Réinitialisation...
                            </div>
                        ) : (
                            'Réinitialiser le mot de passe'
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center font-medium text-soni-navy hover:text-soni-orange transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Retour à la connexion
                    </Link>
                </div>
            </form>
        </AuthLayout>
    )
}

export default ResetPassword
