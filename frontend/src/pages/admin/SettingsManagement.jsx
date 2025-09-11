import React, { useState, useEffect } from 'react'
import {
    CogIcon,
    UserIcon,
    ShieldCheckIcon,
    BellIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    DocumentTextIcon,
    KeyIcon,
    PhotoIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon
} from '../../components/icons'
import api from '../../api/client'
import EmptyState from '../../components/admin/EmptyState'

const SettingsManagement = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    
    // Settings data states
    const [generalSettings, setGeneralSettings] = useState({
        appName: '',
        appVersion: '',
        language: 'fr',
        timezone: 'Africa/Douala',
        debugMode: false,
        autoCache: true
    })
    
    const [profileSettings, setProfileSettings] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        avatar: ''
    })
    
    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailProducts: false,
        emailCustomers: true,
        pushOrders: true,
        pushProducts: false,
        pushCustomers: false,
        smsOrders: false,
        smsProducts: false,
        smsCustomers: false
    })
    
    const [shopSettings, setShopSettings] = useState({
        shopName: '',
        currency: 'XAF',
        description: '',
        contactEmail: '',
        contactPhone: '',
        physicalAddress: '',
        autoAcceptOrders: true,
        autoStockAlerts: true
    })
    
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        sessions: []
    })
    
    const [billingSettings, setBillingSettings] = useState({
        currentPlan: '',
        planPrice: '',
        nextBilling: '',
        paymentMethod: '',
        invoices: []
    })

    const tabs = [
        { id: 'general', name: 'Général', icon: CogIcon },
        { id: 'profile', name: 'Profil', icon: UserIcon },
        { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'shop', name: 'Boutique', icon: GlobeAltIcon },
        { id: 'billing', name: 'Facturation', icon: CurrencyDollarIcon }
    ]

    // Load settings data on component mount
    useEffect(() => {
        loadAllSettings()
    }, [])

    const loadAllSettings = async () => {
        setLoading(true)
        setError(null)
        try {
            const results = await Promise.allSettled([
                api.admin.settings.getGeneralSettings(),
                api.admin.settings.getProfileSettings(),
                api.admin.settings.getNotificationSettings(),
                api.admin.settings.getShopSettings(),
                api.admin.settings.getSecuritySettings(),
                api.admin.settings.getBillingSettings()
            ])

            const [general, profile, notif, shop, security, billing] = results

            if (general.status === 'fulfilled') {
                setGeneralSettings(prev => ({ ...prev, ...general.value.data }))
            }
            if (profile.status === 'fulfilled') {
                const data = profile.value.data || {}
                // Normaliser les champs potentiellement null -> '' pour éviter l'avertissement React sur textarea value=null
                ['address','bio'].forEach(f => { if (data[f] == null) data[f] = '' })
                setProfileSettings(prev => ({ ...prev, ...data }))
            }
            if (notif.status === 'fulfilled') {
                setNotifications(prev => ({ ...prev, ...notif.value.data }))
            }
            if (shop.status === 'fulfilled') {
                const data = shop.value.data || {}
                ;['description','contactEmail','contactPhone','physicalAddress'].forEach(f => { if (data[f] == null) data[f] = '' })
                setShopSettings(prev => ({ ...prev, ...data }))
            }
            if (security.status === 'fulfilled') {
                // security endpoint returns twoFactorEnabled + sessions
                setSecuritySettings(prev => ({ ...prev, ...security.value.data }))
            }
            if (billing.status === 'fulfilled') {
                setBillingSettings(prev => ({ ...prev, ...billing.value.data }))
            }

            const failed = results.filter(r => r.status === 'rejected').length
            if (failed && failed === results.length) {
                throw new Error('Toutes les requêtes ont échoué')
            } else if (failed) {
                // Partial failure: surface a non-blocking warning in console only
                console.warn('Certaines sections n\'ont pas pu être chargées')
            }
        } catch (err) {
            console.error('Erreur lors du chargement des paramètres:', err)
            setError('Impossible de charger les paramètres')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async (type, data) => {
        setSaving(true)
        try {
            switch (type) {
                case 'general':
                    await api.admin.settings.updateGeneralSettings(data)
                    setGeneralSettings(data)
                    break
                case 'profile':
                    await api.admin.settings.updateProfileSettings(data)
                    setProfileSettings(data)
                    break
                case 'notifications':
                    await api.admin.settings.updateNotificationSettings(data)
                    setNotifications(data)
                    break
                case 'shop':
                    await api.admin.settings.updateShopSettings(data)
                    setShopSettings(data)
                    break
                case 'security':
                    await api.admin.settings.updateSecuritySettings(data)
                    setSecuritySettings(data)
                    break
                case 'billing':
                    await api.admin.settings.updateBillingSettings(data)
                    setBillingSettings(data)
                    break
                default:
                    throw new Error('Type de paramètre invalide')
            }
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err)
            setError('Erreur lors de la sauvegarde des paramètres')
        } finally {
            setSaving(false)
        }
    }

    const handleNotificationChange = (key) => {
        const updatedNotifications = {
            ...notifications,
            [key]: !notifications[key]
        }
        setNotifications(updatedNotifications)
        saveSettings('notifications', updatedNotifications)
    }

    const handleGeneralSettingChange = (key, value) => {
        const updatedSettings = {
            ...generalSettings,
            [key]: value
        }
        setGeneralSettings(updatedSettings)
    }

    const handleProfileSettingChange = (key, value) => {
        const updatedSettings = {
            ...profileSettings,
            [key]: value
        }
        setProfileSettings(updatedSettings)
    }

    const handleShopSettingChange = (key, value) => {
        const updatedSettings = {
            ...shopSettings,
            [key]: value
        }
        setShopSettings(updatedSettings)
    }

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center mr-3">
                                <CogIcon className="h-5 w-5 text-white" />
                            </div>
                            Paramètres
                        </h1>
                        <p className="text-gray-600 mt-1">Configuration et préférences SoniShop</p>
                    </div>
                </div>
                <EmptyState type="loading" />
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center mr-3">
                                <CogIcon className="h-5 w-5 text-white" />
                            </div>
                            Paramètres
                        </h1>
                        <p className="text-gray-600 mt-1">Configuration et préférences SoniShop</p>
                    </div>
                </div>
                <EmptyState 
                    type="error" 
                    title="Erreur de chargement"
                    description={error}
                    onAction={loadAllSettings}
                />
            </div>
        )
    }

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres Généraux</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'application</label>
                        <input 
                            type="text" 
                            value={generalSettings.appName}
                            onChange={(e) => handleGeneralSettingChange('appName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                        <input 
                            type="text" 
                            value={generalSettings.appVersion}
                            onChange={(e) => handleGeneralSettingChange('appVersion', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Langue par défaut</label>
                        <select 
                            value={generalSettings.language}
                            onChange={(e) => handleGeneralSettingChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                        <select 
                            value={generalSettings.timezone}
                            onChange={(e) => handleGeneralSettingChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        >
                            <option value="Africa/Douala">Afrique/Douala (WAT)</option>
                            <option value="UTC">UTC</option>
                            <option value="Europe/Paris">Europe/Paris (CET)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Paramètres de Performance</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Mode développement</p>
                            <p className="text-sm text-gray-500">Activer les outils de débogage</p>
                        </div>
                        <button 
                            onClick={() => handleGeneralSettingChange('debugMode', !generalSettings.debugMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                generalSettings.debugMode ? 'bg-soni-orange' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                generalSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                            }`}></span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Cache automatique</p>
                            <p className="text-sm text-gray-500">Améliore les performances de l'application</p>
                        </div>
                        <button 
                            onClick={() => handleGeneralSettingChange('autoCache', !generalSettings.autoCache)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                generalSettings.autoCache ? 'bg-soni-orange' : 'bg-gray-200'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                generalSettings.autoCache ? 'translate-x-6' : 'translate-x-1'
                            }`}></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderProfileSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <img 
                        className="h-24 w-24 rounded-xl object-cover shadow-lg" 
                        src={profileSettings.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"} 
                        alt="Profile" 
                    />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-soni-orange rounded-full flex items-center justify-center text-white shadow-lg hover:bg-accent-700 transition-colors">
                        <PhotoIcon className="h-4 w-4" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Photo de profil</h3>
                    <p className="text-sm text-gray-500">JPG, GIF ou PNG. Taille maximale: 2MB</p>
                    <div className="mt-2 flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-soni-orange text-white rounded-lg hover:bg-accent-700 transition-colors">
                            Changer
                        </button>
                        <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input 
                        type="text" 
                        value={profileSettings.firstName}
                        onChange={(e) => handleProfileSettingChange('firstName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input 
                        type="text" 
                        value={profileSettings.lastName}
                        onChange={(e) => handleProfileSettingChange('lastName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="email" 
                            value={profileSettings.email}
                            onChange={(e) => handleProfileSettingChange('email', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <div className="relative">
                        <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="tel" 
                            value={profileSettings.phone}
                            onChange={(e) => handleProfileSettingChange('phone', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <div className="relative">
                        <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                        <textarea 
                            value={profileSettings.address}
                            onChange={(e) => handleProfileSettingChange('address', e.target.value)}
                            rows={3}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea 
                        value={profileSettings.bio}
                        onChange={(e) => handleProfileSettingChange('bio', e.target.value)}
                        placeholder="Parlez-nous de vous..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    )

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de Sécurité</h3>
                
                <div className="space-y-6">
                    <div className={`border rounded-lg p-4 ${securitySettings.twoFactorEnabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className="flex">
                            <ShieldCheckIcon className={`h-5 w-5 mt-0.5 ${securitySettings.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                            <div className="ml-3">
                                <h4 className={`text-sm font-medium ${securitySettings.twoFactorEnabled ? 'text-green-800' : 'text-yellow-800'}`}>
                                    Authentification à deux facteurs
                                </h4>
                                <p className={`text-sm mt-1 ${securitySettings.twoFactorEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {securitySettings.twoFactorEnabled 
                                        ? 'Votre compte est protégé par l\'authentification 2FA.'
                                        : 'Recommandé pour une sécurité renforcée de votre compte administrateur.'
                                    }
                                </p>
                                <button 
                                    onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                                    className={`mt-2 text-sm underline hover:no-underline ${securitySettings.twoFactorEnabled ? 'text-green-800 hover:text-green-900' : 'text-yellow-800 hover:text-yellow-900'}`}
                                >
                                    {securitySettings.twoFactorEnabled ? 'Désactiver l\'authentification 2FA' : 'Activer l\'authentification 2FA'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input 
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input 
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Sessions Actives</h4>
                        <div className="space-y-3">
                            {securitySettings.sessions.map((session) => (
                                <div key={session.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                                    session.current ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            session.current ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {session.current ? 'Session actuelle' : session.device}
                                            </p>
                                            <p className="text-sm text-gray-500">{session.device} • {session.location}</p>
                                        </div>
                                    </div>
                                    {session.current ? (
                                        <span className="text-sm text-green-600 font-medium">Actif maintenant</span>
                                    ) : (
                                        <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                                            Déconnecter
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderNotificationsSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences de Notifications</h3>
                
                <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-600 mr-2" />
                            Notifications Email
                        </h4>
                        <div className="space-y-3">
                            {[
                                { key: 'emailOrders', label: 'Nouvelles commandes', description: 'Recevoir un email pour chaque nouvelle commande' },
                                { key: 'emailProducts', label: 'Produits en rupture', description: 'Alerte quand un produit arrive en rupture de stock' },
                                { key: 'emailCustomers', label: 'Nouveaux clients', description: 'Notification lors de l\'inscription d\'un nouveau client' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleNotificationChange(item.key)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            notifications[item.key] ? 'bg-soni-orange' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                            <BellIcon className="h-5 w-5 text-gray-600 mr-2" />
                            Notifications Push
                        </h4>
                        <div className="space-y-3">
                            {[
                                { key: 'pushOrders', label: 'Commandes urgentes', description: 'Notifications instantanées pour les commandes importantes' },
                                { key: 'pushProducts', label: 'Stock critique', description: 'Alertes quand le stock d\'un produit devient critique' },
                                { key: 'pushCustomers', label: 'Support client', description: 'Messages urgents du support client' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleNotificationChange(item.key)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            notifications[item.key] ? 'bg-soni-orange' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderShopSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de la Boutique</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique</label>
                        <input 
                            type="text" 
                            value={shopSettings.shopName}
                            onChange={(e) => handleShopSettingChange('shopName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Devise par défaut</label>
                        <select 
                            value={shopSettings.currency}
                            onChange={(e) => handleShopSettingChange('currency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        >
                            <option value="XAF">Franc CFA (XAF)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dollar US (USD)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description de la boutique</label>
                        <textarea 
                            value={shopSettings.description}
                            onChange={(e) => handleShopSettingChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                        <input 
                            type="email" 
                            value={shopSettings.contactEmail}
                            onChange={(e) => handleShopSettingChange('contactEmail', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone de contact</label>
                        <input 
                            type="tel" 
                            value={shopSettings.contactPhone}
                            onChange={(e) => handleShopSettingChange('contactPhone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse physique</label>
                        <textarea 
                            value={shopSettings.physicalAddress}
                            onChange={(e) => handleShopSettingChange('physicalAddress', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Paramètres de Commande</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Commandes automatiques</p>
                                <p className="text-sm text-gray-500">Accepter automatiquement les commandes</p>
                            </div>
                            <button 
                                onClick={() => handleShopSettingChange('autoAcceptOrders', !shopSettings.autoAcceptOrders)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    shopSettings.autoAcceptOrders ? 'bg-soni-orange' : 'bg-gray-200'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    shopSettings.autoAcceptOrders ? 'translate-x-6' : 'translate-x-1'
                                }`}></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Stock minimum automatique</p>
                                <p className="text-sm text-gray-500">Alertes de stock faible</p>
                            </div>
                            <button 
                                onClick={() => handleShopSettingChange('autoStockAlerts', !shopSettings.autoStockAlerts)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    shopSettings.autoStockAlerts ? 'bg-soni-orange' : 'bg-gray-200'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    shopSettings.autoStockAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`}></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderBillingSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de Facturation</h3>
                
                <div className="bg-blue-800 rounded-xl p-6 text-white mb-6">
                {/* <div className="bg-gradient-to-r from-soni-navy to-blue-800 rounded-xl p-6 text-white mb-6"> */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-semibold">Plan Actuel: {billingSettings.currentPlan}</h4>
                            <p className="text-blue-100">Accès complet à toutes les fonctionnalités</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">{billingSettings.planPrice}</p>
                            <p className="text-blue-100">par mois</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-5 bg-blue-600 rounded mr-3"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{billingSettings.paymentMethod}</p>
                                        <p className="text-sm text-gray-500">Expire 12/2026</p>
                                    </div>
                                </div>
                                <button className="text-sm text-soni-orange hover:text-accent-700">
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prochaine facturation</label>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-900">{billingSettings.nextBilling}</p>
                            <p className="text-sm text-gray-500">{billingSettings.planPrice} sera prélevé</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Historique des Factures</h4>
                    <div className="space-y-3">
                        {billingSettings.invoices.map((bill, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{bill.invoice}</p>
                                        <p className="text-sm text-gray-500">{bill.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{bill.amount}</p>
                                        <p className="text-sm text-green-600">{bill.status}</p>
                                    </div>
                                    <button className="text-sm text-soni-orange hover:text-accent-700">
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return renderGeneralSettings()
            case 'profile': return renderProfileSettings()
            case 'security': return renderSecuritySettings()
            case 'notifications': return renderNotificationsSettings()
            case 'shop': return renderShopSettings()
            case 'billing': return renderBillingSettings()
            default: return renderGeneralSettings()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center mr-3">
                            <CogIcon className="h-5 w-5 text-white" />
                        </div>
                        Paramètres
                    </h1>
                    <p className="text-gray-600 mt-1">Configuration et préférences SoniShop</p>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={saving}
                    >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Annuler
                    </button>
                    <button 
                        onClick={async () => {
                            await saveSettings('general', generalSettings)
                            await saveSettings('profile', profileSettings) 
                            await saveSettings('notifications', notifications)
                            await saveSettings('shop', shopSettings)
                            await saveSettings('security', securitySettings)
                            await saveSettings('billing', billingSettings)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-soni-orange to-accent-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                        disabled={saving}
                    >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 space-y-1">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-100 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsManagement
