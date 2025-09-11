import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { CheckIcon, XIcon } from '../components/icons'

// Simple ToastContext
// - toasts: array of { id, type, title, description }
// - showToast({ type, title, description, duration }) -> id
// - removeToast(id)

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  useEffect(() => {
    return () => {
      // cleanup timers on unmount
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const showToast = useCallback(({ type = 'info', title = '', description = '', message = '', duration = 4000 } = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const resolvedMessage = message || title || description
    const toast = { id, type, title, description, message: resolvedMessage }
    setToasts(prev => [toast, ...prev])

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  // Helper shortcuts for consistency with older components
  const success = (message, opts={}) => showToast({ type: 'success', message, ...opts })
  const error = (message, opts={}) => showToast({ type: 'error', message, ...opts })
  const info = (message, opts={}) => showToast({ type: 'info', message, ...opts })
  const warning = (message, opts={}) => showToast({ type: 'warning', message, ...opts })

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="h-5 w-5" />
      case 'error':
        return <XIcon className="h-5 w-5" />
      case 'warning':
        return <span className="h-5 w-5 text-yellow-600">⚠</span>
      default:
        return <span className="h-5 w-5 text-blue-600">ℹ</span>
    }
  }

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-80 p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}
          style={{
            animation: 'slideInFromRight 0.3s ease-out'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getToastIcon(toast.type)}
              <span className="font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export default ToastProvider
