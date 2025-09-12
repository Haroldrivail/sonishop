import React from 'react'
import { useNotification } from '../../context/NotificationContext'
import { CheckIcon, XMarkIcon, ShoppingCartIcon, InformationCircleIcon } from '../icons'

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <XMarkIcon className="w-5 h-5 text-red-400" />
      case 'cart':
        return <ShoppingCartIcon className="w-5 h-5 text-blue-400" />
      case 'info':
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />
    }
  }

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'cart':
        return 'border-blue-200 bg-blue-50'
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            max-w-sm w-full shadow-lg rounded-lg border p-4 
            ${getNotificationStyles(notification.type)}
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              {notification.type === 'cart' && notification.product ? (
                <div className="flex items-center space-x-3">
                  <img
                    src={notification.product.image}
                    alt={notification.product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Produit ajouté au panier
                    </p>
                    <p className="text-xs text-gray-600">
                      {notification.quantity} x {notification.product.name}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeNotification(notification.id)}
                className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-soni-orange h-1 rounded-full animate-[shrink_var(--duration,3000ms)_linear_forwards]"
              style={{ '--duration': `${notification.duration}ms` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
