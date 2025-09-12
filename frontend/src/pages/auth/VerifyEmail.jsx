import { useState, useEffect } from 'react'
import { useEmailVerificationPoll } from '../../hooks/useEmailVerificationPoll'
import { useSearchParams, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, EnvelopeIcon } from './../../components/icons/CommonIcons'
import AuthLayout from './../../components/layout/AuthLayout'
import { apiClient } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

function VerifyEmail() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  
  // Récupérer l'email depuis l'état de navigation
  const email = location.state?.email || searchParams.get('email') || ''
  
  // Debug pour vérifier l'email disponible
  console.log('Email disponible:', email)
  console.log('Location state:', location.state)
  console.log('Search params email:', searchParams.get('email'))
  
  // Détecter si on arrive depuis l'inscription ou depuis la connexion
  const fromRegistration = searchParams.get('registered') === '1'
  const fromLogin = location.state?.fromLogin || false
  const loginMessage = location.state?.message

  // Initialiser le statut si on arrive depuis l'inscription ou la connexion
  useEffect(() => {
    if (fromRegistration && email) {
      setStatus('email-sent-from-registration')
      
      // Nettoyer l'URL après 1 seconde pour éviter que le message persiste au rafraîchissement
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('registered')
        setSearchParams(newSearchParams, { replace: true })
      }, 1000)
    } else if (fromLogin && loginMessage) {
      setStatus('verification-required-from-login')
    }
  }, [fromRegistration, fromLogin, loginMessage, email, searchParams, setSearchParams])

  // Poll pour détecter vérification quand l'utilisateur clique sur le lien email
  useEmailVerificationPoll(!!email && isAuthenticated && !user?.email_verified_at, {
    interval: 4000,
    onVerified: () => {
      setStatus('verified')
      refreshUser()
      setTimeout(() => navigate('/', { replace: true }), 1200)
    }
  })

  // Protection supplémentaire côté client
  if (!authLoading && isAuthenticated && user?.email_verified_at) {
    // Rediriger les utilisateurs déjà vérifiés
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  const handleResendEmail = async (e) => {
    e.preventDefault()
    
    if (!email) {
      console.error('Aucun email disponible pour renvoyer la vérification')
      setStatus('error')
      return
    }

    console.log('Tentative de renvoi d\'email pour:', email)
    setLoading(true)
    
    try {
      const response = await apiClient.post('/auth/email/verification-notification', { email })
      console.log('Réponse API:', response.data)
      setStatus('verification-link-sent')
    } catch (error) {
      console.error('Erreur lors du renvoi d\'email:', error.response?.data || error.message)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Vérification email"
      subtitle="Veuillez vérifier votre adresse email en cliquant sur le lien que nous venons de vous envoyer."
    >
      {status === 'email-sent-from-registration' && (
        <div className="mb-6 text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Compte créé avec succès !
          </div>
          <p>Un email de vérification a été envoyé à votre adresse email.</p>
        </div>
      )}

      {status === 'verification-required-from-login' && (
        <div className="mb-6 text-center text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Vérification email requise
          </div>
          <p>{loginMessage || 'Votre email doit être vérifié avant de pouvoir accéder à votre compte.'}</p>
        </div>
      )}

      {status === 'verification-link-sent' && (
        <div className="mb-6 text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
          Un nouveau lien de vérification a été envoyé à votre adresse email.
        </div>
      )}

      {status === 'verified' && (
        <div className="mb-6 text-center text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
          Email vérifié ! Redirection...
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 text-center text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          Erreur lors de l'envoi. Veuillez réessayer.
        </div>
      )}

      <div className="text-center py-8">        
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Vérifiez votre email
        </h3>
        
        {email && (
          <p className="text-gray-600 mb-6">
            Email envoyé à : <span className="font-medium text-soni-navy">{email}</span>
          </p>
        )}

        {!email && (
          <div className="mb-6 text-center text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p>Aucune adresse email disponible pour renvoyer la vérification.</p>
            <p className="mt-2">Veuillez vous reconnecter pour obtenir l'adresse email.</p>
          </div>
        )}

        <form onSubmit={handleResendEmail} className="space-y-6 text-center">
          <button
            type="submit"
            disabled={loading || !email}
            className="group w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] hover:cursor-pointer mb-2"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Renvoyer l'email de vérification
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {fromLogin && (
            <div>
              <a
                href="/login"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Se connecter avec un autre compte
              </a>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
