import React, { useState } from 'react'
import {
    DocumentTextIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UserIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    EyeIcon,
    PrinterIcon,
    ShareIcon,
    TrendingUpIcon,
    TrendingDownIcon
} from '../../components/icons'

const ReportsManagement = () => {
    const [selectedReport, setSelectedReport] = useState('sales')
    const [dateRange, setDateRange] = useState('30days')
    const [reportFormat, setReportFormat] = useState('pdf')

    const reportTypes = [
        { id: 'sales', name: 'Ventes', icon: CurrencyDollarIcon, color: 'green' },
        { id: 'orders', name: 'Commandes', icon: ShoppingBagIcon, color: 'blue' },
        { id: 'customers', name: 'Clients', icon: UserIcon, color: 'purple' },
        { id: 'products', name: 'Produits', icon: ChartBarIcon, color: 'orange' },
        { id: 'inventory', name: 'Inventaire', icon: DocumentTextIcon, color: 'indigo' }
    ]

    const dateRanges = [
        { value: '7days', label: '7 derniers jours' },
        { value: '30days', label: '30 derniers jours' },
        { value: '3months', label: '3 derniers mois' },
        { value: '6months', label: '6 derniers mois' },
        { value: '1year', label: '1 an' },
        { value: 'custom', label: 'Période personnalisée' }
    ]

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    // Données de démonstration pour les rapports
    const salesData = {
        totalRevenue: 12500000,
        revenueChange: 12.5,
        totalOrders: 1247,
        ordersChange: 8.3,
        avgOrderValue: 10024,
        avgOrderChange: 3.8,
        topProducts: [
            { name: 'iPhone 15 Pro Max', revenue: 3825000, sales: 45 },
            { name: 'Samsung Galaxy S24', revenue: 2240000, sales: 32 },
            { name: 'MacBook Air M2', revenue: 2380000, sales: 28 },
            { name: 'AirPods Pro 2', revenue: 1092100, sales: 67 }
        ],
        dailySales: [
            { date: '2025-08-06', sales: 425000 },
            { date: '2025-08-07', sales: 680000 },
            { date: '2025-08-08', sales: 320000 },
            { date: '2025-08-09', sales: 750000 },
            { date: '2025-08-10', sales: 890000 },
            { date: '2025-08-11', sales: 650000 },
            { date: '2025-08-12', sales: 780000 }
        ]
    }

    const ordersData = {
        totalOrders: 1247,
        pendingOrders: 89,
        completedOrders: 1158,
        cancelledOrders: 15,
        avgProcessingTime: '24h',
        recentOrders: [
            { id: 'SN001234', customer: 'Jean Dupont', amount: 850000, status: 'completed', date: '2025-08-12' },
            { id: 'SN001235', customer: 'Marie Claire', amount: 163000, status: 'pending', date: '2025-08-12' },
            { id: 'SN001236', customer: 'Paul Martin', amount: 425000, status: 'processing', date: '2025-08-11' },
            { id: 'SN001237', customer: 'Sophie Legrand', amount: 298000, status: 'completed', date: '2025-08-11' },
            { id: 'SN001238', customer: 'Michel Dubois', amount: 1250000, status: 'pending', date: '2025-08-10' }
        ],
        ordersByStatus: {
            pending: 89,
            processing: 34,
            shipped: 67,
            delivered: 1042,
            cancelled: 15
        }
    }

    const customersData = {
        totalCustomers: 8924,
        newCustomers: 156,
        activeCustomers: 5234,
        customerRetention: 78.5,
        avgLifetimeValue: 245000,
        topCustomers: [
            { name: 'Jean Dupont', orders: 23, totalSpent: 4250000, lastOrder: '2025-08-12' },
            { name: 'Marie Claire', orders: 18, totalSpent: 3890000, lastOrder: '2025-08-10' },
            { name: 'Paul Martin', orders: 15, totalSpent: 2950000, lastOrder: '2025-08-11' },
            { name: 'Sophie Legrand', orders: 12, totalSpent: 2100000, lastOrder: '2025-08-09' }
        ],
        customerSegments: {
            vip: 234,
            regular: 3456,
            new: 2890,
            inactive: 2344
        }
    }

    const productsData = {
        totalProducts: 1564,
        activeProducts: 1489,
        outOfStock: 75,
        lowStock: 123,
        topPerformers: [
            { name: 'iPhone 15 Pro Max', sales: 145, revenue: 38250000, stock: 23 },
            { name: 'Samsung Galaxy S24', sales: 132, revenue: 22400000, stock: 45 },
            { name: 'MacBook Air M2', sales: 98, revenue: 23800000, stock: 12 },
            { name: 'AirPods Pro 2', sales: 267, revenue: 10921000, stock: 89 }
        ],
        categories: [
            { name: 'Smartphones', products: 234, sales: 67.2 },
            { name: 'Ordinateurs', products: 145, sales: 23.1 },
            { name: 'Accessoires', products: 456, sales: 8.9 },
            { name: 'Tablettes', products: 89, sales: 0.8 }
        ]
    }

    const inventoryData = {
        totalItems: 15647,
        totalValue: 234500000,
        lowStockItems: 123,
        outOfStockItems: 75,
        stockTurnover: 4.2,
        warehouseLocations: [
            { name: 'Entrepôt Principal - Douala', items: 8934, value: 156000000 },
            { name: 'Entrepôt Yaoundé', items: 4523, value: 67800000 },
            { name: 'Point de Vente Akwa', items: 1890, value: 8900000 },
            { name: 'Point de Vente Bonanjo', items: 300, value: 1800000 }
        ],
        stockMovements: [
            { date: '2025-08-12', type: 'Entrée', quantity: 45, product: 'iPhone 15 Pro Max' },
            { date: '2025-08-12', type: 'Sortie', quantity: 23, product: 'Samsung Galaxy S24' },
            { date: '2025-08-11', type: 'Entrée', quantity: 67, product: 'AirPods Pro 2' },
            { date: '2025-08-11', type: 'Sortie', quantity: 12, product: 'MacBook Air M2' }
        ]
    }

    const getColorClasses = (color) => {
        const colors = {
            green: { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-600' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'text-purple-600' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' },
            indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: 'text-indigo-600' }
        }
        return colors[color] || colors.blue
    }

    const renderSalesReport = () => (
        <div className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(salesData.totalRevenue)}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm font-medium text-green-600">+{salesData.revenueChange}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                            <p className="text-xl font-bold text-gray-900">{salesData.totalOrders}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUpIcon className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-sm font-medium text-blue-600">+{salesData.ordersChange}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(salesData.avgOrderValue)}</p>
                            <div className="flex items-center mt-2">
                                <TrendingUpIcon className="h-4 w-4 text-purple-500 mr-1" />
                                <span className="text-sm font-medium text-purple-600">+{salesData.avgOrderChange}%</span>
                                <span className="text-sm text-gray-500 ml-1">vs période précédente</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphique des ventes quotidiennes */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Ventes (7 derniers jours)</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                    {salesData.dailySales.map((day, index) => {
                        const maxSales = Math.max(...salesData.dailySales.map(d => d.sales))
                        const height = (day.sales / maxSales) * 100
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-gray-600 mb-2">{formatPrice(day.sales)}</div>
                                <div 
                                    className="w-full bg-gradient-to-t from-soni-orange to-accent-500 rounded-t"
                                    style={{ height: `${height}%` }}
                                ></div>
                                <div className="text-xs text-gray-500 mt-2">
                                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Top produits */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produits par Chiffre d'Affaires</h3>
                <div className="space-y-4">
                    {salesData.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-soni-navy rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-primary text-sm font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.sales} ventes</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(product.revenue)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderOrdersReport = () => (
        <div className="space-y-6">
            {/* KPIs des commandes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                            <p className="text-xl font-bold text-gray-900">{ordersData.totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En Attente</p>
                            <p className="text-xl font-bold text-orange-600">{ordersData.pendingOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Complétées</p>
                            <p className="text-xl font-bold text-green-600">{ordersData.completedOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Temps Traitement</p>
                            <p className="text-xl font-bold text-gray-900">{ordersData.avgProcessingTime}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Commandes récentes */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Commandes Récentes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Commande</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersData.recentOrders.map((order, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">#{order.id}</td>
                                    <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                                    <td className="py-3 px-4 font-medium text-gray-900">{formatPrice(order.amount)}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {order.status === 'completed' ? 'Complétée' :
                                             order.status === 'pending' ? 'En attente' : 'En cours'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {new Date(order.date).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    const renderCustomersReport = () => (
        <div className="space-y-6">
            {/* KPIs clients */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clients</p>
                            <p className="text-xl font-bold text-gray-900">{customersData.totalCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Nouveaux Clients</p>
                            <p className="text-xl font-bold text-green-600">{customersData.newCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                            <p className="text-xl font-bold text-blue-600">{customersData.activeCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rétention</p>
                            <p className="text-xl font-bold text-gray-900">{customersData.customerRetention}%</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top clients */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients</h3>
                <div className="space-y-4">
                    {customersData.topCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-purple-600 font-bold">{customer.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                    <p className="text-sm text-gray-500">{customer.orders} commandes</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(customer.totalSpent)}</p>
                                <p className="text-sm text-gray-500">Dernière commande: {new Date(customer.lastOrder).toLocaleDateString('fr-FR')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderProductsReport = () => (
        <div className="space-y-6">
            {/* KPIs produits */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Produits</p>
                            <p className="text-xl font-bold text-gray-900">{productsData.totalProducts}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Produits Actifs</p>
                            <p className="text-xl font-bold text-green-600">{productsData.activeProducts}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rupture Stock</p>
                            <p className="text-xl font-bold text-red-600">{productsData.outOfStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingDownIcon className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                            <p className="text-xl font-bold text-orange-600">{productsData.lowStock}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top produits */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les Plus Vendus</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Ventes</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Chiffre d'Affaires</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsData.topPerformers.map((product, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{product.sales}</td>
                                    <td className="py-3 px-4 font-medium text-gray-900">{formatPrice(product.revenue)}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            product.stock > 50 ? 'bg-green-100 text-green-800' :
                                            product.stock > 20 ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {product.stock} unités
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    const renderInventoryReport = () => (
        <div className="space-y-6">
            {/* KPIs inventaire */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Articles Total</p>
                            <p className="text-xl font-bold text-gray-900">{inventoryData.totalItems}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(inventoryData.totalValue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                            <p className="text-xl font-bold text-orange-600">{inventoryData.lowStockItems}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingDownIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rotation Stock</p>
                            <p className="text-xl font-bold text-gray-900">{inventoryData.stockTurnover}x</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Entrepôts */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Entrepôt</h3>
                <div className="space-y-4">
                    {inventoryData.warehouseLocations.map((warehouse, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{warehouse.name}</p>
                                <p className="text-sm text-gray-500">{warehouse.items} articles</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(warehouse.value)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mouvements récents */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mouvements de Stock Récents</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.stockMovements.map((movement, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-600">
                                        {new Date(movement.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            movement.type === 'Entrée' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {movement.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-900">{movement.product}</td>
                                    <td className="py-3 px-4 text-gray-600">{movement.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    const renderReportContent = () => {
        switch (selectedReport) {
            case 'sales':
                return renderSalesReport()
            case 'orders':
                return renderOrdersReport()
            case 'customers':
                return renderCustomersReport()
            case 'products':
                return renderProductsReport()
            case 'inventory':
                return renderInventoryReport()
            default:
                return renderSalesReport()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                            <DocumentTextIcon className="h-5 w-5 text-white" />
                        </div>
                        Rapports & Analyses
                    </h1>
                    <p className="text-gray-600 mt-1">Tableau de bord analytique SoniShop</p>
                </div>
                <div className="flex space-x-2">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Aperçu
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <PrinterIcon className="h-4 w-4 mr-2" />
                        Imprimer
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Types de rapports */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Types de Rapports</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {reportTypes.map((type) => {
                        const Icon = type.icon
                        const colors = getColorClasses(type.color)
                        const isSelected = selectedReport === type.id
                        
                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedReport(type.id)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                    isSelected 
                                        ? `border-${type.color}-500 ${colors.bg} ring-2 ring-${type.color}-200` 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`w-8 h-8 ${isSelected ? colors.bg : 'bg-gray-100'} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className={`h-5 w-5 ${isSelected ? colors.icon : 'text-gray-600'}`} />
                                </div>
                                <p className={`text-sm font-medium ${isSelected ? colors.text : 'text-gray-900'}`}>
                                    {type.name}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres du Rapport</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CalendarIcon className="h-4 w-4 inline mr-1" />
                            Période
                        </label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {dateRanges.map(range => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                            Format d'Export
                        </label>
                        <select
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Filtres Avancés
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu du rapport */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6">
                    {renderReportContent()}
                </div>
            </div>
        </div>
    )
}

export default ReportsManagement
