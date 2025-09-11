import React from 'react'
import {
    DocumentTextIcon,
    ShoppingBagIcon,
    UserIcon,
    ClipboardListIcon,
    BellIcon,
    ChartBarIcon,
    CogIcon,
    MagnifyingGlassIcon
} from '../icons'

const EmptyState = ({ 
    type = 'default',
    title,
    description,
    actionLabel,
    onAction,
    icon: CustomIcon,
    illustration = true
}) => {
    const getDefaultConfig = () => {
        const configs = {
            products: {
                icon: ShoppingBagIcon,
                title: 'Aucun produit trouvé',
                description: 'Commencez par ajouter votre premier produit à votre boutique.',
                actionLabel: 'Ajouter un produit',
                color: 'text-orange-500',
                bgColor: 'bg-orange-100'
            },
            orders: {
                icon: ClipboardListIcon,
                title: 'Aucune commande',
                description: 'Les commandes de vos clients apparaîtront ici une fois qu\'ils effectueront des achats.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-100'
            },
            customers: {
                icon: UserIcon,
                title: 'Aucun client',
                description: 'Vos clients apparaîtront ici lorsqu\'ils s\'inscriront sur votre boutique.',
                color: 'text-purple-500',
                bgColor: 'bg-purple-100'
            },
            notifications: {
                icon: BellIcon,
                title: 'Boîte de réception vide',
                description: 'Toutes vos notifications importantes apparaîtront ici.',
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-100'
            },
            analytics: {
                icon: ChartBarIcon,
                title: 'Données en cours de collecte',
                description: 'Les données analytiques apparaîtront une fois que votre boutique aura de l\'activité.',
                color: 'text-green-500',
                bgColor: 'bg-green-100'
            },
            reports: {
                icon: DocumentTextIcon,
                title: 'Aucun rapport disponible',
                description: 'Les rapports seront générés automatiquement dès que vous aurez des données.',
                color: 'text-indigo-500',
                bgColor: 'bg-indigo-100'
            },
            settings: {
                icon: CogIcon,
                title: 'Configuration nécessaire',
                description: 'Configurez votre boutique pour commencer à vendre.',
                color: 'text-gray-500',
                bgColor: 'bg-gray-100'
            },
            search: {
                icon: MagnifyingGlassIcon,
                title: 'Aucun résultat',
                description: 'Aucun élément ne correspond à votre recherche. Essayez d\'autres mots-clés.',
                color: 'text-gray-500',
                bgColor: 'bg-gray-100'
            },
            default: {
                icon: DocumentTextIcon,
                title: 'Aucune donnée',
                description: 'Il n\'y a pas encore de contenu à afficher ici.',
                color: 'text-gray-500',
                bgColor: 'bg-gray-100'
            }
        }
        return configs[type] || configs.default
    }

    const config = getDefaultConfig()
    const Icon = CustomIcon || config.icon
    const finalTitle = title || config.title
    const finalDescription = description || config.description
    const finalActionLabel = actionLabel || config.actionLabel

    return (
        <div className="text-center py-12 px-6">
            {illustration && (
                <div className={`w-20 h-20 ${config.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                    <Icon className={`h-10 w-10 ${config.color}`} />
                </div>
            )}
            
            <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {finalTitle}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {finalDescription}
                </p>
                
                {finalActionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-soni-orange to-accent-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        {finalActionLabel}
                    </button>
                )}
                
                {!onAction && finalActionLabel && (
                    <div className="text-xs text-gray-400 mt-4">
                        💡 Astuce : {finalActionLabel}
                    </div>
                )}
            </div>
        </div>
    )
}

// Composant spécialisé pour les états de chargement
export const LoadingState = ({ message = "Chargement en cours..." }) => (
    <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-8 h-8 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soni-orange"></div>
        </div>
        <p className="text-gray-500 text-sm">{message}</p>
    </div>
)

// Composant spécialisé pour les erreurs
export const ErrorState = ({ 
    title = "Une erreur s'est produite",
    message = "Impossible de charger les données. Veuillez réessayer.",
    onRetry,
    retryLabel = "Réessayer"
}) => (
    <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                    {retryLabel}
                </button>
            )}
        </div>
    </div>
)

export default EmptyState
