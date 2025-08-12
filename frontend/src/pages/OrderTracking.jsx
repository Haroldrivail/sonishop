import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
    CheckIcon,
    TruckIcon,
    ClockIcon,
    ChevronLeftIcon,
    ShoppingCartIcon
} from '../components/icons/index'
import { useAuth } from '../context/AuthContext'

const OrderTracking = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Récupérer l'ID de commande depuis l'état de navigation ou l'URL
        const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId')
        
        if (!orderId) {
            navigate('/products')
            return
        }

        // Charger les détails de la commande
        const loadOrderDetails = () => {
            try {
                const orders = JSON.parse(localStorage.getItem('sonishop_orders') || '[]')
                const foundOrder = orders.find(o => o.id === orderId)
                
                if (foundOrder) {
                    setOrder(foundOrder)
                } else {
                    // Commande non trouvée
                    navigate('/products')
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la commande:', error)
                navigate('/products')
            } finally {
                setLoading(false)
            }
        }

        loadOrderDetails()
    }, [location, navigate])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const getDeliveryStatus = () => {
        if (!order) return null

        const orderDate = new Date(order.date)
        const now = new Date()
        const diffHours = (now - orderDate) / (1000 * 60 * 60)

        if (order.deliveryMode === 'pickup') {
            return {
                status: 'ready',
                title: 'Prêt pour le retrait',
                message: 'Votre commande est prête. Vous pouvez venir la récupérer en magasin.',
                icon: '🏪',
                color: 'green'
            }
        }

        if (diffHours < 2) {
            return {
                status: 'confirmed',
                title: 'Commande confirmée',
                message: 'Votre commande a été confirmée et est en cours de préparation.',
                icon: '📦',
                color: 'blue'
            }
        } else if (diffHours < 24) {
            return {
                status: 'preparing',
                title: 'En préparation',
                message: 'Votre commande est en cours de préparation dans nos entrepôts.',
                icon: '🔧',
                color: 'orange'
            }
        } else {
            return {
                status: 'shipped',
                title: 'Expédiée',
                message: 'Votre commande a été expédiée et est en route vers vous.',
                icon: '🚚',
                color: 'green'
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soni-navy"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h2>
                    <Link 
                        to="/products" 
                        className="text-soni-navy hover:text-soni-navy/80"
                    >
                        Retour à la boutique
                    </Link>
                </div>
            </div>
        )
    }

    const deliveryStatus = getDeliveryStatus()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                to="/products"
                                className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors mr-6"
                            >
                                <ChevronLeftIcon className="mr-2 w-5 h-5" />
                                Retour à la boutique
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Suivi de commande #{order.id}
                            </h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            Commandé le {new Date(order.date).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statut de livraison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{deliveryStatus.icon}</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {deliveryStatus.title}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {deliveryStatus.message}
                        </p>
                        
                        {order.deliveryMode !== 'pickup' && (
                            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                                <div className="flex items-center justify-center text-blue-700">
                                    <TruckIcon className="w-5 h-5 mr-2" />
                                    <span className="font-medium">
                                        Livraison estimée: {order.estimatedDelivery}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Détails de la commande */}
                    <div className="space-y-6">
                        {/* Informations de livraison */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                📍 Informations de livraison
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">
                                    {order.userInfo.firstName} {order.userInfo.lastName}
                                </p>
                                <p className="text-gray-600">{order.userInfo.address}</p>
                                <p className="text-gray-600">{order.userInfo.city}, {order.userInfo.country}</p>
                                <p className="text-gray-600">📞 {order.userInfo.phone}</p>
                                <p className="text-gray-600">✉️ {order.userInfo.email}</p>
                            </div>
                        </div>

                        {/* Mode de livraison */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                🚚 Mode de livraison
                            </h3>
                            <div className="flex items-center">
                                <div className="text-2xl mr-3">
                                    {order.deliveryMode === 'standard' && '🚛'}
                                    {order.deliveryMode === 'express' && '🚀'}
                                    {order.deliveryMode === 'pickup' && '🏪'}
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {order.deliveryMode === 'standard' && 'Livraison standard'}
                                        {order.deliveryMode === 'express' && 'Livraison express'}
                                        {order.deliveryMode === 'pickup' && 'Retrait en magasin'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {order.shipping === 0 ? 'Gratuit' : formatPrice(order.shipping)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                🛠️ Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/products"
                                    className="flex items-center justify-center w-full py-3 bg-soni-navy text-white rounded-lg hover:bg-soni-navy/90 transition-colors"
                                >
                                    <ShoppingCartIcon className="w-5 h-5 mr-2" />
                                    Continuer mes achats
                                </Link>
                                
                                {isAuthenticated && (
                                    <Link
                                        to="/profile/orders"
                                        className="flex items-center justify-center w-full py-3 border border-soni-navy text-soni-navy rounded-lg hover:bg-soni-navy/5 transition-colors"
                                    >
                                        📋 Mes commandes
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Articles commandés */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            🛍️ Articles commandés ({order.items.length})
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                        {item.salePrice && item.salePrice !== item.price && (
                                            <p className="text-xs text-green-600">Prix promotionnel</p>
                                        )}
                                    </div>
                                    <p className="font-semibold text-soni-navy">
                                        {formatPrice((item.salePrice || item.price) * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex justify-between">
                                <span>Sous-total</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Livraison</span>
                                <span className={order.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                    {order.shipping === 0 ? 'Gratuit ✨' : formatPrice(order.shipping)}
                                </span>
                            </div>
                            <hr className="my-3" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total payé</span>
                                <span className="text-soni-navy">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline de livraison */}
                {order.deliveryMode !== 'pickup' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            📍 Suivi de livraison
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                                    <CheckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium">Commande confirmée</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(order.date).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                                    deliveryStatus.status === 'preparing' || deliveryStatus.status === 'shipped' 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-300'
                                }`}>
                                    <CheckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium">En préparation</p>
                                    <p className="text-sm text-gray-600">
                                        {deliveryStatus.status === 'preparing' || deliveryStatus.status === 'shipped' 
                                            ? 'En cours' 
                                            : 'En attente'
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                                    deliveryStatus.status === 'shipped' 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-300'
                                }`}>
                                    <TruckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium">Expédiée</p>
                                    <p className="text-sm text-gray-600">
                                        {deliveryStatus.status === 'shipped' 
                                            ? 'En cours de livraison' 
                                            : 'En attente'
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                                    <CheckIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium">Livraison</p>
                                    <p className="text-sm text-gray-600">
                                        Estimée pour le {order.estimatedDelivery}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderTracking
