import React, { useState } from 'react'
import { api } from '../../api/client'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../../components/icons/CommonIcons'

import AuthLayout from '../../components/layout/AuthLayout'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await api.auth.forgotPassword(email)
            
            // La réponse de l'API contient un champ 'message'
            if (response.data && response.data.message) {
                setMessage('Un email de réinitialisation a été envoyé à votre adresse email.')
            } else if (response.data && response.data.error) {
                setError(response.data.error)
            } else {
                setMessage('Un email de réinitialisation a été envoyé à votre adresse email.')
            }
        } catch (error) {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Mot de passe oublié"
            subtitle="Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe"
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

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
                    <div className="flex">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {message}
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white focus:border-soni-orange focus:outline-none focus:ring-2 focus:ring-soni-orange/20 transition-colors duration-200"
                        placeholder="Entrez votre adresse email"
                    />
                </div>

                <div>
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
                                Envoi en cours...
                            </>
                        ) : (
                            <span className="flex items-center">
                                Envoyer le lien de réinitialisation
                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </div>

                <div className="text-center space-y-3">
                    <Link
                        to="/login"
                        className="inline-flex items-center font-medium text-soni-navy hover:text-soni-orange transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Retour à la connexion
                    </Link>
                    <p className="text-sm text-gray-600">
                        Pas encore de compte ?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-soni-navy hover:text-soni-orange transition-colors duration-200"
                        >
                            Inscrivez-vous
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    )
}

export default ForgotPassword
