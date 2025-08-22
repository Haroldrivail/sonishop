import React, { useEffect } from 'react'
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/solid'

export default function ModalCheckout({
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
  authInfo,
  updateAuthInfo,
  handleAuth,
  isProcessing,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  formErrors = {},
  error,
  clearError,
}) {
  useEffect(() => {
    if (!showAuthModal) {
      clearError && clearError()
    }
  }, [showAuthModal, clearError])

  if (!showAuthModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Fermer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-6 text-center text-soni-navy">
          {authMode === 'login' ? 'Se connecter' : 'Créer un compte'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {authMode === 'register' && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-soni-navy mb-2"
              >
                Nom complet *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={authInfo.name || ''}
                onChange={(e) => updateAuthInfo('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Votre nom complet"
                required
              />
              {formErrors.name && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {formErrors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-soni-navy mb-2"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={authInfo.email || ''}
              onChange={(e) => updateAuthInfo('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="exemple@email.com"
              required
            />
            {formErrors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-soni-navy mb-2"
            >
              Numéro de téléphone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={authInfo.phone || ''}
              onChange={(e) => updateAuthInfo('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm ${
                formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Votre numéro de téléphone"
              required
            />
            {formErrors.phone && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {formErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-soni-navy mb-2"
            >
              Adresse de livraison *
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={authInfo.address || ''}
              onChange={(e) => updateAuthInfo('address', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm resize-none ${
                formErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Votre adresse complète"
              required
            />
            {formErrors.address && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {formErrors.address}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-soni-navy mb-2"
            >
              Mot de passe {authMode === 'register' ? '*' : '(laisser vide pour ne pas changer)'}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={authInfo.password || ''}
                onChange={(e) => updateAuthInfo('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm ${
                  formErrors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}
                placeholder={authMode === 'register' ? "••••••••" : "(optionnel)"}
                {...(authMode === 'register' ? { required: true } : {})}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-soni-navy/80 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-soni-navy cursor-pointer" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-soni-navy cursor-pointer" />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {formErrors.password}
              </p>
            )}
          </div>

          {authMode === 'register' && (
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-semibold text-soni-navy mb-2"
              >
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={authInfo.password_confirmation || ''}
                  onChange={(e) => updateAuthInfo('password_confirmation', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm ${
                    formErrors.password_confirmation
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-soni-navy/80 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-soni-navy cursor-pointer" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-soni-navy cursor-pointer" />
                  )}
                </button>
              </div>
              {formErrors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {formErrors.password_confirmation}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isProcessing
              ? 'Traitement en cours...'
              : authMode === 'login'
              ? 'Se connecter'
              : 'Créer mon compte'}
          </button>

          <p className="text-center mt-4 text-sm text-soni-navy">
            {authMode === 'login'
              ? "Pas encore de compte ? "
              : "Déjà un compte ? "}
            <button
              type="button"
              className="text-accent-600 hover:text-accent-700 font-semibold"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                clearError && clearError()
              }}
            >
              {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
