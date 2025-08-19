import React, { useEffect, useState } from 'react'
import axios from 'axios'
import RegisterClientModal from './utils/RegisterClientModal'
import {
    UserIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    //ShoppingBagIcon,
    CurrencyDollarIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '../../components/icons'

const CustomersManagement = () => {
    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [clientToEdit, setClientToEdit] = useState(null)



    //const statuses = ['all', 'active', 'vip', 'new', 'inactive']

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('/api/clients')
            console.log('Réponse API /api/clients :', res.data)
            setCustomers(res.data)
        } catch (error) {
            console.error("Erreur chargement clients:", error)
        }
    }


    useEffect(() => {
        fetchCustomers()
    }, [])

    const formatDate = (dateString) => {
        if (!dateString) return 'Jamais'
        return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const filteredCustomers = customers
        .filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm)
            return matchesSearch // pas de statut dans la BDD pour l'instant
        })
        .sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const handleEdit = (client) => {
        console.log("Modifier client :", client)
        setClientToEdit(client)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce client ?")) {
            try {
                await axios.delete(`/api/clients/${id}`)
                fetchCustomers()
            } catch (err) {
                console.error("Erreur suppression :", err)
            }
        }
    }

    const SortButton = ({ field, children }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-soni-navy transition-colors"
        >
            <span>{children}</span>
            {sortBy === field && (
                sortOrder === 'asc' ?
                    <ChevronUpIcon className="h-4 w-4" /> :
                    <ChevronDownIcon className="h-4 w-4" />
            )}
        </button>
    )

    const totalCustomers = customers.length
    // const totalRevenue = 0 // pas encore dispo
    //const activeCustomers = 0 // à implémenter
    //const vipCustomers = 0 // à implémenter

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
                            <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        Gestion des Clients
                    </h1>
                    <p className="text-gray-600 mt-1">Gérez votre base de clients SoniShop</p>
                </div>
                <div>
                    <button
                        onClick={() => 
                            setClientToEdit(null) ||
                            setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Ajouter un Client
                    </button>

                    <RegisterClientModal
                        isOpen={isModalOpen}
                        mode={clientToEdit ? "edit" : "create"}
                        initialData={clientToEdit}
                        onClose={() => {
                            setIsModalOpen(false)
                            setClientToEdit(null)
                        }}
                        onSuccess={() => {
                            fetchCustomers()
                            setIsModalOpen(false)
                            setClientToEdit(null)
                        }}
                    />

                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clients</p>
                            <p className="text-xl font-bold text-gray-900">{totalCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                            <p className="text-xl font-bold text-green-600">À implémenter</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Clients VIP</p>
                            <p className="text-xl font-bold text-purple-600">À implémenter</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                            <p className="text-xl font-bold text-soni-orange">À implémenter</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">Tous les clients</option>
                        {/* Statuts à implémenter */}
                    </select>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtres avancés
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left"><SortButton field="name">Client</SortButton></th>
                                <th className="px-6 py-3 text-left">Contact</th>
                                <th className="px-6 py-3 text-left">Inscription</th>
                                <th className="px-6 py-3 text-left">Commandes</th>
                                <th className="px-6 py-3 text-left">Total Dépensé</th>
                                <th className="px-6 py-3 text-left">Statut</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCustomers.map(customer => (
                                // console.log("Client :", customer), // ajoute ça temporairement
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
                                                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                                                alt="Avatar client"
                                            />

                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                                    {customer.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center mb-1">
                                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {customer.email}
                                        </div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {customer.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {formatDate(customer.created_at)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Modifié le : {formatDate(customer.updated_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        À implémenter
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        À implémenter
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        À implémenter
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => handleEdit(customer)} className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 p-1 rounded transition-colors">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    )
}

export default CustomersManagement
