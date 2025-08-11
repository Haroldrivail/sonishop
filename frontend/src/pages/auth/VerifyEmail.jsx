import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon } from './../../components/icons/CommonIcons'
import AuthLayout from './../../components/layout/AuthLayout'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else {
      setStatus('error')
      setError('Lien de vérification invalide')
      setLoading(false)
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      // Simulation d'un appel API - remplacer par la vraie logique
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification de l\'email')
      }

      setStatus('success')
      
      // Rediriger automatiquement vers la connexion après 3 secondes
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' 
          }
        })
      }, 3000)
    } catch (error) {
      setStatus('error')
      setError('Impossible de vérifier votre email. Le lien a peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) return

    setResendLoading(true)
    setResendSuccess(false)

    try {
      // Simulation d'un appel API - remplacer par la vraie logique
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi')
      }

      setResendSuccess(true)
    } catch (error) {
      setError('Impossible de renvoyer l\'email de vérification')
    } finally {
      setResendLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-soni-orange/10 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-soni-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600">Vérification de votre email en cours...</p>
        </div>
      )
    }

    if (status === 'success') {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Email vérifié avec succès !</h3>
          <p className="text-gray-600 mb-6">
            Votre adresse email a été confirmée. Vous allez être redirigé vers la page de connexion.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              Redirection automatique dans quelques secondes...
            </p>
          </div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Échec de la vérification</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          
          {resendSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700">
                Email de vérification renvoyé avec succès ! Vérifiez votre boîte de réception.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Vous pouvez demander un nouvel email de vérification :
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || !email}
                className="inline-flex items-center px-4 py-2 border border-soni-orange text-sm font-medium rounded-lg text-soni-orange bg-white hover:bg-soni-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soni-orange disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {resendLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  'Renvoyer l\'email de vérification'
                )}
              </button>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <AuthLayout 
      title="Vérification de votre email"
      subtitle="Confirmation de votre adresse email"
    >
      {renderContent()}

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center font-medium text-soni-navy hover:text-soni-orange transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
