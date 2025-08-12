import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import {
    HomeIcon,
    ShoppingBagIcon,
    UserIcon,
    ChartBarIcon,
    CogIcon,
    DocumentTextIcon,
    LogoutIcon,
    MenuIcon,
    XIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '../icons'

const DashboardSidebar = ({
    isCollapsed,
    setIsCollapsed,
    activeTab,
    setActiveTab,
    sidebarItems = [],
    isMobileOpen,
    setIsMobileOpen
}) => {
    const { user, logout } = useAuth()

    const defaultSidebarItems = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: HomeIcon },
        { id: 'analytics', label: 'Analytiques', icon: ChartBarIcon },
        { id: 'separator-1', type: 'separator' },
        { id: 'orders', label: 'Commandes', icon: ShoppingBagIcon },
        { id: 'products', label: 'Produits', icon: ShoppingBagIcon },
        { id: 'customers', label: 'Clients', icon: UserIcon },
        { id: 'separator-2', type: 'separator' },
        { id: 'reports', label: 'Rapports', icon: DocumentTextIcon },
        { id: 'settings', label: 'Paramètres', icon: CogIcon }
    ]

    const items = defaultSidebarItems

    const handleItemClick = (itemId) => {
        setActiveTab(itemId)
        // Fermer la sidebar mobile après sélection
        if (setIsMobileOpen) {
            setIsMobileOpen(false)
        }
    }

    const handleLogout = () => {
        logout()
        if (setIsMobileOpen) {
            setIsMobileOpen(false)
        }
    }

    // Version Mobile
    if (isMobileOpen !== undefined) {
        return (
            <>
                {/* Overlay */}
                {isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                {/* Sidebar Mobile */}
                <div className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-soni-navy via-soni-navy to-soni-navy-dark 
                    shadow-2xl shadow-soni-navy/50 transform transition-all duration-300 ease-in-out lg:hidden
                    border-r border-soni-orange/20
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent
                        items={items}
                        activeTab={activeTab}
                        onItemClick={handleItemClick}
                        user={user}
                        onLogout={handleLogout}
                        isCollapsed={false}
                        showLabels={true}
                        onClose={() => setIsMobileOpen(false)}
                        isMobile={true}
                    />
                </div>
            </>
        )
    }

    // Version Desktop
    return (
        <div className={`
            hidden lg:flex lg:flex-shrink-0 relative z-30
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-72'}
        `}>
            <div className="flex flex-col w-full shadow-2xl shadow-soni-navy/20">
                <SidebarContent
                    items={items}
                    activeTab={activeTab}
                    onItemClick={handleItemClick}
                    user={user}
                    onLogout={handleLogout}
                    isCollapsed={isCollapsed}
                    showLabels={!isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                    isMobile={false}
                />
            </div>
        </div>
    )
}

// Composant de contenu de la sidebar
const SidebarContent = ({
    items,
    activeTab,
    onItemClick,
    user,
    onLogout,
    isCollapsed,
    showLabels,
    onToggleCollapse,
    onClose,
    isMobile
}) => (
    <div className="flex-1 flex flex-col min-h-0 bg-soni-navy-dark relative">
        {/* Effet de brillance subtile */}
        {/* <div className="absolute inset-0 bg-transparent pointer-events-none"></div> */}

        <div className="flex-1 flex flex-col pt-6 pb-4 relative z-10">
            {/* Header avec logo et bouton de fermeture/collapse */}
            <div className="flex items-center justify-between px-3.5 mb-8">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                    {/* Logo SoniShop amélioré */}
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br  rounded-2xl flex items-center justify-center">
                            <Link to="/" className="text-2xl font-bold">
                                <img src="/sonitelecom_logo.png" alt="SoniShop" />
                            </Link>
                        </div>
                        {/* Petit point de brillance */}
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full"></div>
                    </div>
                    {showLabels && (
                        <div className="ml-4">
                            <h1 className="text-white text-xl font-black tracking-tight">
                                <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
                                    SoniShop
                                </Link>
                            </h1>
                            <div className="flex items-center mt-1">
                                <div className="w-1.5 h-1.5 bg-soni-orange rounded-full mr-2"></div>
                                <p className="text-soni-orange text-xs font-semibold uppercase tracking-wider">Administration</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bouton de fermeture mobile ou collapse desktop */}
                {isMobile ? (
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                ) : (
                    <button
                        onClick={onToggleCollapse}
                        className="absolute right-[-16px] top-2.5 rounded-xl text-blue-500 transition-all duration-200 backdrop-blur-sm border border-blue-400 hover:border-blue-500 h-8 w-8 flex items-center justify-center z-50 cursor-pointer"
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="h-4 w-4" />
                        ) : (
                            <ChevronLeftIcon className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="mt-4 flex-1 px-4 space-y-1">
                {items.map((item) => {
                    // Séparateur visuel amélioré
                    if (item.type === 'separator') {
                        return (
                            <div key={item.id} className="py-3">
                                {!isCollapsed && (
                                    <div className="relative">
                                        <div className=" "></div>
                                        <div className="absolute inset-x-0 top-0 h-px"></div>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    const Icon = item.icon
                    const isActive = activeTab === item.id

                    return (
                        <button
                            key={item.id}
                            onClick={() => onItemClick(item.id)}
                            className={`
                                group flex items-center px-4 py-3 text-sm font-semibold rounded-2xl w-full text-left 
                                transition-all duration-300 ease-out relative
                                ${isActive
                                    ? 'bg-blue-400 text-white shadow-2xl shadow-blue-100 ring-2 ring-white/20  transform'
                                    : 'hover:bg-blue-100 text-blue-300 hover:text-blue-500 border border-transparent'
                                }
                                ${isCollapsed ? 'justify-center px-3' : ''}
                            `}
                            title={isCollapsed ? item.label : ''}
                        >
                            {/* Background animé pour l'état actif */}
                            {isActive && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 animate-pulse"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </>
                            )}

                            <Icon
                                className={`
                                    flex-shrink-0 h-5 w-5 transition-all duration-300 relative z-10
                                    ${isActive ? 'text-white drop-shadow-sm' : 'text-gray-400 group-hover:text-blue-400'}
                                    ${isCollapsed ? '' : 'mr-3'}
                                `}
                            />
                            {!isCollapsed && (
                                <span className={`truncate font-semibold relative z-10 tracking-wide ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`}>{item.label}</span>
                            )}

                            {/* Indicateur actif pour la version collapsed amélioré */}
                            {isCollapsed && isActive && (
                                <div className="absolute left-0 w-1.5 h-10 rounded-r-full shadow-lg shadow-soni-orange/50"></div>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>

        {/* Section utilisateur améliorée */}
        <div className="flex-shrink-0 border-t-2 border-white/10 bg-gradient-to-r from-soni-navy-dark via-soni-navy to-soni-navy-dark p-6 relative">
            {/* Effet lumineux subtil */}
            <div className="absolute inset-0 bg-gradient-to-t from-soni-orange/5 to-transparent pointer-events-none"></div>

            <div className={`flex items-center w-full relative z-10 ${isCollapsed ? 'justify-center' : ''}`}>
                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            {/* Avatar utilisateur amélioré */}
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-soni-orange via-orange-500 to-accent-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-soni-orange/30 ring-offset-2 ring-offset-soni-navy">
                                    <span className="text-white font-bold text-sm tracking-wide">
                                        {(user?.name || 'Admin').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                {/* Indicateur de statut en ligne */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-soni-navy shadow-sm"></div>
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-bold text-white truncate tracking-wide">{user?.name || 'Administrateur'}</p>
                                <p className="text-xs text-soni-orange/80 truncate font-medium">{user?.email || 'admin@sonishop.com'}</p>
                                <div className="flex items-center mt-1">
                                    <div className="w-1 h-1 bg-green-400 rounded-full mr-1.5"></div>
                                    <span className="text-xs text-green-300 font-medium">En ligne</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className={`
                        p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all duration-300 group
                        border border-transparent hover:border-red-400/30 backdrop-blur-sm
                        ${isCollapsed ? '' : 'ml-3'}
                    `}
                    title={isCollapsed ? 'Se déconnecter' : 'Se déconnecter'}
                >
                    <LogoutIcon className="h-5 w-5 group-hover:text-red-400 transition-all duration-300 group-hover:scale-110" />
                </button>
            </div>
        </div>
    </div>
)

export default DashboardSidebar
