import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '../icons'

const ErrorState = ({ 
  title = 'Une erreur est survenue', 
  message = 'Impossible de charger les données.', 
  onRetry = null,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-soni-orange text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      )}
    </div>
  )
}

export default ErrorState
