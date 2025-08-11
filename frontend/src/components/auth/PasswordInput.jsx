import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../icons'

function PasswordInput({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder = "Entrez votre mot de passe",
  label = "Mot de passe",
  required = false,
  autoComplete = "current-password",
  error = null,
  className = ""
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${className}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default PasswordInput
