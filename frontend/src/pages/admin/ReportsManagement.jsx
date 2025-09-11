import React, { useState, useEffect, useCallback } from 'react'
import EmptyState, { LoadingState, ErrorState } from '../../components/admin/EmptyState'
import { api } from '../../api/client'
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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [summary, setSummary] = useState(null)

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

    // Données analytics dynamiques (summary)
    const salesData = summary ? {
        totalRevenue: summary.totals.revenue,
        totalOrders: summary.totals.orders,
        avgOrderValue: Math.round(summary.totals.avg_order_value),
        topProducts: (summary.top_products || []).map(p => ({ name: p.name, revenue: p.revenue, sales: p.qty })),
        dailySales: (summary.days || []).map(d => ({ date: d.date, sales: d.revenue }))
    } : null

    // Suppression des données statiques : commandes / clients seront dynamiques plus tard (endpoints dédiés)

    const productsData = summary ? {
        totalProducts: (summary.categories || []).reduce((acc) => acc + 1, 0),
        activeProducts: (summary.categories || []).reduce((acc) => acc + 1, 0),
        outOfStock: 0,
        lowStock: 0,
        topPerformers: (summary.top_products || []).map(p => ({
            name: p.name,
            sales: p.qty,
            revenue: p.revenue,
            stock: 0 // inconnu dans le summary actuel
        })),
        categories: (summary.categories || []).map(c => ({ name: c.name, sales: c.share, revenue: c.revenue, qty: c.qty }))
    } : {
        totalProducts: 0,
        activeProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        topPerformers: [],
        categories: []
    }

    const inventoryData = {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        stockTurnover: 0,
        warehouseLocations: [],
        stockMovements: []
    } // pas de données backend dédiées pour l'instant

    const translateRange = (r) => {
        switch(r){
            case '7days': return '7d'
            case '30days': return '30d'
            default: return '30d'
        }
    }

    const fetchSummary = useCallback(async () => {
        setLoading(true); setError(null)
        try {
            const backendRange = translateRange(dateRange)
            const { data } = await api.get('/admin/analytics/summary', { params: { range: backendRange } })
            setSummary(data)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [dateRange])

    useEffect(() => { fetchSummary() }, [fetchSummary])

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

    const renderSalesReport = () => {
        if (loading) return <LoadingState message="Chargement des données de vente..." />
        if (error) return <ErrorState title="Erreur de chargement" message="Impossible de charger les données analytiques." onRetry={fetchSummary} />
        if (!salesData) return <EmptyState type="analytics" title="Aucune donnée de vente" description="Les rapports de vente apparaîtront une fois que vous aurez des commandes." />
        const last7 = salesData.dailySales.slice(-7)
        const maxSales = Math.max(...last7.map(d => d.sales || 0), 1)
        return (
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
                                    <span className="text-sm text-gray-500 ml-1">Période sélectionnée</span>
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
                        {last7.map((day, index) => {
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
                    <div className="space-y-6">
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
    }

    const renderOrdersReport = () => {
        if (loading) return <LoadingState message="Chargement des données de commandes..." />
        if (error) return <ErrorState title="Erreur de chargement" onRetry={fetchSummary} />
        if (!summary) return <EmptyState type="orders" title="Aucune donnée de commande" description="Les rapports de commandes apparaîtront une fois que vous aurez des ventes." />
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                                <p className="text-xl font-bold text-gray-900">{summary.totals.orders}</p>
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
                                <p className="text-xl font-bold text-orange-600">—</p>
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
                                <p className="text-xl font-bold text-green-600">—</p>
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
                                <p className="text-xl font-bold text-gray-900">—</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronologie des Commandes</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {summary.days.slice(-14).map((d,i) => {
                            const data = summary.days.slice(-14)
                            const max = Math.max(...data.map(x => x.orders || 0),1)
                            const height = (d.orders / max) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div className="text-xs text-gray-600 mb-1">{d.orders}</div>
                                    <div className="w-full bg-blue-500/80 rounded-t" style={{height:`${height}%`}} />
                                    <div className="text-[10px] text-gray-500 mt-1">{new Date(d.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})}</div>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">En Attente / Complétées nécessitent un endpoint dédié (statuts).</p>
                </div>
            </div>
        )
    }

    const renderCustomersReport = () => {
        if (loading) return <LoadingState message="Chargement des données clients..." />
        if (error) return <ErrorState title="Erreur de chargement" onRetry={fetchSummary} />
        if (!summary) return <EmptyState type="customers" title="Aucune donnée client" description="Les rapports clients apparaîtront une fois que vous aurez des inscriptions." />
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nouveaux Clients</p>
                                <p className="text-xl font-bold text-gray-900">{summary.totals.customers}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                                <p className="text-xl font-bold text-blue-600">—</p>
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
                                <p className="text-xl font-bold text-gray-900">—</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valeur Vie Client</p>
                                <p className="text-xl font-bold text-gray-900">—</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUpIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Clients</h3>
                    <p className="text-sm text-gray-500">Endpoint dédié non encore implémenté.</p>
                </div>
            </div>
        )
    }

    const renderProductsReport = () => {
        if (loading) return <LoadingState message="Chargement des données produits..." />
        if (error) return <ErrorState title="Erreur de chargement" onRetry={fetchSummary} />
        if (!summary) return <EmptyState type="products" title="Aucune donnée produit" description="Les rapports produits apparaîtront une fois que vous aurez des ventes." />
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Produits (Top listés)</p>
                                <p className="text-xl font-bold text-gray-900">{summary.top_products.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Catégories</p>
                                <p className="text-xl font-bold text-gray-900">{summary.categories.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUpIcon className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Ruptures / Stock Faible</p>
                                <p className="text-xl font-bold text-gray-900">—</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <TrendingDownIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produits</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-600">Chiffre d'Affaires</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.top_products.map((p,i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{p.qty}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900">{formatPrice(p.revenue)}</td>
                                    </tr>
                                ))}
                                {summary.top_products.length === 0 && (
                                    <tr><td colSpan="3" className="py-4 text-center text-sm text-gray-500">Aucun produit</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Catégories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summary.categories.map((c,i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{c.name}</p>
                                    <p className="text-xs text-gray-500">{c.qty} unités</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatPrice(c.revenue)}</p>
                                    <p className="text-xs text-gray-500">{c.share}%</p>
                                </div>
                            </div>
                        ))}
                        {summary.categories.length === 0 && <p className="text-sm text-gray-500">Aucune catégorie</p>}
                    </div>
                </div>
            </div>
        )
    }

    const renderInventoryReport = () => (
        <div className="space-y-6">
            <EmptyState 
                type="reports"
                title="Rapport d'inventaire"
                description="Les fonctionnalités d'inventaire seront bientôt disponibles. Consultez les autres rapports en attendant."
            />
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
