import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { api } from '../../api/client'
import EmptyState from '../../components/admin/EmptyState'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FilterIcon,
    DownloadIcon,
    PrinterIcon,
    ArrowPathIcon,
    AdjustmentsIcon,
    DocumentTextIcon,
    TagIcon,
    XIcon,
    CurrencyDollarIcon,
    UserIcon,
    ClipboardListIcon,
    CheckCircleIcon,
    ClockIcon
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
        try {
            // Appeler l'API backend pour la mise à jour en lot
            await api.admin.orders.bulkStatus(Array.from(selectedIds), newStatus)
            
            // Mettre à jour l'état local seulement après succès de l'API
            setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o))
            setSelectedIds(new Set())
            toastSuccess && toastSuccess(`Statut mis à jour (${newStatus})`)
        } catch (error) {
            console.error('Erreur lors de la mise à jour en lot:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
        } finally {
            setBulkActionLoading(false)
        }
    }
    const bulkCancel = async () => {
        if (!selectedIds.size) return
        setBulkActionLoading(true)
        try {
            // Appeler l'API backend pour l'annulation en lot
            await api.admin.orders.bulkCancel(Array.from(selectedIds))
            
            // Mettre à jour l'état local seulement après succès de l'API
            setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: 'cancelled' } : o))
            setSelectedIds(new Set())
            toastSuccess && toastSuccess('Commandes annulées')
        } catch (error) {
            console.error('Erreur lors de l\'annulation en lot:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
        } finally {
            setBulkActionLoading(false)
        }
    }
    const addNote = async () => {
        if (!detailOrder || !noteText.trim()) return
        try {
            // Appeler l'API backend pour ajouter la note
            const response = await api.admin.orders.addNote(detailOrder.id, noteText.trim())
            
            // Mettre à jour l'état local avec la nouvelle note
            const newNote = {
                id: response.data?.id || Date.now(),
                text: noteText.trim(),
                at: new Date().toISOString(),
                user: response.data?.user || 'Admin'
            }
            
            setDetailOrder(prev => prev ? { 
                ...prev, 
                _notes: [...(prev._notes || []), newNote] 
            } : prev)
            
            // Mettre à jour aussi dans la liste des commandes si c'est la même
            setOrders(prev => prev.map(o => 
                o.id === detailOrder.id 
                    ? { ...o, _notes: [...(o._notes || []), newNote] }
                    : o
            ))
            
            closeNote()
            toastSuccess && toastSuccess('Note ajoutée avec succès')
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la note:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
        }
    }
    const changeSingleStatus = async (order, status) => {
        try {
            // Appeler l'API backend pour changer le statut
            await api.admin.orders.updateStatus(order.id, status)
            
            // Mettre à jour l'état local seulement après succès de l'API
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o))
            setRowMenuOpen(null)
            toastSuccess && toastSuccess('Statut mis à jour avec succès')
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
            setRowMenuOpen(null)
        }
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
    const applyRefund = async () => {
        if (!refundOrder) return
        const val = Number(refundAmount)
        if (isNaN(val) || val <= 0) return toastError && toastError('Montant invalide')
        
        try {
            // Appeler l'API backend pour appliquer le remboursement
            await api.admin.orders.refund(refundOrder.id, val)
            
            // Mettre à jour l'état local seulement après succès de l'API
            setOrders(prev => prev.map(o => 
                o.id === refundOrder.id 
                    ? { ...o, status: 'refunded', refunded_amount: val } 
                    : o
            ))
            
            closeRefund()
            toastSuccess && toastSuccess('Remboursement appliqué avec succès')
        } catch (error) {
            console.error('Erreur lors du remboursement:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
        }
    }

    const resendEmail = async (order) => {
        try {
            // Appeler l'API backend pour renvoyer l'email
            await api.admin.orders.resendEmail(order.id)
            toastSuccess && toastSuccess(`Email renvoyé avec succès à ${order.email || order.customer}`)
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error)
            toastError && toastError(`Erreur: ${error.response?.data?.message || error.message}`)
        } finally {
            setRowMenuOpen(null)
        }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
                    <p className="text-gray-600 mt-1">Gérez et suivez toutes les commandes de la plateforme</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Actions principales */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={refresh} 
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-soni-orange focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md" 
                            title="Rafraîchir la liste"
                        >
                            <ArrowPathIcon className={`mr-2 h-4 w-4 ${loading && 'animate-spin'}`} /> 
                            {loading ? 'Chargement...' : 'Actualiser'}
                        </button>
                        
                        {/* Groupe d'export */}
                        <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                            <button 
                                onClick={handleExportOrders} 
                                className="inline-flex items-center px-3 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 border-r border-gray-300 transition-colors duration-200"
                                title="Exporter en CSV"
                            >
                                <DownloadIcon className="mr-2 h-4 w-4" /> CSV
                            </button>
                            <button 
                                onClick={exportPdf} 
                                className="inline-flex items-center px-3 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 border-r border-gray-300 transition-colors duration-200"
                                title="Exporter en PDF"
                            >
                                <DocumentTextIcon className="mr-2 h-4 w-4" /> PDF
                            </button>
                            <button 
                                onClick={printList} 
                                className="inline-flex items-center px-3 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 transition-colors duration-200"
                                title="Imprimer la liste"
                            >
                                <PrinterIcon className="mr-2 h-4 w-4" /> Imprimer
                            </button>
                        </div>
                    </div>

                    {/* Actions en lot améliorées */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2.5 shadow-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-blue-800">
                                    {selectedIds.size} commande{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="h-4 w-px bg-blue-300"></div>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={bulkActionLoading} 
                                    onClick={() => applyBulkStatus('processing')} 
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {bulkActionLoading ? '...' : 'En traitement'}
                                </button>
                                <button 
                                    disabled={bulkActionLoading} 
                                    onClick={() => applyBulkStatus('completed')} 
                                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {bulkActionLoading ? '...' : 'Compléter'}
                                </button>
                                <button 
                                    disabled={bulkActionLoading} 
                                    onClick={bulkCancel} 
                                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {bulkActionLoading ? '...' : 'Annuler'}
                                </button>
                                <button 
                                    onClick={() => setSelectedIds(new Set())} 
                                    className="inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-md transition-all duration-200"
                                    title="Désélectionner tout"
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Recherche */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rechercher dans les commandes
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="ID commande, nom client, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-soni-orange focus:ring-4 focus:ring-soni-orange/20 transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                    {/* Filtre par statut */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Statut des commandes
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-soni-orange focus:ring-4 focus:ring-soni-orange/20 transition-all duration-200 text-sm bg-white"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="completed">✅ Complétées</option>
                            <option value="pending">⏳ En attente</option>
                            <option value="processing">🔄 En cours</option>
                            <option value="cancelled">❌ Annulées</option>
                        </select>
                    </div>

                    {/* Filtre par date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Période
                        </label>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-soni-orange focus:ring-4 focus:ring-soni-orange/20 transition-all duration-200 text-sm bg-white"
                        >
                            <option value="all">Toute période</option>
                            <option value="today">📅 Aujourd'hui</option>
                            <option value="week">📆 Cette semaine</option>
                            <option value="month">🗓️ Ce mois</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <ClipboardListIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-700">{meta.total}</div>
                            <div className="text-sm font-medium text-blue-600">Total</div>
                        </div>
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Total commandes</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">
                                {meta.total ? orders.filter(o => o.status === 'completed').length : 0}
                            </div>
                            <div className="text-sm font-medium text-green-600">Complétées</div>
                        </div>
                    </div>
                    <div className="text-sm text-green-700 font-medium">Commandes terminées</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-yellow-500 rounded-xl">
                            <ClockIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-700">
                                {meta.total ? orders.filter(o => o.status === 'pending').length : 0}
                            </div>
                            <div className="text-sm font-medium text-yellow-600">En attente</div>
                        </div>
                    </div>
                    <div className="text-sm text-yellow-700 font-medium">À traiter</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-purple-500 rounded-xl">
                            <CurrencyDollarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-purple-700">
                                {formatPrice(orders.reduce((sum, o) => o.status === 'completed' ? sum + (o.amount||0) : sum, 0))}
                            </div>
                            <div className="text-sm font-medium text-purple-600">CA réalisé</div>
                        </div>
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Chiffre d'affaires</div>
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
                                        <div className="flex items-center space-x-3 relative">
                                            <button 
                                                onClick={() => openDetail(order)} 
                                                className="group inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                                                title="Voir les détails"
                                            >
                                                <EyeIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            </button>
                                            <button 
                                                onClick={() => openNote(order)} 
                                                className="group inline-flex items-center justify-center w-8 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2" 
                                                title="Ajouter une note"
                                            >
                                                <TagIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            </button>
                                            <button 
                                                onClick={() => setRowMenuOpen(rowMenuOpen===order.id?null:order.id)} 
                                                className={`group inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                                                    rowMenuOpen === order.id 
                                                        ? 'text-gray-700 bg-gray-100' 
                                                        : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                                                }`} 
                                                title="Plus d'actions"
                                            >
                                                <AdjustmentsIcon className={`h-4 w-4 transition-all duration-200 ${
                                                    rowMenuOpen === order.id ? 'rotate-90' : 'group-hover:scale-110'
                                                }`} />
                                            </button>
                                            {rowMenuOpen === order.id && (
                                                <div className="absolute top-10 right-0 z-20 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-1 text-sm animate-in slide-in-from-top-2 duration-200">
                                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                                        Actions rapides
                                                    </div>
                                                    <div className="py-1 space-y-1">
                                                        <button 
                                                            onClick={() => changeSingleStatus(order,'processing')} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 group"
                                                        >
                                                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-150"></div>
                                                            Marquer en traitement
                                                        </button>
                                                        <button 
                                                            onClick={() => changeSingleStatus(order,'completed')} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors duration-150 group"
                                                        >
                                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-150"></div>
                                                            Marquer complétée
                                                        </button>
                                                        <button 
                                                            onClick={() => changeSingleStatus(order,'cancelled')} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-150 group"
                                                        >
                                                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-150"></div>
                                                            Annuler commande
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-gray-100 py-1 space-y-1">
                                                        <button 
                                                            onClick={() => exportPdf()} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                                        >
                                                            <DocumentTextIcon className="h-4 w-4 mr-3" />
                                                            Générer facture
                                                        </button>
                                                        <button 
                                                            onClick={() => openRefund(order)} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-150"
                                                        >
                                                            <CurrencyDollarIcon className="h-4 w-4 mr-3" />
                                                            Rembourser
                                                        </button>
                                                        <button 
                                                            onClick={() => resendEmail(order)} 
                                                            className="w-full flex items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                                        >
                                                            <ArrowPathIcon className="h-4 w-4 mr-3" />
                                                            Renvoyer email
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-gray-100 py-1">
                                                        <button 
                                                            onClick={() => setRowMenuOpen(null)} 
                                                            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                                        >
                                                            <XIcon className="h-4 w-4 mr-2" />
                                                            Fermer
                                                        </button>
                                                    </div>
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
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 bg-blue-700 text-white">
                        <div>
                            <h3 className="text-xl font-bold">Détails de la commande</h3>
                            <p className="text-blue-100 text-sm mt-1">
                                {detailOrder.display_id || '#'+detailOrder.id}
                            </p>
                        </div>
                        <button 
                            onClick={closeDetail} 
                            className="p-2 text-blue-200 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-6 overflow-auto max-h-[calc(90vh-140px)]">
                        {/* Informations principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Informations client
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Nom complet</div>
                                        <div className="text-base font-semibold text-gray-900">{detailOrder.customer}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Email</div>
                                        <div className="text-base text-gray-700">{detailOrder.email || 'Non renseigné'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center">
                                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-green-600" />
                                    Détails financiers
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Montant total</div>
                                        <div className="text-xl font-bold text-green-600">{formatPrice(detailOrder.amount)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Statut</div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(detailOrder.status)}`}>
                                            {getStatusText(detailOrder.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date de création */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Informations de commande
                            </h4>
                            <div className="text-sm text-gray-600">
                                Créée le {detailOrder.date ? new Date(detailOrder.date).toLocaleString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Date inconnue'}
                            </div>
                        </div>

                        {/* Notes si présentes */}
                        {detailOrder._notes && detailOrder._notes.length > 0 && (
                            <div className="bg-amber-50 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <TagIcon className="h-5 w-5 mr-2 text-amber-600" />
                                    Notes internes ({detailOrder._notes.length})
                                </h4>
                                <div className="space-y-3">
                                    {detailOrder._notes.map((n,i)=>(
                                        <div key={i} className="bg-white rounded-lg p-3 border-l-4 border-amber-400">
                                            <div className="text-sm text-gray-700">{n.text}</div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {new Date(n.at).toLocaleString('fr-FR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-2xl">
                        <button 
                            onClick={() => openNote(detailOrder)} 
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-soni-orange focus:ring-offset-2 transition-all duration-200 shadow-sm cursor-pointer"
                        >
                            <TagIcon className="h-4 w-4 mr-2" />
                            Ajouter une note
                        </button>
                        <button 
                            onClick={closeDetail} 
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-soni-orange focus:ring-offset-2 transition-all duration-200 shadow-sm cursor-pointer"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Note Modal */}
        {showNoteModal && detailOrder && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl">
                        <div className="flex items-center">
                            <TagIcon className="h-6 w-6 mr-3" />
                            <div>
                                <h3 className="text-lg font-bold">Nouvelle note</h3>
                                <p className="text-amber-100 text-sm">
                                    Commande {detailOrder.display_id || '#'+detailOrder.id}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={closeNote} 
                            className="p-2 text-amber-200 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Note interne
                                </label>
                                <textarea 
                                    value={noteText} 
                                    onChange={e=> setNoteText(e.target.value)} 
                                    rows={4} 
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 resize-none" 
                                    placeholder="Ajoutez votre note ici... (visible uniquement par l'équipe administrative)"
                                />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <DocumentTextIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-amber-800">Information</div>
                                        <div className="text-sm text-amber-700 mt-1">
                                            Cette note sera visible dans l'historique de la commande et pourra être consultée par tous les administrateurs.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button 
                            onClick={closeNote} 
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button 
                            disabled={!noteText.trim()} 
                            onClick={addNote} 
                            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <TagIcon className="h-4 w-4 mr-2" />
                            Enregistrer la note
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && refundOrder && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
                        <div className="flex items-center">
                            <CurrencyDollarIcon className="h-6 w-6 mr-3" />
                            <div>
                                <h3 className="text-lg font-bold">Remboursement</h3>
                                <p className="text-purple-100 text-sm">
                                    {refundOrder.display_id || '#'+refundOrder.id}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={closeRefund} 
                            className="p-2 text-purple-200 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-5">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm font-medium text-gray-500 mb-1">Montant initial de la commande</div>
                            <div className="text-2xl font-bold text-gray-900">{formatPrice(refundOrder.amount)}</div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Montant à rembourser
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    min="0" 
                                    max={refundOrder.amount} 
                                    value={refundAmount} 
                                    onChange={e=> setRefundAmount(e.target.value)} 
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200" 
                                    placeholder="0"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm font-medium">XAF</span>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Maximum: {formatPrice(refundOrder.amount)}
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-start">
                                <DocumentTextIcon className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-purple-800">Attention</div>
                                    <div className="text-sm text-purple-700 mt-1">
                                        Le remboursement sera traité selon la méthode de paiement originale. Cette action ne peut pas être annulée.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button 
                            onClick={closeRefund} 
                            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            Annuler
                        </button>
                        <button 
                            disabled={!refundAmount || Number(refundAmount)<=0} 
                            onClick={applyRefund} 
                            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            Confirmer le remboursement
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    )
}

export default OrdersManagement
