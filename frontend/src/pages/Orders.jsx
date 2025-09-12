import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import {
  ShoppingCartIcon,
  TruckIcon,
  CheckIcon,
  ClockIcon,
  XIcon,
  EyeIcon,
  TrashIcon,
  ArrowPathIcon
} from '../components/icons'

const Orders = () => {
  const { user } = useAuth()
  const { error: toastError, info: toastInfo } = useToast()
  // Référence stable pour éviter que les fonctions toast recréent fetchOrders à chaque rendu
  const toastFnsRef = useRef({ toastError, toastInfo })
  useEffect(() => {
    toastFnsRef.current = { toastError, toastInfo }
  }, [toastError, toastInfo])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()

  // Suppression des données mock: on utilise uniquement l'API + éventuellement localStorage

  const normalizeApiOrder = (o) => {
    if (!o) return null
    return {
      id: o.id || o.number || o.order_number || `ORD-${o.created_at || Date.now()}`,
      date: o.created_at || o.date || new Date().toISOString(),
      status: (o.status || 'pending').toLowerCase(),
      total: Number(o.total || o.grand_total || o.amount || 0),
      items: Array.isArray(o.items) ? o.items.map(it => ({
        id: it.product_id || it.id,
        name: it.name || it.product_name || 'Produit',
        price: Number(it.price || it.unit_price || 0),
        quantity: it.quantity || it.qty || 1,
        image: it.image_url || it.image || it.thumbnail || '/placeholder-product.png'
      })) : [],
      shipping: o.shipping_info ? {
        address: [o.shipping_info.quartier || o.shipping_info.address, o.shipping_info.city, o.shipping_info.country].filter(Boolean).join(', '),
        method: o.shipping_info.delivery_option || o.shipping_info.method || 'Standard',
        trackingNumber: o.shipping_info.tracking_number || null
      } : null,
      deliveredDate: o.delivered_at || null,
      estimatedDelivery: o.estimated_delivery || null,
      cancelReason: o.cancel_reason || null
    }
  }

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setFetching(true)
    setApiError(null)
    try {
      const res = await api.orders.getAll()
      // Support pagination style Laravel { data: [] }
      const raw = res.data?.data || res.data || []
      const apiOrders = (Array.isArray(raw) ? raw : raw.data || [])
        .map(normalizeApiOrder)
        .filter(Boolean)
      // Local fallback orders (guest/local stored) + mocks for now
      const localOrders = JSON.parse(localStorage.getItem('sonishop_orders') || '[]')
      const normalizedLocal = localOrders.map(normalizeApiOrder).filter(Boolean)
      const combined = [...apiOrders, ...normalizedLocal.filter(lo => !lo.localOnly || !apiOrders.some(a => a.id === lo.id))]
      // Déduplication par id (on préfère la version API si conflit)
      const map = new Map()
      for (const o of combined) {
        if (!o || !o.id) continue
        if (!map.has(o.id)) {
          map.set(o.id, o)
        } else {
          const existing = map.get(o.id)
          const existingScore = (existing.items?.length || 0) + (existing.shipping ? 1 : 0)
          const candidateScore = (o.items?.length || 0) + (o.shipping ? 1 : 0)
          if (candidateScore > existingScore) map.set(o.id, o)
        }
      }
      const deduped = Array.from(map.values())
      if (deduped.length === 0) {
        toastFnsRef.current.toastInfo('Aucune commande trouvée')
      }
      // Tri par date
      const sorted = deduped.sort((a, b) => new Date(b.date) - new Date(a.date))
      setOrders(sorted)
    } catch (err) {
      console.warn('Échec chargement commandes API, fallback local seulement', err)
      setApiError(err.response?.data?.message || 'Erreur de chargement des commandes')
      // Fallback: utiliser uniquement localStorage
      const localOrders = JSON.parse(localStorage.getItem('sonishop_orders') || '[]')
      const normalizedLocal = localOrders.map(normalizeApiOrder).filter(Boolean)
      const sorted = normalizedLocal.sort((a, b) => new Date(b.date) - new Date(a.date))
      setOrders(sorted)
      if (normalizedLocal.length) {
        toastFnsRef.current.toastError('Affichage des commandes locales (API indisponible)')
      } else {
        toastFnsRef.current.toastError('Aucune commande disponible (API indisponible)')
      }
    } finally {
      setLoading(false)
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon
      },
      processing: {
        label: 'En traitement',
        color: 'bg-blue-100 text-blue-800',
        icon: ArrowPathIcon
      },
      shipped: {
        label: 'Expédiée',
        color: 'bg-purple-100 text-purple-800',
        icon: TruckIcon
      },
      delivered: {
        label: 'Livrée',
        color: 'bg-green-100 text-green-800',
        icon: CheckIcon
      },
      cancelled: {
        label: 'Annulée',
        color: 'bg-red-100 text-red-800',
        icon: XIcon
      }
    }
    return configs[status] || configs.pending
  }

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus)

  const handleViewDetails = (order) => {
    if (!order) return
    try {
      // Stocker la commande sélectionnée pour l'écran de tracking
      sessionStorage.setItem('sonishop_current_order', JSON.stringify(order))
    } catch (e) {
      // fallback silencieux
    }
    navigate('/order-tracking', { state: { orderId: order.id, order } })
  }

  const statusOptions = [
    { value: 'all', label: 'Toutes les commandes' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En traitement' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' },
    { value: 'cancelled', label: 'Annulées' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCartIcon className="h-8 w-8 text-[#1a237e] mr-3" />
                Mes Commandes
              </h1>
              <p className="text-gray-600 mt-2">
                {orders.length} {orders.length === 1 ? 'commande' : 'commandes'} au total
              </p>
            </div>
          </div>

          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
              {apiError}
            </div>
          )}

          {/* Filtres par statut */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${selectedStatus === option.value
                  ? 'bg-[#1a237e] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        {filteredOrders.length === 0 ? (
          // État vide
          <div className="text-center py-16">
            <ShoppingCartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedStatus === 'all' ? 'Aucune commande' : `Aucune commande ${statusOptions.find(opt => opt.value === selectedStatus)?.label.toLowerCase()}`}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {selectedStatus === 'all'
                ? "Vous n'avez pas encore passé de commande. Explorez notre catalogue pour commencer vos achats."
                : "Aucune commande ne correspond à ce statut pour le moment."
              }
            </p>
            {selectedStatus === 'all' && (
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-[#1a237e] text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
              >
                Découvrir nos produits
              </Link>
            )}
          </div>
        ) : (
          // Liste des commandes
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* En-tête de la commande */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span>Commande {order.id}</span>
                            {order.estimatedDelivery && order.status !== 'delivered' && (
                              <span className="text-xs font-normal bg-blue-50 text-blue-700 px-2 py-0.5 rounded">ETA: {formatDate(order.estimatedDelivery)}</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Passée le {formatDate(order.date)}
                          </p>
                        </div>

                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-[#1a237e]">
                          {formatPrice(order.total)}
                        </p>
                        {order.status === 'delivered' && order.deliveredDate && (
                          <p className="text-sm text-green-600">
                            Livrée le {formatDate(order.deliveredDate)}
                          </p>
                        )}
                        {order.status === 'shipped' && order.estimatedDelivery && (
                          <p className="text-sm text-purple-600">
                            Livraison prévue le {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Articles de la commande */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantité: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Informations de livraison */}
                    {order.shipping && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Informations de livraison</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Adresse:</span> {order.shipping.address}</p>
                          <p><span className="font-medium">Méthode:</span> {order.shipping.method}</p>
                          {order.shipping.trackingNumber && (
                            <p><span className="font-medium">Numéro de suivi:</span> {order.shipping.trackingNumber}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Raison d'annulation */}
                    {order.status === 'cancelled' && order.cancelReason && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-1">Commande annulée</h4>
                          <p className="text-sm text-red-600">{order.cancelReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                      {order.status === 'delivered' && (
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Retourner
                        </button>
                      )}

                      <button
                        onClick={() => handleViewDetails(order)}
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Section d'aide */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Besoin d'aide avec vos commandes ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/contact"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Contacter le support</h4>
                <p className="text-sm text-gray-600">
                  Notre équipe est là pour vous aider
                </p>
              </div>
            </Link>

            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Politique de retour</h4>
                <p className="text-sm text-gray-600">
                  30 jours pour retourner vos produits
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
