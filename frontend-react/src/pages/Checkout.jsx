import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ChevronLeftIcon,
    CreditCardIcon,
    TruckIcon,
    ShieldCheckIcon,
    CheckIcon,
    LockClosedIcon,
    PhoneIcon,
    UserIcon,
    XIcon,
    EyeIcon,
    EyeOffIcon
} from '../components/icons/index'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
    const navigate = useNavigate()
    const { cart, clearCart, cartTotal } = useCart()
    const { showToast } = useToast()
    const { showSuccess, showError } = useNotification()
    const { user, isAuthenticated, login, register } = useAuth()

    // États principaux
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // États pour l'authentification
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState('login')
    const [showPassword, setShowPassword] = useState(false)

    // Informations de l'utilisateur/commande
    const [userInfo, setUserInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Cameroun'
    })

    // Informations d'authentification
    const [authInfo, setAuthInfo] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    })

    // Mode de livraison
    const [deliveryMode, setDeliveryMode] = useState('standard')

    // Pré-remplir les informations si l'utilisateur est connecté
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserInfo({
                firstName: user.firstName || user.name?.split(' ')[0] || '',
                lastName: user.lastName || user.name?.split(' ')[1] || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postalCode: user.postalCode || '',
                country: user.country || 'Cameroun'
            })
        }
    }, [isAuthenticated, user])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    // Calculs des prix
    const subtotal = cart.reduce((sum, item) => {
        const price = item.salePrice || item.price
        return sum + (price * item.quantity)
    }, 0)

    const deliveryOptions = {
        standard: { price: 1000, time: '3-5 jours', label: 'Livraison standard', icon: '🚛' },
        express: { price: 3000, time: '1-2 jours', label: 'Livraison express', icon: '🚀' },
        pickup: { price: 0, time: 'Immédiate', label: 'Retrait en magasin', icon: '🏪' }
    }

    const shipping = deliveryOptions[deliveryMode].price
    const total = subtotal + shipping

    // Validation des informations
    const validateUserInfo = () => {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city']
        const missing = []

        for (let field of required) {
            if (!userInfo[field]?.trim()) {
                const fieldNames = {
                    firstName: 'Prénom',
                    lastName: 'Nom',
                    email: 'Email',
                    phone: 'Téléphone',
                    address: 'Adresse',
                    city: 'Ville'
                }
                missing.push(fieldNames[field])
            }
        }

        if (missing.length > 0) {
            showToast(`Champs requis: ${missing.join(', ')}`, 'error')
            return false
        }

        // Validation email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
            showToast('Email invalide', 'error')
            return false
        }

        return true
    }

    // Gestion de l'authentification
    const handleAuth = async (e) => {
        e.preventDefault()
        setIsProcessing(true)

        try {
            if (authMode === 'login') {
                await login(authInfo.email, authInfo.password)
                showSuccess('Connexion réussie !')
            } else {
                if (authInfo.password !== authInfo.confirmPassword) {
                    showToast('Les mots de passe ne correspondent pas', 'error')
                    return
                }
                if (authInfo.password.length < 6) {
                    showToast('Le mot de passe doit contenir au moins 6 caractères', 'error')
                    return
                }

                await register({
                    email: authInfo.email,
                    password: authInfo.password,
                    firstName: authInfo.firstName,
                    lastName: authInfo.lastName
                })
                showSuccess('Compte créé avec succès !')
            }
            setShowAuthModal(false)
            setAuthInfo({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' })
        } catch (error) {
            showError(error.message || 'Erreur lors de l\'authentification')
        } finally {
            setIsProcessing(false)
        }
    }

    // Confirmer le paiement - Afficher la boîte de dialogue
    const handleConfirmPayment = () => {
        if (!validateUserInfo()) return

        const orderNum = 'SN' + Date.now().toString().slice(-8)
        setOrderNumber(orderNum)
        setShowConfirmDialog(true)
    }

    // Finaliser la commande
    const handleFinalizeOrder = async () => {
        setIsProcessing(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 2000))

            const orderData = {
                id: orderNumber,
                items: cart,
                userInfo,
                deliveryMode,
                subtotal,
                shipping,
                total,
                date: new Date().toISOString(),
                status: 'confirmed',
                estimatedDelivery: getEstimatedDeliveryDate()
            }

            const existingOrders = JSON.parse(localStorage.getItem('sonishop_orders') || '[]')
            existingOrders.push(orderData)
            localStorage.setItem('sonishop_orders', JSON.stringify(existingOrders))

            clearCart()
            showSuccess('Commande confirmée avec succès !')
            navigate('/order-tracking', { state: { orderId: orderNumber } })

        } catch (error) {
            showError('Erreur lors de la finalisation de la commande')
        } finally {
            setIsProcessing(false)
        }
    }

    const getEstimatedDeliveryDate = () => {
        const days = deliveryMode === 'express' ? 2 : deliveryMode === 'standard' ? 5 : 0
        const date = new Date()
        date.setDate(date.getDate() + days)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const updateUserInfo = (field, value) => {
        setUserInfo(prev => ({ ...prev, [field]: value }))
    }

    const updateAuthInfo = (field, value) => {
        setAuthInfo(prev => ({ ...prev, [field]: value }))
    }

    // Si le panier est vide
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Panier vide</h2>
                    <p className="text-gray-600 mb-6">Votre panier est vide. Ajoutez des produits avant de continuer.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 bg-soni-navy text-white rounded-lg hover:bg-soni-navy/90 transition-colors"
                    >
                        Voir nos produits
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                to="/cart"
                                className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors mr-6"
                            >
                                <ChevronLeftIcon className="mr-2 w-5 h-5" />
                                Retour au panier
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">Finaliser ma commande</h1>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <LockClosedIcon className="w-4 h-4 mr-1" />
                            Paiement sécurisé
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulaire principal */}
                    <div className="space-y-6">
                        {/* Section authentification */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    👤 Informations de connexion
                                </h2>
                                {!isAuthenticated && (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="text-soni-navy hover:text-soni-navy/80 text-sm font-medium"
                                    >
                                        Se connecter / S'inscrire
                                    </button>
                                )}
                            </div>

                            {isAuthenticated ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                                        <span className="text-green-700 font-medium">
                                            Connecté en tant que {user?.firstName} {user?.lastName}
                                        </span>
                                    </div>
                                    <p className="text-green-600 text-sm mt-1">
                                        Vos informations sont pré-remplies automatiquement
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <UserIcon className="w-5 h-5 text-blue-500 mr-2" />
                                        <span className="text-blue-700 font-medium">
                                            Commande en tant qu'invité
                                        </span>
                                    </div>
                                    <p className="text-blue-600 text-sm mt-1">
                                        Vous pouvez vous connecter pour accélérer le processus
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Informations de livraison */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                📋 Informations de livraison
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.firstName}
                                        onChange={(e) => updateUserInfo('firstName', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="Votre prénom"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.lastName}
                                        onChange={(e) => updateUserInfo('lastName', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="Votre nom"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={userInfo.email}
                                        onChange={(e) => updateUserInfo('email', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="votre@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={userInfo.phone}
                                        onChange={(e) => updateUserInfo('phone', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="+237 6XX XXX XXX"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse complète <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={userInfo.address}
                                        onChange={(e) => updateUserInfo('address', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="Quartier, rue, immeuble, numéro..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.city}
                                        onChange={(e) => updateUserInfo('city', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="Douala, Yaoundé..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code postal
                                    </label>
                                    <input
                                        type="text"
                                        value={userInfo.postalCode}
                                        onChange={(e) => updateUserInfo('postalCode', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        placeholder="Code postal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mode de livraison */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                🚚 Mode de livraison
                            </h2>

                            <div className="space-y-3">
                                {Object.entries(deliveryOptions).map(([key, option]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${deliveryMode === key
                                            ? 'border-soni-navy bg-soni-navy/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="deliveryMode"
                                            value={key}
                                            checked={deliveryMode === key}
                                            onChange={(e) => setDeliveryMode(e.target.value)}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${deliveryMode === key ? 'border-soni-navy bg-soni-navy' : 'border-gray-300'
                                            }`}>
                                            {deliveryMode === key && (
                                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            )}
                                        </div>
                                        <span className="text-xl mr-3">{option.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-sm text-gray-600">{option.time}</div>
                                        </div>
                                        <div className="text-lg font-semibold text-soni-navy">
                                            {option.price === 0 ? 'Gratuit' : formatPrice(option.price)}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bouton de confirmation */}
                        <button
                            onClick={handleConfirmPayment}
                            className="w-full py-4 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform cursor-pointer"
                        >
                            <div className="flex items-center justify-center">
                                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                Confirmer le paiement
                            </div>
                        </button>
                    </div>

                    {/* Récapitulatif */}
                    <div className="lg:sticky lg:top-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">💰 Récapitulatif</h2>

                            {/* Articles */}
                            <div className="space-y-4 mb-6">
                                <h3 className="font-medium text-gray-900">Articles ({cart.length})</h3>
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-soni-navy">
                                            {formatPrice((item.salePrice || item.price) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Calculs */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="flex justify-between">
                                    <span>Sous-total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Livraison</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                        {shipping === 0 ? 'Gratuit ✨' : formatPrice(shipping)}
                                    </span>
                                </div>
                                <hr className="my-3" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-soni-navy">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'authentification */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {authMode === 'login' ? 'Se connecter' : 'Créer un compte'}
                            </h2>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            {authMode === 'register' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom
                                        </label>
                                        <input
                                            type="text"
                                            value={authInfo.firstName}
                                            onChange={(e) => updateAuthInfo('firstName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom
                                        </label>
                                        <input
                                            type="text"
                                            value={authInfo.lastName}
                                            onChange={(e) => updateAuthInfo('lastName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={authInfo.email}
                                    onChange={(e) => updateAuthInfo('email', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={authInfo.password}
                                        onChange={(e) => updateAuthInfo('password', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmer le mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        value={authInfo.confirmPassword}
                                        onChange={(e) => updateAuthInfo('confirmPassword', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-navy focus:border-transparent"
                                        required
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3 bg-soni-navy text-white font-semibold rounded-lg hover:bg-soni-navy/90 transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Traitement...
                                    </div>
                                ) : (
                                    authMode === 'login' ? 'Se connecter' : 'Créer le compte'
                                )}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                className="text-soni-navy hover:text-soni-navy/80 text-sm"
                            >
                                {authMode === 'login' ?
                                    'Pas de compte ? Créer un compte' :
                                    'Déjà un compte ? Se connecter'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de confirmation */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">📋 Bon de commande #{orderNumber}</h2>
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Détails de la commande */}
                        <div className="space-y-6">
                            {/* Informations client */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold mb-3">👤 Informations client</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Nom:</span> {userInfo.firstName} {userInfo.lastName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email:</span> {userInfo.email}
                                    </div>
                                    <div>
                                        <span className="font-medium">Téléphone:</span> {userInfo.phone}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium">Adresse:</span> {userInfo.address}, {userInfo.city}
                                    </div>
                                </div>
                            </div>

                            {/* Mode de livraison */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold mb-3">🚚 Livraison</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-2">{deliveryOptions[deliveryMode].icon}</span>
                                        <div>
                                            <div className="font-medium">{deliveryOptions[deliveryMode].label}</div>
                                            <div className="text-sm text-gray-600">
                                                {deliveryMode === 'pickup' ? 'Retrait immédiat' : `Livraison estimée: ${getEstimatedDeliveryDate()}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-semibold">
                                        {shipping === 0 ? 'Gratuit' : formatPrice(shipping)}
                                    </div>
                                </div>
                            </div>

                            {/* Articles commandés */}
                            <div>
                                <h3 className="font-semibold mb-3">🛍️ Articles commandés</h3>
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-soni-navy">
                                                {formatPrice((item.salePrice || item.price) * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-soni-navy/5 rounded-lg p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Sous-total:</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Livraison:</span>
                                        <span>{shipping === 0 ? 'Gratuit' : formatPrice(shipping)}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total à payer:</span>
                                        <span className="text-soni-navy">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 py-3 border border-gray-300 text-white font-semibold rounded-lg bg-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                                Modifier les informations
                            </button>
                            <button
                                onClick={handleFinalizeOrder}
                                disabled={isProcessing}
                                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center"> 
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 "></div>
                                        Finalisation...
                                    </div>
                                ) : (
                                    '✅ Confirmer la commande'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Checkout
