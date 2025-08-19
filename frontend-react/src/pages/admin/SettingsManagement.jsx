import React, { useState } from 'react'
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

const SettingsManagement = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [showPassword, setShowPassword] = useState(false)
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

    const tabs = [
        { id: 'general', name: 'Général', icon: CogIcon },
        { id: 'profile', name: 'Profil', icon: UserIcon },
        { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'shop', name: 'Boutique', icon: GlobeAltIcon },
        { id: 'billing', name: 'Facturation', icon: CurrencyDollarIcon }
    ]

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
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
                            defaultValue="SoniShop"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                        <input 
                            type="text" 
                            defaultValue="1.0.0"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Langue par défaut</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent">
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
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Cache automatique</p>
                            <p className="text-sm text-gray-500">Améliore les performances de l'application</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-soni-orange transition-colors">
                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
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
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
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
                        defaultValue="Jean"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input 
                        type="text" 
                        defaultValue="Dupont"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="email" 
                            defaultValue="admin@sonishop.com"
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
                            defaultValue="+237 6 78 90 12 34"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <div className="relative">
                        <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                        <textarea 
                            defaultValue="Douala, Cameroun"
                            rows={3}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea 
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
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="ml-3">
                                <h4 className="text-sm font-medium text-yellow-800">Authentification à deux facteurs</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Recommandé pour une sécurité renforcée de votre compte administrateur.
                                </p>
                                <button className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900">
                                    Activer l'authentification 2FA
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
                            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Session actuelle</p>
                                        <p className="text-sm text-gray-500">Windows - Chrome • Douala, Cameroun</p>
                                    </div>
                                </div>
                                <span className="text-sm text-green-600 font-medium">Actif maintenant</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">iPhone Safari</p>
                                        <p className="text-sm text-gray-500">Mobile • Yaoundé, Cameroun</p>
                                    </div>
                                </div>
                                <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                                    Déconnecter
                                </button>
                            </div>
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
                            defaultValue="SoniShop - Electronique & Technology"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Devise par défaut</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent">
                            <option value="XAF">Franc CFA (XAF)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dollar US (USD)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description de la boutique</label>
                        <textarea 
                            defaultValue="SoniShop est votre boutique de référence pour l'électronique et la technologie au Cameroun. Nous proposons les derniers smartphones, ordinateurs, accessoires et bien plus encore."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                        <input 
                            type="email" 
                            defaultValue="contact@sonishop.com"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone de contact</label>
                        <input 
                            type="tel" 
                            defaultValue="+237 6 78 90 12 34"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse physique</label>
                        <textarea 
                            defaultValue="123 Boulevard de la Liberté, Douala, Cameroun"
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
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-soni-orange transition-colors">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Stock minimum automatique</p>
                                <p className="text-sm text-gray-500">Alertes de stock faible</p>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-soni-orange transition-colors">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform"></span>
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
                            <h4 className="text-lg font-semibold">Plan Actuel: Professional</h4>
                            <p className="text-blue-100">Accès complet à toutes les fonctionnalités</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">45,000 FCFA</p>
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
                                        <p className="text-sm font-medium text-gray-900">•••• •••• •••• 1234</p>
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
                            <p className="text-sm font-medium text-gray-900">15 septembre 2025</p>
                            <p className="text-sm text-gray-500">45,000 FCFA sera prélevé</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Historique des Factures</h4>
                    <div className="space-y-3">
                        {[
                            { date: '12 août 2025', amount: '45,000 FCFA', status: 'Payée', invoice: '#INV-2025-08-001' },
                            { date: '12 juillet 2025', amount: '45,000 FCFA', status: 'Payée', invoice: '#INV-2025-07-001' },
                            { date: '12 juin 2025', amount: '45,000 FCFA', status: 'Payée', invoice: '#INV-2025-06-001' }
                        ].map((bill, index) => (
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
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Annuler
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-soni-orange to-accent-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Enregistrer
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
