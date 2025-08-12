import React, { useState } from 'react'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    PrinterIcon
} from '../../components/icons'

const OrdersManagement = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')

    const orders = [
        {
            id: '#SN001234',
            customer: 'Jean Dupont',
            email: 'jean.dupont@email.com',
            phone: '+237 691 234 567',
            amount: 850000,
            status: 'completed',
            paymentMethod: 'card',
            deliveryMethod: 'express',
            date: '2025-08-12',
            address: 'Yaoundé, Cameroun',
            items: [
                { name: 'iPhone 15 Pro Max', quantity: 1, price: 850000 }
            ]
        },
        {
            id: '#SN001235',
            customer: 'Marie Claire',
            email: 'marie.claire@email.com',
            phone: '+237 677 890 123',
            amount: 163000,
            status: 'pending',
            paymentMethod: 'mobile',
            deliveryMethod: 'standard',
            date: '2025-08-12',
            address: 'Douala, Cameroun',
            items: [
                { name: 'AirPods Pro 2', quantity: 1, price: 163000 }
            ]
        },
        {
            id: '#SN001236',
            customer: 'Paul Martin',
            email: 'paul.martin@email.com',
            phone: '+237 655 456 789',
            amount: 425000,
            status: 'processing',
            paymentMethod: 'transfer',
            deliveryMethod: 'pickup',
            date: '2025-08-11',
            address: 'Bafoussam, Cameroun',
            items: [
                { name: 'Samsung Galaxy S24', quantity: 1, price: 425000 }
            ]
        },
        {
            id: '#SN001237',
            customer: 'Sophie Ngono',
            email: 'sophie.ngono@email.com',
            phone: '+237 698 765 432',
            amount: 680000,
            status: 'completed',
            paymentMethod: 'card',
            deliveryMethod: 'express',
            date: '2025-08-11',
            address: 'Garoua, Cameroun',
            items: [
                { name: 'MacBook Air M2', quantity: 1, price: 680000 }
            ]
        },
        {
            id: '#SN001238',
            customer: 'Pierre Kamga',
            email: 'pierre.kamga@email.com',
            phone: '+237 672 345 678',
            amount: 195000,
            status: 'cancelled',
            paymentMethod: 'mobile',
            deliveryMethod: 'standard',
            date: '2025-08-10',
            address: 'Bamenda, Cameroun',
            items: [
                { name: 'Écouteurs Bluetooth', quantity: 2, price: 97500 }
            ]
        }
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

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'card': return 'Carte bancaire'
            case 'mobile': return 'Mobile Money'
            case 'transfer': return 'Virement'
            default: return method
        }
    }

    const getDeliveryMethodText = (method) => {
        switch (method) {
            case 'standard': return 'Standard'
            case 'express': return 'Express'
            case 'pickup': return 'Retrait'
            default: return method
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.email.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        
        return matchesSearch && matchesStatus
    })

    const handleExportOrders = () => {
        // Simulation d'export
        const csvContent = "data:text/csv;charset=utf-8," + 
            "ID,Client,Email,Montant,Statut,Date\n" +
            filteredOrders.map(order => 
                `${order.id},${order.customer},${order.email},${order.amount},${order.status},${order.date}`
            ).join("\n")
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "commandes_sonishop.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Header avec actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
                    <p className="text-gray-600">Gérez et suivez toutes les commandes de la plateforme</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportOrders}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soni-orange"
                    >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Exporter CSV
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <PrinterIcon className="mr-2 h-4 w-4" />
                        Imprimer
                    </button>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Recherche */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rechercher
                        </label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="ID commande, nom client, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soni-orange focus:border-soni-orange"
                            />
                        </div>
                    </div>

                    {/* Filtre par statut */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soni-orange focus:border-soni-orange"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="completed">Complétées</option>
                            <option value="pending">En attente</option>
                            <option value="processing">En cours</option>
                            <option value="cancelled">Annulées</option>
                        </select>
                    </div>

                    {/* Filtre par date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Période
                        </label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soni-orange focus:border-soni-orange"
                        >
                            <option value="all">Toute période</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Total commandes</div>
                    <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Complétées</div>
                    <div className="text-2xl font-bold text-green-600">
                        {orders.filter(o => o.status === 'completed').length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">En attente</div>
                    <div className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.status === 'pending').length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                    <div className="text-xl font-bold text-soni-navy">
                        {formatPrice(orders.reduce((sum, order) => 
                            order.status === 'completed' ? sum + order.amount : sum, 0))}
                    </div>
                </div>
            </div>

            {/* Table des commandes */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Commande
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Paiement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                                        <div className="text-sm text-gray-500">{getDeliveryMethodText(order.deliveryMethod)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                        <div className="text-sm text-gray-500">{order.email}</div>
                                        <div className="text-sm text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{formatPrice(order.amount)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{getPaymentMethodText(order.paymentMethod)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(order.date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button className="text-soni-navy hover:text-soni-navy/80">
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-900">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Précédent
                        </button>
                        <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredOrders.length}</span> sur{' '}
                                <span className="font-medium">{filteredOrders.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Précédent
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    1
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Suivant
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrdersManagement
