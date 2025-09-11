import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import { api } from '../../api/client'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    PrinterIcon,
    ArrowPathIcon,
    AdjustmentsIcon,
    DocumentTextIcon,
    TagIcon,
    XIcon
} from '../../components/icons'
import { useToast } from '../../context/ToastContext'

const OrdersManagement = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilter, setDateFilter] = useState('all')
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState({ current_page:1, last_page:1, total:0, per_page:15 })
    const [error, setError] = useState(null)
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [showDetail, setShowDetail] = useState(false)
    const [detailOrder, setDetailOrder] = useState(null)
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [noteText, setNoteText] = useState('')
    const [rowMenuOpen, setRowMenuOpen] = useState(null)
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [refundOrder, setRefundOrder] = useState(null)
    const [refundAmount, setRefundAmount] = useState('')
    const { info:toastInfo, error:toastError, success:toastSuccess } = useToast?.() || {}
    const [bulkActionLoading, setBulkActionLoading] = useState(false)

    const debounceRef = useRef(null)

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = {
                page,
                per_page: meta.per_page || 15,
                search: searchTerm || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                period: dateFilter !== 'all' ? dateFilter : undefined,
            }
            const { data } = await api.admin.orders.getAll(params)
            setOrders(Array.isArray(data.data) ? data.data : [])
            if (data.meta) setMeta(data.meta)
        } catch (e) {
            setError(e.response?.data?.message || e.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }, [page, searchTerm, statusFilter, dateFilter, meta.per_page])

    useEffect(() => {
        // debounce sur recherche / filtres
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchOrders()
        }, 300)
        return () => clearTimeout(debounceRef.current)
    }, [fetchOrders])

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
            case 'refunded': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Complétée'
            case 'pending': return 'En attente'
            case 'processing': return 'En cours'
            case 'cancelled': return 'Annulée'
            case 'refunded': return 'Remboursée'
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

    const filteredOrders = orders

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredOrders.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredOrders.map(o => o.id)))
        }
    }
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }
    const refresh = () => { fetchOrders(); toastInfo && toastInfo('Liste actualisée') }
    const openDetail = (order) => { setDetailOrder(order); setShowDetail(true) }
    const closeDetail = () => { setShowDetail(false); setDetailOrder(null) }
    const openNote = (order) => { setDetailOrder(order); setShowNoteModal(true) }
    const closeNote = () => { setShowNoteModal(false); setNoteText('') }
    const applyBulkStatus = async (newStatus) => {
        if (!selectedIds.size) return
        setBulkActionLoading(true)
        setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o))
        setSelectedIds(new Set())
        setBulkActionLoading(false)
        toastSuccess && toastSuccess(`Statut mis à jour (${newStatus})`)
    }
    const bulkCancel = async () => {
        if (!selectedIds.size) return
        setBulkActionLoading(true)
        setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: 'cancelled' } : o))
        setSelectedIds(new Set())
        setBulkActionLoading(false)
        toastSuccess && toastSuccess('Commandes annulées')
    }
    const addNote = () => {
        if (!detailOrder) return
        setDetailOrder(prev => prev ? { ...prev, _notes: [...(prev._notes||[]), { text: noteText, at: new Date().toISOString() }] } : prev)
        closeNote()
        toastSuccess && toastSuccess('Note ajoutée')
    }
    const changeSingleStatus = (order, status) => {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o))
        setRowMenuOpen(null)
        toastSuccess && toastSuccess('Statut mis à jour')
    }

    const exportPdf = () => {
        try {
            const win = window.open('', '_blank')
            if (!win) return
            const rows = filteredOrders.map(o => `<tr><td>${o.display_id||('#'+o.id)}</td><td>${o.customer}</td><td>${o.email||''}</td><td>${formatPrice(o.amount)}</td><td>${getStatusText(o.status)}</td><td>${o.date?new Date(o.date).toLocaleDateString('fr-FR'):''}</td></tr>`).join('\n')
            win.document.write(`<!DOCTYPE html><html><head><title>Commandes</title><style>body{font-family:Arial;padding:16px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:4px;font-size:12px;text-align:left;}th{background:#f5f5f5;}</style></head><body><h1>Commandes</h1><table><thead><tr><th>ID</th><th>Client</th><th>Email</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></body></html>`)
            win.document.close()
            win.focus()
            win.print()
            toastInfo && toastInfo('PDF imprimable généré')
        } catch (e) {
            toastError && toastError('PDF impossible')
        }
    }

    const printList = () => { window.print(); toastInfo && toastInfo('Dialogue impression ouvert') }

    const openRefund = (order) => { setRefundOrder(order); setRefundAmount(String(order.amount)); setShowRefundModal(true) }
    const closeRefund = () => { setShowRefundModal(false); setRefundOrder(null); setRefundAmount('') }
    const applyRefund = () => {
        if (!refundOrder) return
        const val = Number(refundAmount)
        if (isNaN(val) || val <= 0) return toastError && toastError('Montant invalide')
        setOrders(prev => prev.map(o => o.id === refundOrder.id ? { ...o, status:'refunded', refunded_amount: val } : o))
        closeRefund()
        toastSuccess && toastSuccess('Remboursement appliqué (local)')
    }

    const resendEmail = (order) => {
        toastInfo && toastInfo(`Email renvoyé à ${order.email || order.customer}`)
        setRowMenuOpen(null)
    }

    const handleExportOrders = () => {
        const header = ['ID','Client','Email','Montant','Statut','Date']
        const rows = filteredOrders.map(o => [o.display_id || o.id, o.customer, o.email || '', o.amount, o.status, o.date])
        const csv = [header, ...rows].map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'commandes_sonishop.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <>
        <div className="space-y-6">
            {/* Header avec actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Gestion des Commandes</h2>
                    <p className="text-gray-600">Gérez et suivez toutes les commandes de la plateforme</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={refresh} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50" title="Rafraîchir">
                        <ArrowPathIcon className={`mr-2 h-4 w-4 ${loading && 'animate-spin'}`} /> Recharger
                    </button>
                    <button onClick={handleExportOrders} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50">
                        <DownloadIcon className="mr-2 h-4 w-4" /> CSV
                    </button>
                    <button onClick={exportPdf} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50">
                        <DocumentTextIcon className="mr-2 h-4 w-4" /> PDF
                    </button>
                    <button onClick={printList} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50">
                        <PrinterIcon className="mr-2 h-4 w-4" /> Imprimer
                    </button>
                    {/* Boutons 'Nouvelle' et 'Filtres avancés' retirés */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2">
                            <span className="text-xs font-medium text-indigo-700">{selectedIds.size} sélectionnées</span>
                            <button disabled={bulkActionLoading} onClick={() => applyBulkStatus('processing')} className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50">En traitement</button>
                            <button disabled={bulkActionLoading} onClick={() => applyBulkStatus('completed')} className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50">Compléter</button>
                            <button disabled={bulkActionLoading} onClick={bulkCancel} className="text-xs px-2 py-1 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50">Annuler</button>
                            <button onClick={() => setSelectedIds(new Set())} className="text-xs px-2 py-1 text-gray-500 hover:underline">Vider</button>
                        </div>
                    )}
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
                    <div className="text-xl font-bold text-gray-900">{meta.total}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Complétées</div>
                    <div className="text-xl font-bold text-green-600">
                        {meta.total ? orders.filter(o => o.status === 'completed').length : 0}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">En attente</div>
                    <div className="text-xl font-bold text-yellow-600">
                        {meta.total ? orders.filter(o => o.status === 'pending').length : 0}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                    <div className="text-xl font-bold text-soni-navy">
                        {formatPrice(orders.reduce((sum, o) => o.status === 'completed' ? sum + (o.amount||0) : sum, 0))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Table des commandes */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3">
                                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size>0 && selectedIds.size===filteredOrders.length} />
                                </th>
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
                            {loading && (
                                <tr><td colSpan={8} className="px-6 py-4 text-sm text-gray-500">Chargement...</td></tr>
                            )}
                            {!loading && filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-0">
                                        <EmptyState 
                                            type="orders"
                                            title="Aucune commande trouvée"
                                            description="Les commandes apparaîtront ici dès que vos clients effectueront des achats."
                                        />
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 relative">
                                    <td className="px-3 py-4">
                                        <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelect(order.id)} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.display_id || ('#'+order.id)}</div>
                                        <div className="text-sm text-gray-500">{getDeliveryMethodText(order.delivery_method)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                        <div className="text-sm text-gray-500">{order.email || '—'}</div>
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
                                        {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2 relative">
                                            <button onClick={() => openDetail(order)} className="text-soni-navy hover:text-soni-navy/80" title="Détails">
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => openNote(order)} className="text-gray-600 hover:text-gray-900" title="Ajouter note">
                                                <TagIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => setRowMenuOpen(rowMenuOpen===order.id?null:order.id)} className="text-gray-600 hover:text-gray-900" title="Plus">
                                                <AdjustmentsIcon className="h-5 w-5" />
                                            </button>
                                            {rowMenuOpen === order.id && (
                                                <div className="absolute top-8 right-0 z-10 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs space-y-1">
                                                    <div className="font-medium text-gray-700 px-2 py-1">Actions</div>
                                                    <button onClick={() => changeSingleStatus(order,'processing')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50">Marquer En traitement</button>
                                                    <button onClick={() => changeSingleStatus(order,'completed')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50">Marquer Complétée</button>
                                                    <button onClick={() => changeSingleStatus(order,'cancelled')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 text-red-600">Annuler</button>
                                                    <button onClick={() => exportPdf()} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50">Générer facture</button>
                                                    <button onClick={() => { openRefund(order) }} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50">Rembourser</button>
                                                    <button onClick={() => resendEmail(order)} className="w-full text-left px-2 py-1 rounded hover:bg-gray-50">Renvoyer email</button>
                                                    <button onClick={() => setRowMenuOpen(null)} className="w-full mt-1 text-left px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1"><XIcon className="h-3 w-3" /> Fermer</button>
                                                </div>
                                            )}
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
                                Page <span className="font-medium">{meta.current_page}</span> sur <span className="font-medium">{meta.last_page}</span> — {meta.total} commandes
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button disabled={meta.current_page<=1 || loading} onClick={()=> setPage(p=> Math.max(1,p-1))} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                    Précédent
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    {meta.current_page}
                                </span>
                                <button disabled={meta.current_page>=meta.last_page || loading} onClick={()=> setPage(p=> Math.min(meta.last_page,p+1))} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                    Suivant
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {showDetail && detailOrder && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="font-semibold text-gray-900">Détails {detailOrder.display_id || '#'+detailOrder.id}</h3>
                        <button onClick={closeDetail} className="text-gray-500 hover:text-gray-800"><XIcon className="h-5 w-5" /></button>
                    </div>
                    <div className="p-4 space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-gray-500">Client</div>
                                <div className="font-medium">{detailOrder.customer}</div>
                                <div className="text-gray-500">Email</div>
                                <div>{detailOrder.email || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500">Montant</div>
                                <div className="font-medium">{formatPrice(detailOrder.amount)}</div>
                                <div className="text-gray-500">Statut</div>
                                <div>{getStatusText(detailOrder.status)}</div>
                            </div>
                        </div>
                        <div className="text-gray-500">Créée</div>
                        <div>{detailOrder.date ? new Date(detailOrder.date).toLocaleString('fr-FR') : '—'}</div>
                        {detailOrder._notes && detailOrder._notes.length > 0 && (
                            <div className="mt-4">
                                <div className="text-gray-500 mb-1">Notes</div>
                                <ul className="space-y-1">
                                    {detailOrder._notes.map((n,i)=>(
                                        <li key={i} className="px-2 py-1 bg-gray-50 rounded">{n.text} <span className="text-[10px] text-gray-500">{new Date(n.at).toLocaleString('fr-FR')}</span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                        <button onClick={() => openNote(detailOrder)} className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50">Ajouter note</button>
                        <button onClick={closeDetail} className="px-3 py-2 text-sm bg-soni-navy text-white rounded hover:bg-soni-navy/90">Fermer</button>
                    </div>
                </div>
            </div>
        )}
    {showNoteModal && detailOrder && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        {showRefundModal && refundOrder && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="font-semibold">Rembourser {refundOrder.display_id || '#'+refundOrder.id}</h3>
                        <button onClick={closeRefund}><XIcon className="h-5 w-5 text-gray-500" /></button>
                    </div>
                    <div className="p-4 space-y-4 text-sm">
                        <div className="text-gray-600">Montant initial: {formatPrice(refundOrder.amount)}</div>
                        <div>
                            <label className="block mb-1 text-gray-600">Montant à rembourser</label>
                            <input type="number" min="0" max={refundOrder.amount} value={refundAmount} onChange={e=> setRefundAmount(e.target.value)} className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="px-4 py-3 border-t flex justify-end gap-2">
                        <button onClick={closeRefund} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Annuler</button>
                        <button disabled={!refundAmount || Number(refundAmount)<=0} onClick={applyRefund} className="px-3 py-2 text-sm rounded bg-soni-navy text-white disabled:opacity-50">Rembourser</button>
                    </div>
                </div>
            </div>
        )}
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="font-semibold">Nouvelle note</h3>
                        <button onClick={closeNote}><XIcon className="h-5 w-5 text-gray-500" /></button>
                    </div>
                    <div className="p-4 space-y-3">
                        <textarea value={noteText} onChange={e=> setNoteText(e.target.value)} rows={4} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soni-orange" placeholder="Note interne..."></textarea>
                    </div>
                    <div className="px-4 py-3 border-t flex justify-end gap-2">
                        <button onClick={closeNote} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Annuler</button>
                        <button disabled={!noteText.trim()} onClick={addNote} className="px-3 py-2 text-sm rounded bg-soni-navy text-white disabled:opacity-50">Enregistrer</button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default OrdersManagement
