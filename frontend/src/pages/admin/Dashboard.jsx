import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    HomeIcon,
    ShoppingBagIcon,
    UserIcon,
    ChartBarIcon,
    CogIcon,
    DocumentTextIcon,
    ClipboardListIcon,
    CurrencyDollarIcon,
    TrendingUpIcon,
    TrendingDownIcon
} from '../../components/icons'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import OrdersManagement from './OrdersManagement'
import Analytics from './Analytics'
import ProductsManagement from './ProductsManagement'
import CustomersManagement from './CustomersManagement'
import ReportsManagement from './ReportsManagement'
import SettingsManagement from './SettingsManagement'
import NotificationsPage from './NotificationsPage'
import api from '../../api/client'

const Dashboard = () => {
    const { user, logout, login } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [searchParams, setSearchParams] = useSearchParams()
    
    // États pour les données dynamiques
    const [dashboardStats, setDashboardStats] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Gestion de l'authentification après vérification d'email
    useEffect(() => {
        const token = searchParams.get('token')
        const verified = searchParams.get('verified')
        const alreadyVerified = searchParams.get('already_verified')

        if (token && (verified || alreadyVerified)) {
            // Authentifier l'utilisateur avec le token
            login(token)
            
            // Nettoyer l'URL
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.delete('token')
            newSearchParams.delete('verified')
            newSearchParams.delete('already_verified')
            setSearchParams(newSearchParams, { replace: true })
            
            // Afficher un message de succès
            if (verified) {
                console.log('Email vérifié avec succès! Bienvenue dans votre dashboard admin.')
            } else if (alreadyVerified) {
                console.log('Email déjà vérifié! Bienvenue dans votre dashboard admin.')
            }
        }
    }, [searchParams, login, setSearchParams])

    // Configuration moderne de la sidebar avec charte graphique SoniShop
    const sidebarItems = [
        { id: 'overview', name: 'Vue d\'ensemble', icon: HomeIcon },
        { id: 'analytics', name: 'Analytiques', icon: ChartBarIcon },
        { id: 'orders', name: 'Commandes', icon: ClipboardListIcon },
        { id: 'products', name: 'Produits', icon: ShoppingBagIcon },
        { id: 'customers', name: 'Clients', icon: UserIcon },
        { id: 'reports', name: 'Rapports', icon: DocumentTextIcon },
        { id: 'settings', name: 'Paramètres', icon: CogIcon }
    ]

    // Chargement des données du dashboard
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true)
                setError(null)

                const [statsResponse, productsResponse] = await Promise.allSettled([
                    api.dashboard.getStats(),
                    api.products.getAll({ per_page: 12 })
                ])

                // --- Stats ---
                if (statsResponse.status === 'fulfilled') {
                    const statsPayload = statsResponse.value?.data
                    // Handle standardized APIResponse: { status, data, ... }
                    const stats = statsPayload?.data || statsPayload || {}
                    setDashboardStats([
                        {
                            title: 'Revenus Total',
                            value: stats.totalRevenue ? formatPrice(stats.totalRevenue) : '0 FCFA',
                            change: stats.revenueChange || '0%',
                            trend: stats.revenueChange?.startsWith('+') ? 'up' : 'down',
                            icon: CurrencyDollarIcon,
                            bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
                            iconColor: 'text-green-600'
                        },
                        {
                            title: 'Commandes',
                            value: stats.totalOrders || '0',
                            change: stats.ordersChange || '0%',
                            trend: stats.ordersChange?.startsWith('+') ? 'up' : 'down',
                            icon: ClipboardListIcon,
                            bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                            iconColor: 'text-blue-600'
                        },
                        {
                            title: 'Clients',
                            value: stats.totalCustomers || '0',
                            change: stats.customersChange || '0%',
                            trend: stats.customersChange?.startsWith('+') ? 'up' : 'down',
                            icon: UserIcon,
                            bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
                            iconColor: 'text-purple-600'
                        },
                        {
                            title: 'Produits',
                            value: stats.totalProducts || '0',
                            change: stats.productsChange || '0%',
                            trend: stats.productsChange?.startsWith('+') ? 'up' : 'down',
                            icon: ShoppingBagIcon,
                            bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
                            iconColor: 'text-orange-600'
                        }
                    ])
                    // Recent orders (admin)
                    if (stats.recent_orders) {
                        setRecentOrders(stats.recent_orders.map(o => ({
                            id: o.number || o.id,
                            customer: o.user?.name || 'Client inconnu',
                            amount: o.total || 0,
                            status: o.status || 'pending',
                            date: o.created_at
                        })))
                    }
                } else {
                    // Fallback avec données par défaut
                    setDashboardStats([
                        {
                            title: 'Revenus Total',
                            value: '0 FCFA',
                            change: '0%',
                            trend: 'up',
                            icon: CurrencyDollarIcon,
                            bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
                            iconColor: 'text-green-600'
                        },
                        {
                            title: 'Commandes',
                            value: '0',
                            change: '0%',
                            trend: 'up',
                            icon: ClipboardListIcon,
                            bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                            iconColor: 'text-blue-600'
                        },
                        {
                            title: 'Clients',
                            value: '0',
                            change: '0%',
                            trend: 'up',
                            icon: UserIcon,
                            bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
                            iconColor: 'text-purple-600'
                        },
                        {
                            title: 'Produits',
                            value: '0',
                            change: '0%',
                            trend: 'up',
                            icon: ShoppingBagIcon,
                            bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
                            iconColor: 'text-orange-600'
                        }
                    ])
                }

                // --- Products (top) ---
                if (productsResponse.status === 'fulfilled') {
                    const raw = productsResponse.value?.data
                    // Support envelopes: { status, data: { data: [..] } } OR { status, data: [..] }
                    let productsData = []
                    if (Array.isArray(raw?.data)) {
                        productsData = raw.data
                    } else if (Array.isArray(raw?.data?.data)) { // paginator collection
                        productsData = raw.data.data
                    } else if (Array.isArray(raw)) { // plain array
                        productsData = raw
                    }
                    setTopProducts(productsData.slice(0, 4).map(product => ({
                        name: product.name || 'Produit sans nom',
                        sales: product.sales_count || 0,
                        revenue: product.total_revenue || 0,
                        image: product.image_url || product.images?.[0] || '/placeholder-product.png'
                    })))
                } else {
                    setTopProducts([])
                }

                // --- Recent orders for non-admin (unchanged, ensure safe slice) ---
                if (!recentOrders.length && user && user.role !== 'admin') {
                    try {
                        const userOrdersResp = await api.orders.getAll()
                        const rawOrders = userOrdersResp?.data
                        let ordersData = []
                        if (Array.isArray(rawOrders?.data)) {
                            ordersData = rawOrders.data
                        } else if (Array.isArray(rawOrders?.data?.data)) {
                            ordersData = rawOrders.data.data
                        } else if (Array.isArray(rawOrders)) {
                            ordersData = rawOrders
                        }
                        setRecentOrders(ordersData.slice(0, 5).map(order => ({
                            id: order.number || order.id,
                            customer: user.name,
                            amount: order.total || 0,
                            status: order.status || 'pending',
                            date: order.created_at
                        })))
                    } catch (_) {
                        setRecentOrders([])
                    }
                }

            } catch (err) {
                console.error('Erreur lors du chargement des données:', err)
                setError('Erreur lors du chargement des données du dashboard')
                
                // Données de fallback en cas d'erreur
                setDashboardStats([
                    {
                        title: 'Revenus Total',
                        value: 'Indisponible',
                        change: '0%',
                        trend: 'up',
                        icon: CurrencyDollarIcon,
                        bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
                        iconColor: 'text-gray-600'
                    },
                    {
                        title: 'Commandes',
                        value: 'Indisponible',
                        change: '0%',
                        trend: 'up',
                        icon: ClipboardListIcon,
                        bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
                        iconColor: 'text-gray-600'
                    },
                    {
                        title: 'Clients',
                        value: 'Indisponible',
                        change: '0%',
                        trend: 'up',
                        icon: UserIcon,
                        bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
                        iconColor: 'text-gray-600'
                    },
                    {
                        title: 'Produits',
                        value: 'Indisponible',
                        change: '0%',
                        trend: 'up',
                        icon: ShoppingBagIcon,
                        bgColor: 'bg-gradient-to-r from-gray-50 to-gray-100',
                        iconColor: 'text-gray-600'
                    }
                ])
                setRecentOrders([])
                setTopProducts([])
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [user])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Complétée'
            case 'pending': return 'En attente'
            case 'processing': return 'En cours'
            case 'cancelled': return 'Annulée'
            default: return status
        }
    }

    // Rendu du contenu selon l'onglet actif
    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrdersManagement />
            case 'analytics':
                return <Analytics />
            case 'products':
                return <ProductsManagement />
            case 'customers':
                return <CustomersManagement />
            case 'reports':
                return <ReportsManagement />
            case 'settings':
                return <SettingsManagement />
            case 'notifications':
                return <NotificationsPage />
            default:
                return (
                    <div className="space-y-6">
                        {/* Message d'erreur si présent */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skeleton de chargement ou statistiques principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                // Skeleton loading
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </div>
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Statistiques principales avec design moderne
                                dashboardStats.map((stat, index) => {
                                    const Icon = stat.icon
                                    return (
                                        <div key={index} className={`${stat.bgColor} rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 group cursor-pointer`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                                    <p className="text-xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                                    <div className="flex items-center">
                                                        {stat.trend === 'up' ? (
                                                            <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                                        ) : (
                                                            <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                                                        )}
                                                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            {stat.change}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-1">ce mois</span>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-xl ${stat.iconColor} bg-white/50 duration-200`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Section Commandes récentes et Produits top */}
                        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
                            {/* Commandes récentes */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Commandes Récentes</h3>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="group flex justify-center items-center p-2 border border-transparent text-base font-bold rounded-xl text-white bg-blue-400  hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-soni-navy/30  transition-all duration-200 shadow-lg hover:shadow-xl  hover:cursor-pointer"
                                        >
                                            Voir tout
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {loading ? (
                                        // Skeleton pour commandes
                                        <div className="space-y-4">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                                        <div>
                                                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : recentOrders.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentOrders.map((order, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-soni-navy rounded-lg flex items-center justify-center">
                                                            <span className="text-blue-300 text-sm font-bold">
                                                                {typeof order.id === 'string' ? order.id.slice(-2) : String(order.id).slice(-2)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {typeof order.id === 'string' && order.id.startsWith('#') ? order.id : `#${order.id}`}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{order.customer}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {formatPrice(order.amount)}
                                                        </p>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                            {getStatusText(order.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ClipboardListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Aucune commande récente</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Produits top */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Produits Top Ventes</h3>
                                        <button
                                            onClick={() => setActiveTab('products')}
                                            className="group flex justify-center items-center p-2 border border-transparent text-base font-bold rounded-xl text-white bg-blue-400  hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-soni-navy/30  transition-all duration-200 shadow-lg hover:shadow-xl  hover:cursor-pointer"
                                        >
                                            Voir tout
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {loading ? (
                                        // Skeleton pour produits
                                        <div className="space-y-4">
                                            {Array.from({ length: 4 }).map((_, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                                        <div>
                                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : topProducts.length > 0 ? (
                                        <div className="space-y-4">
                                            {topProducts.map((product, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                                            src={product.image}
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                e.target.src = '/placeholder-product.png'
                                                            }}
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500">{product.sales} ventes</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {formatPrice(product.revenue)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Total</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>Aucun produit en vente</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section d'action rapide avec design SoniShop */}
                        <div className="bg-blue-800 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">🚀 Actions Rapides</h3>
                                    <p className="text-blue-100">Gérez votre boutique efficacement avec ces raccourcis</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className="bg-white/10 cursor-pointer hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-xl mb-2">📊</div>
                                    <div className="font-medium">Voir Analytics</div>
                                    <div className="text-sm text-blue-300">Données détaillées</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className="bg-white/10 cursor-pointer hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-xl mb-2">➕</div>
                                    <div className="font-medium">Ajouter Produit</div>
                                    <div className="text-sm text-blue-100">Nouveau catalogue</div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className="bg-white/10 cursor-pointer hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-xl mb-2">📋</div>
                                    <div className="font-medium">Export Données</div>
                                    <div className="text-sm text-blue-300">Rapports détaillés</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    const handleNotificationClick = () => {
        setActiveTab('notifications')
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarItems={sidebarItems}
            pageTitle="Dashboard SoniShop - Administration"
            onNotificationClick={handleNotificationClick}
        >
            {renderContent()}
        </DashboardLayout>
    )
}

export default Dashboard
