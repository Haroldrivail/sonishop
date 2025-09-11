import React, { useState, useEffect } from 'react'
import DashboardSidebar from './DashboardSidebar'
import {
    MenuIcon,
    BellIcon,
} from '../icons'
import { useAuth } from '../../context/AuthContext'

const DashboardLayout = ({ 
    children, 
    activeTab, 
    setActiveTab, 
    sidebarItems,
    pageTitle,
    showNotifications = true,
    showUserMenu = true,
    onNotificationClick, // Nouvelle prop pour gérer le clic sur les notifications
    autoFetchNotifications = true,
    notificationsPollingMs = 60000
}) => {
    const { user } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [dynamicSidebar, setDynamicSidebar] = useState([])
    const [loadingSidebar, setLoadingSidebar] = useState(false)
    const [unreadNotifications, setUnreadNotifications] = useState(0)

    // Mapping dynamique nom -> composant d'icône
    const iconMap = React.useRef(null)
    if (!iconMap.current) {
        // Chargement lazy pour ne pas alourdir initial bundle
        iconMap.current = {}
        try {
            const iconsModule = require('../icons')
            iconMap.current = iconsModule
        } catch (e) {
            // ignore
        }
    }

    // Chargement dynamique des éléments de sidebar si non fournis
    useEffect(() => {
        if (sidebarItems && sidebarItems.length > 0) return
        let abort = false
        const load = async () => {
            setLoadingSidebar(true)
            try {
                const mod = await import('../../api/client')
                const res = await mod.api.dashboard.getSidebar()
                const items = res?.data?.data || res?.data || []
                const normalized = items.map(it => {
                    if (it.type === 'separator') return it
                    const IconComp = iconMap.current[it.icon] || iconMap.current['HomeIcon'] || (() => null)
                    return { id: it.id, label: it.label, icon: IconComp }
                })
                if (!abort) setDynamicSidebar(normalized)
            } catch (e) {
                // silent fallback -> restera sur items par défaut du composant child
            } finally {
                if (!abort) setLoadingSidebar(false)
            }
        }
        load()
        return () => { abort = true }
    }, [sidebarItems])

    // Chargement dynamique des notifications (compteur)
    useEffect(() => {
        if (!showNotifications || !autoFetchNotifications) return
        let abort = false
        let timer
        const load = async () => {
            try {
                const mod = await import('../../api/client')
                const res = await mod.api.notifications.getAll()
                if (!abort) {
                    const list = res?.data?.data || res?.data || []
                    const unread = list.filter(n => !n.read_at && !n.read).length
                    setUnreadNotifications(unread)
                }
            } catch (e) {
                // silencieux pour éviter le bruit UI
            } finally {
                if (!abort && notificationsPollingMs > 0) {
                    timer = setTimeout(load, notificationsPollingMs)
                }
            }
        }
        load()
        return () => { abort = true; if (timer) clearTimeout(timer) }
    }, [showNotifications, autoFetchNotifications, notificationsPollingMs])

    // Titre de page dynamique
    const getPageTitle = () => {
        if (pageTitle) return pageTitle
        
        const defaultTitles = {
            overview: 'Vue d\'ensemble',
            orders: 'Gestion des Commandes',
            products: 'Gestion des Produits',
            customers: 'Gestion des Clients',
            analytics: 'Analytiques & Rapports',
            reports: 'Rapports',
            settings: 'Paramètres'
        }
        
        return defaultTitles[activeTab] || 'Dashboard Admin'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <DashboardSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarItems={sidebarItems.length ? sidebarItems : dynamicSidebar}
            />

            {/* Sidebar Mobile */}
            <DashboardSidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarItems={sidebarItems.length ? sidebarItems : dynamicSidebar}
            />

            {/* Contenu principal */}
            <div className="flex flex-col w-0 relative flex-1 overflow-hidden">
                {/* Header */}
                <div className={`fixed z-20 top-0 inset-x-0 lg:right-0 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200 transition-all duration-300 ${
                    isCollapsed ? 'lg:left-20' : 'lg:left-60'
                }`}>
                    {/* Bouton menu mobile */}
                    <button
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-soni-orange lg:hidden"
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="flex-1 px-4 lg:px-6 flex justify-between items-center">
                        {/* Titre de la page */}
                        <div className="flex-1 flex items-center">
                            <h1 className="text-xl lg:text-xl font-bold text-gray-900">
                                {getPageTitle()}
                            </h1>
                        </div>
                        
                        {/* Actions header */}
                        <div className="ml-4 flex items-center space-x-4">
                            {/* Notifications */}
                            {showNotifications && (
                                <button 
                                    onClick={onNotificationClick}
                                    className="relative bg-white p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soni-orange transition-colors"
                                >
                                    <BellIcon className="h-6 w-6" />
                                    {/* Badge de notification */}
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </button>
                            )}
                            
                            {/* Menu utilisateur */}
                            {showUserMenu && (
                                <div className="flex items-center space-x-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name || user?.first_name || 'Administrateur'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {user?.role || user?.user_type || 'Admin'}
                                        </p>
                                    </div>
                                    {/* Avatar utilisateur dynamique */}
                                    <div className="relative">
                                        {user?.avatar || user?.profile_image ? (
                                            <img
                                                src={user.avatar || user.profile_image}
                                                alt={user?.name || 'Avatar'}
                                                className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm hover:ring-soni-orange transition-all duration-200"
                                                onError={(e) => {
                                                    // Fallback vers initiales si l'image échoue
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <button 
                                            className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm ${
                                                user?.avatar || user?.profile_image ? 'hidden' : 'flex'
                                            }`}
                                            style={user?.avatar || user?.profile_image ? {display: 'none'} : {}}
                                        >
                                            {(user?.name || user?.first_name || 'A').charAt(0).toUpperCase()}
                                        </button>
                                        {/* Indicateur de statut en ligne */}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Zone de contenu principale */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none pt-16">
                    <div className={`
                        py-6 transition-all duration-300
                        ${isCollapsed ? 'lg:ml-2' : 'lg:ml-4'}
                    `}>
                        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
                        <div className="w-full mx-auto px-4">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer optionnel */}
                <footer className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
                    <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
                        <div>
                            © 2025 SoniShop. Tous droits réservés.
                        </div>
                        <div className="flex space-x-4">
                            <button className="hover:text-gray-700 transition-colors">
                                Aide
                            </button>
                            <button className="hover:text-gray-700 transition-colors">
                                Support
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default DashboardLayout
