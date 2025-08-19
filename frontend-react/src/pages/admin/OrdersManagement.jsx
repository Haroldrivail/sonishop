import React, { useState } from 'react'
import { useEffect } from 'react'
import api from '../../axios'
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
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)



    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders')
            // Vérification de la réponse
            setOrders(response.data)
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setLoading(false)
        }
    }


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
        const matchesSearch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const handleExportOrders = () => {
        // Simulation d'export
        const csvContent = "data:text/csv;charset=utf-8," +
            "ID,Client,Email,Montant,Statut,Date\n" +
            filteredOrders.map(order =>
                `${order.id},${order.customer_name},${order.email},${order.amount},${order.status},${order.date}`
            ).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "commandes_sonishop.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const openOrderModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeOrderModal = () => {
        console.log("Détails de la commande sélectionnée :", selectedOrder)

        setIsModalOpen(false)
        setSelectedOrder(null)
    }

    const cancelOrder = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/cancel`);
            // Mettre à jour la liste des commandes après annulation
            fetchOrders();
        } catch (error) {
            console.error('Erreur lors de l\'annulation :', error);
            alert('Échec de l\'annulation de la commande.');
        }
    };


    return (
        <div className="space-y-6">
            {/* Header avec actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Gestion des Commandes</h2>
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
                    <div className="text-xl font-bold text-gray-900">{orders.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Complétées</div>
                    <div className="text-xl font-bold text-green-600">
                        {orders.filter(o => o.status === 'completed').length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">En attente</div>
                    <div className="text-xl font-bold text-yellow-600">
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
                                console.log("order.complet:", order),//
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                                        <div className="text-sm text-gray-500">{getDeliveryMethodText(order.delivery_method)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
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
                                        <div className="text-sm text-gray-900">{getPaymentMethodText(order.payment_method)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.created_at
                                            ? new Date(order.created_at).toLocaleDateString('fr-FR')
                                            : 'Date non définie'}                                </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openOrderModal(order)}
                                                className="text-soni-navy hover:text-soni-navy/80"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>

                                            <button className="text-gray-600 hover:text-gray-900">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Annuler cette commande ?')) {
                                                        cancelOrder(order.id)
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
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
            {
                isModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-lg w-full relative shadow-lg">
                            <button
                                onClick={closeOrderModal}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                                aria-label="Fermer la fenêtre"
                            >
                                &times;
                            </button>

                            <h3 className="text-xl font-bold mb-4">Détails commande #{selectedOrder.order_number}</h3>

                            <p><strong>Client :</strong> {selectedOrder.customer_name}</p>
                            <p><strong>Email :</strong> {selectedOrder.email}</p>
                            <p><strong>Téléphone :</strong> {selectedOrder.phone}</p>
                            <p><strong>Adresse :</strong> {selectedOrder.address}</p>
                            <p><strong>Montant :</strong> {formatPrice(selectedOrder.amount)}</p>
                            <p><strong>Statut :</strong> {getStatusText(selectedOrder.status)}</p>
                            <p><strong>Méthode de paiement :</strong> {getPaymentMethodText(selectedOrder.payment_method)}</p>
                            <p><strong>Méthode de livraison :</strong> {getDeliveryMethodText(selectedOrder.delivery_method)}</p>
                            <p><strong>Date :</strong> {new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</p>

                            <h4 className="mt-4 font-semibold">Articles :</h4>
                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                                    {selectedOrder.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.name} - {item.quantity} x {formatPrice(item.price)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucun article</p>
                            )}
                        </div>
                    </div>
                )
            }


        </div>
    )

}

export default OrdersManagement
