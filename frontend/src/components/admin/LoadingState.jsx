import React from 'react'
import { ArrowPathIcon } from '../icons'

const LoadingState = ({ message = 'Chargement...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 mb-4 bg-blue-700 rounded-full flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600">Veuillez patienter...</p>
    </div>
  )
}

export default LoadingState
