import React, { useState, useEffect, useCallback } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import {
    UserIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '../../components/icons'

import { api } from '../../api/client'

const CustomersManagement = () => {
    const [customers, setCustomers] = useState([])
    const [page, setPage] = useState(1)
    const [perPage] = useState(20)
    const [total, setTotal] = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [selectedCustomer, setSelectedCustomer] = useState(null)

    const statuses = ['all', 'active', 'vip', 'new', 'inactive']

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Jamais'
        return new Date(dateString).toLocaleDateString('fr-FR')
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'vip': return 'bg-purple-100 text-purple-800'
            case 'new': return 'bg-blue-100 text-blue-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Actif'
            case 'vip': return 'VIP'
            case 'new': return 'Nouveau'
            case 'inactive': return 'Inactif'
            default: return status
        }
    }

    const filteredCustomers = customers
        .filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                customer.phone.includes(searchTerm)
            const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
            return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]
            
            if (sortBy === 'totalOrders' || sortBy === 'totalSpent') {
                aVal = Number(aVal)
                bVal = Number(bVal)
            }
            
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

    const totalCustomers = total
    const activeCustomers = customers.filter(c => c.status === 'active' || c.status === 'vip').length
    const vipCustomers = customers.filter(c => c.status === 'vip').length
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)

    const fetchCustomers = useCallback(async () => {
        setLoading(true); setError(null)
        try {
            const { data } = await api.get('/admin/customers', { params: { page, per_page: perPage, search: searchTerm || undefined, status: filterStatus !== 'all' ? filterStatus : undefined } })
            const payload = data?.data || data
            const items = payload.items || []
            const meta = payload.pagination || {}
            setCustomers(items.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone || '',
                city: u.city || '',
                quartier: u.quartier || '',
                country: u.country || '',
                joinDate: u.created_at,
                totalOrders: u.orders_count,
                totalSpent: u.total_spent,
                status: u.status,
                lastOrder: u.last_order || null,
                avatar: u.avatar || null,
            })))
            setTotal(meta.total || items.length)
            setLastPage(meta.last_page || 1)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [page, perPage, searchTerm, filterStatus])

    useEffect(() => { fetchCustomers() }, [fetchCustomers])

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
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Ajouter un Client
                </button>
            </div>
            {error && <div className="text-red-600 text-sm">Erreur de chargement des clients.</div>}
            {loading && <div className="text-gray-500 text-sm">Chargement...</div>}

            {/* Filtres */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
                <div className="flex-1">
                    <input
                        value={searchTerm}
                        onChange={e => { setPage(1); setSearchTerm(e.target.value) }}
                        placeholder="Rechercher client (nom, email, téléphone)"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => { setPage(1); setFilterStatus(e.target.value) }}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'Tous statuts' : s}</option>)}
                </select>
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
                            <p className="text-xl font-bold text-green-600">{activeCustomers}</p>
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
                            <p className="text-xl font-bold text-purple-600">{vipCustomers}</p>
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
                            <p className="text-xl font-bold text-soni-orange">{formatPrice(totalRevenue)}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
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
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'Tous les statuts' : getStatusText(status)}
                            </option>
                        ))}
                    </select>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtres avancés
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="name">Client</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">Contact</th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="joinDate">Inscription</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="totalOrders">Commandes</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="totalSpent">Total Dépensé</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="status">Statut</SortButton>
                                </th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">Chargement des clients...</td>
                                </tr>
                            )}
                            {!loading && filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-0">
                                        <EmptyState 
                                            type="customers"
                                            title="Aucun client trouvé"
                                            description="Vos clients apparaîtront ici lorsqu'ils s'inscriront sur votre boutique."
                                        />
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img 
                                                className="h-10 w-10 rounded-full object-cover" 
                                                src={customer.avatar} 
                                                alt={customer.name}
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <MapPinIcon className="h-3 w-3 mr-1" />
                                                    {[customer.quartier, customer.city].filter(Boolean).join(', ')}
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
                                            {formatDate(customer.joinDate)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Dernière: {formatDate(customer.lastOrder)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                            <ShoppingBagIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {customer.totalOrders} commandes
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatPrice(customer.totalSpent)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                            {getStatusText(customer.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 p-1 rounded transition-colors">
                                                <EnvelopeIcon className="h-4 w-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 p-1 rounded transition-colors">
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

            {/* Pagination */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredCustomers.length}</span> sur <span className="font-medium">{customers.length}</span> clients
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                            Précédent
                        </button>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
            {/* Pagination */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {page} / {lastPage} — {total} clients</div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
                    >Précédent</button>
                    <button
                        onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage || loading}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
                    >Suivant</button>
                </div>
            </div>
        </div>
    )
}

export default CustomersManagement
