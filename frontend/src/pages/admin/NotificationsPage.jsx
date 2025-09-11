import React, { useState, useEffect, useCallback, useMemo } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import {
    BellIcon,
    XMarkIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    CogIcon
} from '../../components/icons'
import { api } from '../../api/client'

// Helpers to map backend notification data (Laravel database notifications)
const mapNotification = (n) => {
    // Backend returns fields: id, type (class path), notifiable_type, notifiable_id, data (array), read_at, created_at
    // We'll attempt to derive a simplified type & presentation fields from data payload
    const payload = n.data || {}
    const derivedType = payload.domain || payload.type || 'system'
    const title = payload.title || payload.subject || 'Notification'
    const message = payload.message || payload.body || payload.content || ''
    const priority = payload.priority || 'low'
    // Choose icon & color based on derivedType / priority heuristics
    const iconMap = {
        order: 'ShoppingBagIcon',
        stock: 'ExclamationTriangleIcon',
        customer: 'UserIcon',
        payment: 'CurrencyDollarIcon',
        system: 'InformationCircleIcon'
    }
    const mappedIconName = iconMap[derivedType] || 'InformationCircleIcon'
    return {
        id: n.id,
        type: derivedType,
        title,
        message,
        priority: ['high','medium','low'].includes(priority) ? priority : 'low',
        read: !!n.read_at,
        time: n.created_at,
        iconName: mappedIconName,
        color: priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue',
        _raw: n
    }
}

// Map of icon components by name so we can select dynamically
const ICON_COMPONENTS = {
    BellIcon,
    XMarkIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon,
    CogIcon
}

const NotificationsPage = () => {
    // State
    const [notifications, setNotifications] = useState([])
    const [page, setPage] = useState(1)
    const [perPage] = useState(20) // Fixed by backend paginate(20)
    const [total, setTotal] = useState(0)
    const [lastPage, setLastPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [filterType, setFilterType] = useState('all')
    const [filterRead, setFilterRead] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const notificationTypes = [
        { value: 'all', label: 'Toutes les notifications' },
        { value: 'order', label: 'Commandes' },
        { value: 'stock', label: 'Stock' },
        { value: 'customer', label: 'Clients' },
        { value: 'payment', label: 'Paiements' },
        { value: 'system', label: 'Système' }
    ]

    const readStatuses = [
        { value: 'all', label: 'Toutes' },
        { value: 'unread', label: 'Non lues' },
        { value: 'read', label: 'Lues' }
    ]

    const formatTime = (timeString) => {
        const date = new Date(timeString)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))
        const diffInHours = Math.floor(diffInMinutes / 60)
        const diffInDays = Math.floor(diffInHours / 24)

        if (diffInMinutes < 60) {
            return `Il y a ${diffInMinutes} min`
        } else if (diffInHours < 24) {
            return `Il y a ${diffInHours}h`
        } else if (diffInDays === 1) {
            return 'Hier'
        } else if (diffInDays < 7) {
            return `Il y a ${diffInDays} jours`
        } else {
            return date.toLocaleDateString('fr-FR')
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500'
            case 'medium': return 'border-l-yellow-500'
            case 'low': return 'border-l-green-500'
            default: return 'border-l-gray-300'
        }
    }

    const getIconColor = (color) => {
        const colors = {
            blue: 'text-blue-600 bg-blue-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            green: 'text-green-600 bg-green-100',
            red: 'text-red-600 bg-red-100',
            purple: 'text-purple-600 bg-purple-100'
        }
        return colors[color] || 'text-gray-600 bg-gray-100'
    }

    const filteredNotifications = notifications
        .filter(notification => {
            const matchesType = filterType === 'all' || notification.type === filterType
            const matchesRead = filterRead === 'all' || 
                              (filterRead === 'read' && notification.read) ||
                              (filterRead === 'unread' && !notification.read)
            const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                notification.message.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesType && matchesRead && matchesSearch
        })
        .sort((a, b) => new Date(b.time) - new Date(a.time))

    const unreadCount = notifications.filter(n => !n.read).length

    // API: fetch notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await api.get('/notifications', { params: { page } })
            // ApiResponse => { status:'ok', data: { current_page, data: [...], last_page, per_page, total, ... } }
            const payload = data?.data || {}
            const list = (payload.data || []).map(mapNotification)
            setNotifications(list)
            setTotal(payload.total || list.length)
            setLastPage(payload.last_page || 1)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [page])

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        try { await api.post(`/notifications/${id}/read`) } catch { /* rollback? omitted for brevity */ }
    }

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        try { await api.post('/notifications/read-all') } catch { /* ignore */ }
    }

    const deleteNotification = async (id) => {
        const prev = notifications
        setNotifications(p => p.filter(n => n.id !== id))
        try { await api.delete(`/notifications/${id}`) } catch { setNotifications(prev) }
    }

    const deleteAllRead = async () => {
        const toDelete = notifications.filter(n => n.read).map(n => n.id)
        if (!toDelete.length) return
        const prev = notifications
        setNotifications(prev.filter(n => !n.read))
        try {
            // Batch delete sequentially (could be optimized server-side with bulk endpoint)
            for (const id of toDelete) {
                // eslint-disable-next-line no-await-in-loop
                await api.delete(`/notifications/${id}`)
            }
        } catch {
            setNotifications(prev) // rollback
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                            <BellIcon className="h-5 w-5 text-white" />
                        </div>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">Centre de notifications SoniShop</p>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={markAllAsRead}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Tout marquer lu
                    </button>
                    <button 
                        onClick={deleteAllRead}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Supprimer lues
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BellIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Non lues</p>
                            <p className="text-xl font-bold text-red-600">{unreadCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Haute priorité</p>
                            <p className="text-xl font-bold text-yellow-600">
                                {notifications.filter(n => n.priority === 'high').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                            <p className="text-xl font-bold text-green-600">
                                {notifications.filter(n => {
                                    const today = new Date().toDateString()
                                    const notifDate = new Date(n.time).toDateString()
                                    return today === notifDate
                                }).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <ClockIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher une notification..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {notificationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterRead}
                        onChange={(e) => setFilterRead(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {readStatuses.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtres avancés
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading && (
                    <div className="py-8 text-center text-gray-500 text-sm">Chargement...</div>
                )}
                {error && !loading && (
                    <div className="py-8 text-center text-red-500 text-sm">Erreur de chargement des notifications.</div>
                )}
                {!loading && !error && filteredNotifications.length === 0 ? (
                    <EmptyState 
                        type="notifications"
                        title="Aucune notification"
                        description="Toutes vos notifications importantes apparaîtront ici."
                    />
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.map((notification) => {
                            const Icon = ICON_COMPONENTS[notification.iconName] || InformationCircleIcon
                            return (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                                        !notification.read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(notification.color)}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center mt-2 space-x-4">
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <ClockIcon className="h-3 w-3 mr-1" />
                                                        {formatTime(notification.time)}
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                        notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {notification.priority === 'high' ? 'Haute' :
                                                         notification.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 text-blue-600 hover:text-blue-800 rounded transition-colors"
                                                    title="Marquer comme lu"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 text-red-600 hover:text-red-800 rounded transition-colors"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {(!loading && !error && filteredNotifications.length > 0) && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page <span className="font-medium">{page}</span> / {lastPage} — {total} notifications
                        </div>
                        <div className="flex space-x-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Précédent
                            </button>
                            <button
                                disabled={page >= lastPage}
                                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationsPage
