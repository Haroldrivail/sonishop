import React from 'react'
import { 
  ShoppingBagIcon, 
  UserIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  BellIcon,
  CogIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '../icons'

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  onAction = null, 
  actionLabel = null,
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'products': return ShoppingBagIcon
      case 'customers': return UserIcon
      case 'orders': return DocumentTextIcon
      case 'analytics': return ChartBarIcon
      case 'notifications': return BellIcon
      case 'settings': return CogIcon
      case 'search': return MagnifyingGlassIcon
      case 'loading': return ChartBarIcon
      default: return DocumentTextIcon
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case 'products':
        return {
          title: title || 'Aucun produit trouvé',
          description: description || 'Commencez par ajouter des produits à votre catalogue.',
          actionLabel: actionLabel || 'Ajouter un produit'
        }
      case 'customers':
        return {
          title: title || 'Aucun client trouvé',
          description: description || 'Les clients apparaîtront ici une fois qu\'ils se seront inscrits.',
          actionLabel: actionLabel || null
        }
      case 'orders':
        return {
          title: title || 'Aucune commande trouvée',
          description: description || 'Les commandes apparaîtront ici une fois que les clients auront passé des commandes.',
          actionLabel: actionLabel || null
        }
      case 'analytics':
        return {
          title: title || 'Aucune donnée analytique',
          description: description || 'Les données analytiques apparaîtront une fois que vous aurez de l\'activité.',
          actionLabel: actionLabel || null
        }
      case 'notifications':
        return {
          title: title || 'Aucune notification',
          description: description || 'Vous êtes à jour ! Aucune notification en attente.',
          actionLabel: actionLabel || null
        }
      case 'search':
        return {
          title: title || 'Aucun résultat trouvé',
          description: description || 'Essayez de modifier vos critères de recherche.',
          actionLabel: actionLabel || null
        }
      case 'loading':
        return {
          title: title || 'Chargement...',
          description: description || 'Récupération des données en cours.',
          actionLabel: actionLabel || null
        }
      default:
        return {
          title: title || 'Aucun élément trouvé',
          description: description || 'Il n\'y a rien à afficher pour le moment.',
          actionLabel: actionLabel || null
        }
    }
  }

  const Icon = getIcon()
  const content = getDefaultContent()
  
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {content.description}
      </p>
      
      {onAction && content.actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {content.actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
