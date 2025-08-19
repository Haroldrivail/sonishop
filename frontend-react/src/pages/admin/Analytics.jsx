import React, { useState } from 'react'
import {
    ChartBarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CalendarIcon,
    DownloadIcon,
    EyeIcon
} from '../../components/icons'

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('30d')
    const [chartType, setChartType] = useState('revenue')

    // Données simulées pour les graphiques
    const salesData = {
        '7d': [
            { date: '2025-08-06', revenue: 450000, orders: 12, customers: 8 },
            { date: '2025-08-07', revenue: 620000, orders: 18, customers: 15 },
            { date: '2025-08-08', revenue: 380000, orders: 9, customers: 7 },
            { date: '2025-08-09', revenue: 750000, orders: 22, customers: 19 },
            { date: '2025-08-10', revenue: 520000, orders: 15, customers: 12 },
            { date: '2025-08-11', revenue: 890000, orders: 28, customers: 24 },
            { date: '2025-08-12', revenue: 1150000, orders: 35, customers: 31 }
        ],
        '30d': Array.from({ length: 30 }, (_, i) => ({
            date: new Date(2025, 7, i + 1).toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 800000) + 200000,
            orders: Math.floor(Math.random() * 40) + 5,
            customers: Math.floor(Math.random() * 35) + 3
        }))
    }

    const categoryData = [
        { name: 'Smartphones', value: 45, color: '#1a237e' },
        { name: 'Ordinateurs', value: 25, color: '#ff6d00' },
        { name: 'Accessoires', value: 20, color: '#4caf50' },
        { name: 'Audio', value: 10, color: '#f44336' }
    ]

    const topCustomers = [
        { name: 'Jean Dupont', orders: 15, total: 2850000, growth: 12.5 },
        { name: 'Marie Claire', orders: 12, total: 1980000, growth: -5.2 },
        { name: 'Paul Martin', orders: 10, total: 1650000, growth: 8.7 },
        { name: 'Sophie Ngono', orders: 8, total: 1420000, growth: 15.3 },
        { name: 'Pierre Kamga', orders: 7, total: 1180000, growth: -2.1 }
    ]

    const currentData = salesData[timeRange]
    const totalRevenue = currentData.reduce((sum, day) => sum + day.revenue, 0)
    const totalOrders = currentData.reduce((sum, day) => sum + day.orders, 0)
    const avgOrderValue = totalRevenue / totalOrders

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const formatPercentage = (value) => {
        return `${value > 0 ? '+' : ''}${value}%`
    }

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
                        <option value="90d">90 derniers jours</option>
                    </select>
                    <button className="inline-flex items-center px-4 py-2 bg-soni-navy text-white rounded-md hover:bg-soni-navy/90">
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Exporter
                    </button>
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
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12.5%</span>
                        <span className="text-gray-500 ml-2">vs période précédente</span>
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
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8.3%</span>
                        <span className="text-gray-500 ml-2">vs période précédente</span>
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
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-red-600">-2.1%</span>
                        <span className="text-gray-500 ml-2">vs période précédente</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux de conversion</p>
                            <p className="text-xl font-bold text-gray-900">3.2%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600">+0.8%</span>
                        <span className="text-gray-500 ml-2">vs période précédente</span>
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
                    <SimpleBarChart
                        data={currentData}
                        dataKey={chartType}
                        color={chartType === 'revenue' ? '#1a237e' : chartType === 'orders' ? '#ff6d00' : '#4caf50'}
                    />
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par catégorie</h3>
                    <SimplePieChart data={categoryData} />
                </div>
            </div>

            {/* Top Customers & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customers */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>                        
                        <button className="group flex justify-center items-center p-2 border border-transparent text-base font-bold rounded-xl text-white bg-blue-400  hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-soni-navy/30  transition-all duration-200 shadow-lg hover:shadow-xl  hover:cursor-pointer">
                            Voir tout
                        </button>
                    </div>
                    <div className="space-y-4">
                        {topCustomers.map((customer, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-soni-navy rounded-full flex items-center justify-center text-primary font-medium">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                        <p className="text-sm text-gray-600">{customer.orders} commandes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatPrice(customer.total)}</p>
                                    <p className={`text-sm ${customer.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage(customer.growth)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques de performance</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Taux de satisfaction client</span>
                                <span className="text-sm font-medium">94%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Taux de fidélisation</span>
                                <span className="text-sm font-medium">76%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Temps de livraison moyen</span>
                                <span className="text-sm font-medium">2.3 jours</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Taux de retour</span>
                                <span className="text-sm font-medium">2.1%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.1%' }}></div>
                            </div>
                        </div>
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
