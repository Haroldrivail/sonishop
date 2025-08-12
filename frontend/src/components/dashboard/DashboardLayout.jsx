import React, { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import {
    MenuIcon,
    BellIcon,
    UserIcon
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
    onNotificationClick // Nouvelle prop pour gérer le clic sur les notifications
}) => {
    const { user } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    
    // Nombre de notifications non lues (simulé)
    const unreadNotifications = 3

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
                sidebarItems={sidebarItems}
            />

            {/* Sidebar Mobile */}
            <DashboardSidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarItems={sidebarItems}
            />

            {/* Contenu principal */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Header */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
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
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
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
                                            {user?.name || 'Administrateur'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {user?.role || 'Admin'}
                                        </p>
                                    </div>
                                    <button className="h-8 w-8 rounded-full bg-soni-navy flex items-center justify-center text-white text-sm font-medium hover:bg-soni-navy/90 transition-colors">
                                        {user?.name?.charAt(0) || 'A'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Zone de contenu principale */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className={`
                        py-6 transition-all duration-300
                        ${isCollapsed ? 'lg:ml-2' : 'lg:ml-4'}
                    `}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
