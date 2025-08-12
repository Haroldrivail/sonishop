import React, { useState } from 'react'
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

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')

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

    // Données de démonstration avec prix en FCFA
    const dashboardStats = [
        {
            title: 'Revenus Total',
            value: '12,500,000 FCFA',
            change: '+12.5%',
            trend: 'up',
            icon: CurrencyDollarIcon,
            bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Commandes',
            value: '1,247',
            change: '+8.3%',
            trend: 'up',
            icon: ClipboardListIcon,
            bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Clients',
            value: '892',
            change: '+15.2%',
            trend: 'up',
            icon: UserIcon,
            bgColor: 'bg-gradient-to-r from-purple-50 to-violet-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Produits',
            value: '156',
            change: '+4.1%',
            trend: 'up',
            icon: ShoppingBagIcon,
            bgColor: 'bg-gradient-to-r from-orange-50 to-amber-50',
            iconColor: 'text-orange-600'
        }
    ]

    const recentOrders = [
        { id: '#SN001234', customer: 'Jean Dupont', amount: 850000, status: 'completed', date: '2025-08-12' },
        { id: '#SN001235', customer: 'Marie Claire', amount: 163000, status: 'pending', date: '2025-08-12' },
        { id: '#SN001236', customer: 'Paul Martin', amount: 425000, status: 'processing', date: '2025-08-11' },
        { id: '#SN001237', customer: 'Sophie Ngono', amount: 680000, status: 'completed', date: '2025-08-11' },
        { id: '#SN001238', customer: 'Pierre Kamga', amount: 195000, status: 'cancelled', date: '2025-08-10' }
    ]

    const topProducts = [
        { name: 'iPhone 15 Pro Max', sales: 45, revenue: 38250000, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100' },
        { name: 'Samsung Galaxy S24', sales: 32, revenue: 22400000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100' },
        { name: 'MacBook Air M2', sales: 28, revenue: 23800000, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100' },
        { name: 'AirPods Pro 2', sales: 67, revenue: 10921000, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=100' }
    ]

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
                        {/* Statistiques principales avec design moderne */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dashboardStats.map((stat, index) => {
                                const Icon = stat.icon
                                return (
                                    <div key={index} className={`${stat.bgColor} rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 group cursor-pointer`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                                                <div className="flex items-center">
                                                    {stat.trend === 'up' ? (
                                                        <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                                    ) : (
                                                        <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                                                    )}
                                                    <span className={`text-sm font-medium ${
                                                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
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
                            })}
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
                                            className="text-sm text-soni-orange hover:text-soni-orange/80 font-medium"
                                        >
                                            Voir tout
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-soni-navy rounded-lg flex items-center justify-center">
                                                        <span className="text-white text-sm font-bold">
                                                            {order.id.slice(-2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{order.id}</p>
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
                                </div>
                            </div>

                            {/* Produits top */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Produits Top Ventes</h3>
                                        <button 
                                            onClick={() => setActiveTab('products')}
                                            className="text-sm text-soni-orange hover:text-soni-orange/80 font-medium"
                                        >
                                            Voir tout
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <img 
                                                        className="h-12 w-12 rounded-lg object-cover shadow-sm" 
                                                        src={product.image} 
                                                        alt={product.name} 
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
                                </div>
                            </div>
                        </div>

                        {/* Section d'action rapide avec design SoniShop */}
                        <div className="bg-gradient-to-r from-soni-navy via-blue-800 to-soni-navy rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">🚀 Actions Rapides</h3>
                                    <p className="text-blue-100">Gérez votre boutique efficacement avec ces raccourcis</p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-16 h-16 bg-soni-orange rounded-2xl flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">S</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => setActiveTab('analytics')}
                                    className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-2xl mb-2">📊</div>
                                    <div className="font-medium">Voir Analytics</div>
                                    <div className="text-sm text-blue-300">Données détaillées</div>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('products')}
                                    className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-2xl mb-2">➕</div>
                                    <div className="font-medium">Ajouter Produit</div>
                                    <div className="text-sm text-blue-100">Nouveau catalogue</div>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('reports')}
                                    className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left transition-colors group"
                                >
                                    <div className="text-2xl mb-2">📋</div>
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

export default AdminDashboard
