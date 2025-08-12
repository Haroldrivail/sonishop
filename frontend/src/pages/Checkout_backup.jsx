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
    const [authMode, setAuthMode] = useState('login') // 'login' ou 'register'
    const [showPassword, setShowPassword] = useState(false)

    // Informations de livraison - pré-remplies si utilisateur connecté
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Cameroun'
    })

    // Options de livraison
    const [deliveryOption, setDeliveryOption] = useState('standard')

    // Effet pour pré-remplir les informations si l'utilisateur est connecté
    useEffect(() => {
        if (isAuthenticated && user) {
            // Simulation des informations utilisateur stockées
            const savedProfile = {
                firstName: user.firstName || user.name?.split(' ')[0] || '',
                lastName: user.lastName || user.name?.split(' ')[1] || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postalCode: user.postalCode || '',
                country: user.country || 'Cameroun'
            }
            setShippingInfo(savedProfile)
        }
    }, [isAuthenticated, user])

    // Informations de paiement
    const [paymentInfo, setPaymentInfo] = useState({
        method: 'card', // card, mobile, transfer
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: '',
        mobileProvider: 'orange', // orange, mtn, camtel
        mobileNumber: ''
    })

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
    }, 0);
    const deliveryOptions = {
        standard: { price: 1000, time: '3-5 jours', label: 'Livraison standard' },
        express: { price: 3000, time: '1-2 jours', label: 'Livraison express' },
        pickup: { price: 0, time: 'Immédiate', label: 'Retrait en magasin' }
    }
    const shipping = deliveryOptions[deliveryOption].price
    const total = subtotal + shipping

    const handleShippingSubmit = (e) => {
        e.preventDefault()
        console.log('Formulaire de livraison soumis')
        console.log('Informations de livraison:', shippingInfo)
        
        if (validateShippingInfo()) {
            console.log('Validation réussie, passage à l\'étape 2')
            setStep(2)
        } else {
            console.log('Échec de la validation')
        }
    }

    const validateShippingInfo = () => {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city']
        const missing = []
        
        for (let field of required) {
            if (!shippingInfo[field].trim()) {
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
            showToast(`Champs requis manquants: ${missing.join(', ')}`, 'error')
            console.log('Champs manquants:', missing, 'État actuel:', shippingInfo)
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
            showToast('Email invalide', 'error')
            return false
        }
        
        // Validation spécifique pour les utilisateurs invités
        if (!isAuthenticated && isGuestCheckout) {
            showToast('Informations de livraison confirmées pour l\'invité', 'success')
        } else if (isAuthenticated) {
            showToast('Informations de livraison confirmées', 'success')
        }
        
        return true
    }

    const validatePaymentInfo = () => {
        if (paymentInfo.method === 'card') {
            const required = ['cardNumber', 'expiryDate', 'cvv', 'cardName']
            for (let field of required) {
                if (!paymentInfo[field].trim()) {
                    showToast(`Le champ ${field} est requis`, 'error')
                    return false
                }
            }
        } else if (paymentInfo.method === 'mobile') {
            if (!paymentInfo.mobileNumber.trim()) {
                showToast('Numéro de téléphone requis', 'error')
                return false
            }
        }
        return true
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        if (!validatePaymentInfo()) return

        setLoading(true)
        
        // Simulation de la validation du paiement
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            setStep(3) // Passer à l'étape de révision/finalisation
            showSuccess('Informations de paiement validées ✓')
        } catch (error) {
            console.error('Erreur lors de la validation du paiement:', error)
            showError('Erreur lors de la validation du paiement')
        } finally {
            setLoading(false)
        }
    }

    const handleFinalizeOrder = async () => {
        setFinalizing(true)
        
        try {
            // Simulation du traitement final de la commande
            await new Promise(resolve => setTimeout(resolve, 2500))
            
            // Générer un numéro de commande
            const newOrderNumber = `SN${Date.now().toString().slice(-6)}`
            setOrderNumber(newOrderNumber)
            
            // Sauvegarder la commande (simulation)
            const orderData = {
                orderNumber: newOrderNumber,
                items: cart,
                shippingInfo,
                paymentInfo: {
                    method: paymentInfo.method,
                    // Ne pas sauvegarder les données sensibles
                },
                deliveryOption,
                subtotal,
                shipping,
                total,
                date: new Date().toISOString(),
                status: 'confirmed',
                estimatedDelivery: getEstimatedDeliveryDate()
            }
            
            // Sauvegarder dans localStorage (en production, envoyer au serveur)
            const existingOrders = JSON.parse(localStorage.getItem('sonishop_orders') || '[]')
            existingOrders.push(orderData)
            localStorage.setItem('sonishop_orders', JSON.stringify(existingOrders))
            
            setStep(4) // Passer à la confirmation finale
            clearCart()
            showSuccess('Commande finalisée avec succès ! 🎉')
            showToast('Commande confirmée ! Email de confirmation envoyé.', 'success')
            
        } catch (error) {
            console.error('Erreur lors de la finalisation:', error)
            showError('Erreur lors de la finalisation de la commande')
            showToast('Erreur lors de la finalisation', 'error')
        } finally {
            setFinalizing(false)
        }
    }

    const getEstimatedDeliveryDate = () => {
        const today = new Date()
        const deliveryDays = deliveryOption === 'express' ? 2 : deliveryOption === 'standard' ? 5 : 0
        if (deliveryOption === 'pickup') return 'Disponible immédiatement'
        
        const deliveryDate = new Date(today)
        deliveryDate.setDate(today.getDate() + deliveryDays)
        return deliveryDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const updateShippingInfo = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }))
    }

    const updatePaymentInfo = (field, value) => {
        setPaymentInfo(prev => ({ ...prev, [field]: value }))
    }

    // Si le panier est vide et qu'on n'est pas aux étapes de finalisation/confirmation
    if (cart.length === 0 && step < 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Panier vide</h2>
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                {step === 4 ? 'Commande confirmée' : step === 3 ? 'Finaliser ma commande' : 'Passer ma commande'}
                            </h1>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <LockClosedIcon className="w-4 h-4 mr-1" />
                            Paiement sécurisé
                        </div>
                        {/* Debug: Affichage de l'étape actuelle en développement */}
                        <div className="text-xs text-gray-400 ml-4">
                            Étape {step}/3
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {step !== 3 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center ${step >= 1 ? 'text-soni-navy' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-soni-navy text-white' : 'bg-gray-200'}`}>
                                        {step > 1 ? <CheckIcon className="w-5 h-5" /> : '1'}
                                    </div>
                                    <span className="ml-2 font-medium">Livraison</span>
                                </div>
                                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-soni-navy' : 'bg-gray-200'}`}></div>
                                <div className={`flex items-center ${step >= 2 ? 'text-soni-navy' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-soni-navy text-white' : 'bg-gray-200'}`}>
                                        {step > 2 ? <CheckIcon className="w-5 h-5" /> : '2'}
                                    </div>
                                    <span className="ml-2 font-medium">Paiement</span>
                                </div>
                                <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-soni-navy' : 'bg-gray-200'}`}></div>
                                <div className={`flex items-center ${step >= 3 ? 'text-soni-navy' : 'text-gray-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-soni-navy text-white' : 'bg-gray-200'}`}>
                                        {step > 3 ? <CheckIcon className="w-5 h-5" /> : '3'}
                                    </div>
                                    <span className="ml-2 font-medium">Finalisation</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Section pour utilisateurs non connectés */}
                {!isAuthenticated && step === 1 && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Options de commande</h2>
                                <UserIcon className="w-6 h-6 text-soni-orange" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${isGuestCheckout ? 'border-soni-orange bg-soni-orange/5' : 'border-gray-200 hover:border-gray-300'}`}
                                     onClick={() => setIsGuestCheckout(true)}>
                                    <div className="flex items-center mb-2">
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${isGuestCheckout ? 'border-soni-orange bg-soni-orange' : 'border-gray-300'}`}>
                                            {isGuestCheckout && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                                        </div>
                                        <h3 className="font-medium">Continuer en tant qu'invité</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-7">Commandez rapidement sans créer de compte</p>
                                </div>

                                <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${!isGuestCheckout ? 'border-soni-orange bg-soni-orange/5' : 'border-gray-200 hover:border-gray-300'}`}
                                     onClick={() => setIsGuestCheckout(false)}>
                                    <div className="flex items-center mb-2">
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${!isGuestCheckout ? 'border-soni-orange bg-soni-orange' : 'border-gray-300'}`}>
                                            {!isGuestCheckout && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                                        </div>
                                        <h3 className="font-medium">Se connecter</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-7">
                                        Accédez à votre compte pour des informations pré-remplies
                                    </p>
                                </div>
                            </div>

                            {!isGuestCheckout && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex gap-3">
                                        <Link 
                                            to="/login"
                                            className="flex-1 px-4 py-2 bg-soni-navy text-white rounded-lg hover:bg-soni-navy/90 transition-colors text-center font-medium"
                                        >
                                            Se connecter
                                        </Link>
                                        <Link 
                                            to="/register"
                                            className="flex-1 px-4 py-2 border border-soni-navy text-soni-navy rounded-lg hover:bg-soni-navy/5 transition-colors text-center font-medium"
                                        >
                                            Créer un compte
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulaire de livraison */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleShippingSubmit} className="space-y-6">
                                {/* Informations personnelles */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {isAuthenticated ? 'Vérifiez vos informations de livraison' : 'Informations de livraison'}
                                        </h2>
                                        {isAuthenticated && (
                                            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                                ✓ Informations pré-remplies
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isAuthenticated && (
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Connecté en tant que:</strong> {user?.name || user?.email}
                                            </p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Vos informations sont automatiquement remplies. Vous pouvez les modifier si nécessaire.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.firstName}
                                                onChange={(e) => updateShippingInfo('firstName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.lastName}
                                                onChange={(e) => updateShippingInfo('lastName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={shippingInfo.email}
                                                onChange={(e) => updateShippingInfo('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                                            <input
                                                type="tel"
                                                value={shippingInfo.phone}
                                                onChange={(e) => updateShippingInfo('phone', e.target.value)}
                                                placeholder="+237 6XX XXX XXX"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
                                        <textarea
                                            value={shippingInfo.address}
                                            onChange={(e) => updateShippingInfo('address', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                            placeholder="Quartier, rue, immeuble, numéro..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.city}
                                                onChange={(e) => updateShippingInfo('city', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.postalCode}
                                                onChange={(e) => updateShippingInfo('postalCode', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                            <select
                                                value={shippingInfo.country}
                                                onChange={(e) => updateShippingInfo('country', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
                                            >
                                                <option value="Cameroun">Cameroun</option>
                                                <option value="Gabon">Gabon</option>
                                                <option value="Congo">Congo</option>
                                                <option value="RCA">RCA</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {!isAuthenticated && isGuestCheckout && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <UserIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-yellow-800">
                                                    💡 Créez votre compte SoniShop
                                                </h4>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    Créez un compte pour sauvegarder vos informations, suivre vos commandes et accélérer vos prochains achats.
                                                </p>
                                                <div className="mt-3">
                                                    <Link 
                                                        to="/register"
                                                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                                                    >
                                                        Créer un compte maintenant →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Options de livraison */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode de livraison</h2>
                                    
                                    <div className="space-y-3">
                                        {Object.entries(deliveryOptions).map(([key, option]) => (
                                            <label key={key} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${deliveryOption === key ? 'border-soni-orange bg-soni-orange/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="delivery"
                                                    value={key}
                                                    checked={deliveryOption === key}
                                                    onChange={(e) => setDeliveryOption(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${deliveryOption === key ? 'border-soni-orange bg-soni-orange' : 'border-gray-300'}`}>
                                                    {deliveryOption === key && (
                                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                    )}
                                                </div>
                                                <TruckIcon className="w-5 h-5 text-soni-orange mr-3" />
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

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-soni-navy text-white font-semibold rounded-lg hover:bg-soni-navy/90 transition-colors cursor-pointer"
                                >
                                    Continuer vers le paiement
                                </button>
                                
                                {/* Bouton de debug temporaire */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('État actuel des champs:', shippingInfo)
                                        console.log('Validation:', validateShippingInfo())
                                    }}
                                    className="w-full py-2 mt-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    🔍 Debug - Vérifier les champs
                                </button>
                            </form>
                        </div>

                        {/* Récapitulatif */}
                        <div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>
                                
                                {/* Articles */}
                                <div className="space-y-3 mb-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                <hr className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Sous-total</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Livraison</span>
                                        <span>{shipping === 0 ? 'Gratuit' : formatPrice(shipping)}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-soni-navy">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}             

                {step === 2 && (
                    <div className="max-w-4xl mx-auto">
                        {/* En-tête de révision */}
                        <div className="bg-gradient-to-r from-soni-navy to-blue-700 text-white rounded-xl p-6 mb-8">
                            <div className="text-center">
                                <CheckIcon className="w-12 h-12 mx-auto mb-4 text-green-300" />
                                <h2 className="text-2xl font-bold mb-2">Vérifiez votre commande</h2>
                                <p className="text-blue-100">
                                    Vos informations de paiement ont été validées. Veuillez vérifier les détails avant de finaliser.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Détails de la commande */}
                            <div className="space-y-6">
                                {/* Informations de livraison */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">📍 Livraison</h3>
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="text-soni-navy hover:text-soni-navy/80 text-sm font-medium"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="font-medium text-gray-900">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                        <p>{shippingInfo.address}</p>
                                        <p>{shippingInfo.city}, {shippingInfo.country}</p>
                                        <p>📞 {shippingInfo.phone}</p>
                                        <p>✉️ {shippingInfo.email}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center text-sm">
                                            <TruckIcon className="w-4 h-4 mr-2 text-soni-orange" />
                                            <span className="font-medium">{deliveryOptions[deliveryOption].label}</span>
                                            <span className="ml-auto text-soni-navy font-semibold">
                                                {deliveryOptions[deliveryOption].price === 0 ? 'Gratuit' : formatPrice(deliveryOptions[deliveryOption].price)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 ml-6">
                                            Livraison estimée : {getEstimatedDeliveryDate()}
                                        </p>
                                    </div>
                                </div>

                                {/* Informations de paiement */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">💳 Paiement</h3>
                                        <button 
                                            onClick={() => setStep(2)}
                                            className="text-soni-navy hover:text-soni-navy/80 text-sm font-medium"
                                        >
                                            Modifier
                                        </button>
                                    </div>
                                    <div className="flex items-center">
                                        {paymentInfo.method === 'card' && <CreditCardIcon className="w-6 h-6 mr-3 text-soni-orange" />}
                                        {paymentInfo.method === 'mobile' && <PhoneIcon className="w-6 h-6 mr-3 text-soni-orange" />}
                                        {paymentInfo.method === 'transfer' && <TruckIcon className="w-6 h-6 mr-3 text-soni-orange" />}
                                        <div>
                                            <p className="font-medium">
                                                {paymentInfo.method === 'card' && 'Carte bancaire'}
                                                {paymentInfo.method === 'mobile' && `${paymentInfo.mobileProvider.toUpperCase()} Money`}
                                                {paymentInfo.method === 'transfer' && 'Virement bancaire'}
                                            </p>
                                            {paymentInfo.method === 'card' && paymentInfo.cardNumber && (
                                                <p className="text-sm text-gray-600">**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                                            )}
                                            {paymentInfo.method === 'mobile' && paymentInfo.mobileNumber && (
                                                <p className="text-sm text-gray-600">{paymentInfo.mobileNumber}</p>
                                            )}
                                        </div>
                                        <CheckIcon className="w-5 h-5 text-green-500 ml-auto" />
                                    </div>
                                </div>

                                {/* Articles commandés */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🛍️ Articles ({cart.length})</h3>
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                                                    {item.salePrice && item.salePrice !== item.price && (
                                                        <p className="text-sm text-green-600">Prix promotionnel</p>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-soni-navy">
                                                    {formatPrice((item.salePrice || item.price) * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Récapitulatif final */}
                            <div className="lg:sticky lg:top-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">💰 Récapitulatif final</h3>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <span>Sous-total ({cart.reduce((sum, item) => sum + item.quantity, 0)} articles)</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Livraison</span>
                                            <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                                {shipping === 0 ? 'Gratuit ✨' : formatPrice(shipping)}
                                            </span>
                                        </div>
                                        <hr className="my-4" />
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total à payer</span>
                                            <span className="text-soni-navy">{formatPrice(total)}</span>
                                        </div>
                                    </div>

                                    {/* Conditions et finalisation */}
                                    <div className="space-y-4 mb-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-2">🛡️ Vos garanties</h4>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                                    <span>Paiement 100% sécurisé</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                                    <span>Garantie constructeur incluse</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                                                    <span>Retour gratuit sous 30 jours</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start text-xs text-gray-500">
                                            <input type="checkbox" className="mt-1 mr-2" defaultChecked />
                                            <span>
                                                En finalisant ma commande, j'accepte les{' '}
                                                <Link to="/terms" className="text-soni-navy hover:underline">conditions générales de vente</Link>
                                                {' '}et confirme avoir pris connaissance de la{' '}
                                                <Link to="/privacy" className="text-soni-navy hover:underline">politique de confidentialité</Link>.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bouton de finalisation */}
                                    <button
                                        onClick={handleFinalizeOrder}
                                        disabled={finalizing}
                                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {finalizing ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Finalisation en cours...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center text-white">
                                                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                                Finaliser ma commande 🚀
                                            </div>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-gray-500 mt-3">
                                        🔒 Votre commande sera confirmée définitivement
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckIcon className="w-8 h-8 text-green-600" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande confirmée !</h2>
                            <p className="text-gray-600 mb-6">
                                Votre commande a été enregistrée avec succès. Vous recevrez un email de confirmation à l'adresse {shippingInfo.email}.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Numéro de commande:</span>
                                    <span className="text-soni-navy font-semibold">#{orderNumber || `SN${Date.now().toString().slice(-6)}`}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-600">Montant total:</span>
                                    <span className="text-lg font-bold text-green-600">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm text-gray-600">Articles:</span>
                                    <span className="text-sm font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)} produit{cart.reduce((sum, item) => sum + item.quantity, 0) > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    to="/orders"
                                    className="block w-full py-3 bg-gradient-to-r from-soni-navy to-blue-700 hover:from-soni-navy/90 hover:to-blue-700/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                                >
                                    📋 Suivre ma commande
                                </Link>
                                <Link
                                    to="/products"
                                    className="block w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    🛍️ Continuer mes achats
                                </Link>
                                <Link
                                    to="/contact"
                                    className="block w-full py-2 text-soni-navy hover:text-soni-navy/80 transition-colors text-center text-sm"
                                >
                                    ❓ Besoin d'aide ? Contactez-nous
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Checkout
