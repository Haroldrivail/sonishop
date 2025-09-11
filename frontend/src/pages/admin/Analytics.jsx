import React, { useState, useEffect } from 'react'
import EmptyState, { LoadingState, ErrorState } from '../../components/admin/EmptyState'
import { apiClient } from '../../api/client'
import ENDPOINTS from '../../api/endpoints'
import {
    ChartBarIcon,
    TrendingUpIcon,
    CalendarIcon,
    DownloadIcon,
    EyeIcon
} from '../../components/icons'

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('30d')
    const [chartType, setChartType] = useState('revenue')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [analytics, setAnalytics] = useState({ days: [], totals: { revenue: 0, orders: 0, customers: 0, avg_order_value: 0 }, top_products: [], categories: [] })

    // Chargement des données dynamiques
    useEffect(() => {
        const controller = new AbortController()
        async function fetchAnalytics() {
            setLoading(true)
            setError(null)
            try {
                const { data } = await apiClient.get(ENDPOINTS.admin.analytics.summary, { params: { range: timeRange } })
                setAnalytics(data)
            } catch (e) {
                if (e.name !== 'AbortError') setError(e.message || 'Erreur de chargement')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
        return () => controller.abort()
    }, [timeRange])

    // Catégories dynamiques (part de revenu)
    const categoryData = (analytics.categories || []).map((c, idx) => ({
        name: c.name,
        value: c.share,
        color: ['#1a237e', '#ff6d00', '#4caf50', '#f44336', '#9c27b0', '#0097a7'][idx % 6]
    }))

    // Suppression des clients statiques : backend ne fournit pas encore ce bloc

    const currentData = analytics.days || []
    const totalRevenue = analytics.totals?.revenue || 0
    const totalOrders = analytics.totals?.orders || 0
    const avgOrderValue = analytics.totals?.avg_order_value || 0

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    // Placeholder pour futurs pourcentages (croissance) si backend ajoute comparaison
    // const formatPercentage = (value) => `${value > 0 ? '+' : ''}${value}%`

    const getMaxValue = (data, key) => {
        return Math.max(...data.map(item => item[key]))
    }

    const SimpleBarChart = ({ data, dataKey, color = '#1a237e' }) => {
        const maxValue = getMaxValue(data, dataKey)

        return (
            <div className="flex items-end space-x-1 h-40">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{
                                height: `${(item[dataKey] / maxValue) * 100}%`,
                                backgroundColor: color,
                                minHeight: '4px'
                            }}
                        />
                        <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-bottom-left">
                            {new Date(item.date).getDate()}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const SimplePieChart = ({ data }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0)
        let currentAngle = 0

        return (
            <div className="flex items-center">
                <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100
                            const circumference = 2 * Math.PI * 30
                            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                            const strokeDashoffset = -currentAngle * circumference / 100
                            currentAngle += percentage

                            return (
                                <circle
                                    key={index}
                                    cx="50"
                                    cy="50"
                                    r="30"
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="8"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                />
                            )
                        })}
                    </svg>
                </div>
                <div className="ml-6 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className="ml-auto text-sm font-medium">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Analytiques & Rapports</h2>
                    <p className="text-gray-600">Analyse détaillée des performances de votre boutique</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soni-orange"
                    >
                        <option value="7d">7 derniers jours</option>
                        <option value="30d">30 derniers jours</option>
                    </select>
                    {loading && <span className="text-sm text-gray-500 self-center">Chargement...</span>}
                    {error && <span className="text-sm text-red-600 self-center">{error}</span>}
                    <div className="flex gap-2">
                        <button onClick={() => window.open(`/api/admin/analytics/export/csv?range=${timeRange}`,'_blank')}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                            CSV
                        </button>
                        <button onClick={() => window.open(`/api/admin/analytics/export/pdf?range=${timeRange}`,'_blank')}
                            className="inline-flex items-center px-3 py-2 bg-soni-navy text-white rounded-md hover:bg-soni-navy/90 text-sm">
                            <DownloadIcon className="mr-1 h-4 w-4" /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Commandes</p>
                            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Panier moyen</p>
                            <p className="text-xl font-bold text-gray-900">{formatPrice(avgOrderValue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Nouveaux clients</p>
                            <p className="text-xl font-bold text-gray-900">{analytics.totals?.customers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Évolution du chiffre d'affaires</h3>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-soni-orange"
                        >
                            <option value="revenue">Chiffre d'affaires</option>
                            <option value="orders">Commandes</option>
                            <option value="customers">Nouveaux clients</option>
                        </select>
                    </div>
                    {currentData.length === 0 && !loading && (
                        <EmptyState 
                            type="analytics"
                            title="Aucune donnée analytique"
                            description="Les données apparaîtront une fois que votre boutique aura de l'activité."
                            illustration={false}
                        />
                    )}
                    {currentData.length > 0 && (
                        <SimpleBarChart
                            data={currentData}
                            dataKey={chartType}
                            color={chartType === 'revenue' ? '#1a237e' : chartType === 'orders' ? '#ff6d00' : '#4caf50'}
                        />
                    )}
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par catégorie</h3>
                    <SimplePieChart data={categoryData} />
                </div>
            </div>

            {/* Top Customers & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Top Produits</h3>
                    </div>
                    <div className="space-y-4">
                        {(analytics.top_products || []).map((p, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-600">{p.qty} unités</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatPrice(p.revenue)}</p>
                                </div>
                            </div>
                        ))}
                        {(!analytics.top_products || analytics.top_products.length === 0) && !loading && (
                            <EmptyState 
                                type="analytics"
                                title="Aucun produit vendu"
                                description="Les statistiques de vente apparaîtront une fois que vous aurez des commandes."
                                illustration={false}
                            />
                        )}
                    </div>
                </div>

                {/* Performance Metrics (dynamiques) */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques de performance</h3>
                    <div className="space-y-6">
                        {(() => {
                            const perf = analytics.performance || {}
                            const items = [
                                {
                                    key: 'customer_satisfaction',
                                    label: 'Satisfaction client',
                                    value: perf.customer_satisfaction,
                                    type: 'percent',
                                    color: 'bg-green-500'
                                },
                                {
                                    key: 'retention_rate',
                                    label: 'Taux de fidélisation',
                                    value: perf.retention_rate,
                                    type: 'percent',
                                    color: 'bg-blue-500'
                                },
                                {
                                    key: 'avg_delivery_time_days',
                                    label: 'Délai moyen livraison (jours)',
                                    value: perf.avg_delivery_time_days,
                                    type: 'number',
                                    color: 'bg-orange-500'
                                },
                                {
                                    key: 'return_rate_percent',
                                    label: 'Taux de retour',
                                    value: perf.return_rate_percent,
                                    type: 'percent',
                                    color: 'bg-red-500'
                                }
                            ]
                            return items.map(item => {
                                const display = (item.value === null || item.value === undefined)
                                    ? '—'
                                    : (item.type === 'percent' ? `${item.value}%` : item.value)
                                const width = (item.value === null || item.value === undefined)
                                    ? 0
                                    : Math.min(100, item.value)
                                return (
                                    <div key={item.key}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">{item.label}</span>
                                            <span className="text-sm font-medium">{display}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${width}%` }} />
                                        </div>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                </div>
            </div>

            {/* Export & Reports */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Rapports et Exports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <DownloadIcon className="w-8 h-8 text-soni-navy mr-3" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Rapport des ventes</p>
                            <p className="text-sm text-gray-600">Export PDF/Excel</p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <ChartBarIcon className="w-8 h-8 text-soni-orange mr-3" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Analyse des clients</p>
                            <p className="text-sm text-gray-600">Rapport détaillé</p>
                        </div>
                    </button>

                    <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <EyeIcon className="w-8 h-8 text-green-600 mr-3" />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">Performance produits</p>
                            <p className="text-sm text-gray-600">Analyse approfondie</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Analytics
